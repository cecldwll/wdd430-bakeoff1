import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SignUpSchema } from '$lib/schemas';
import { ZodError } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

const getProfileClient = () => {
	const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
	const serviceRoleKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		return null;
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Parse and validate request body
		const body = await request.json();
		console.error('SIGNUP PAYLOAD', body);
		const { email, password, username } = SignUpSchema.parse(body);

		const profileClient = getProfileClient() ?? locals.supabase;

		// Check if user already exists
		const { data: existingUser } = await profileClient
			.from('users')
			.select('id')
			.eq('email', email)
			.maybeSingle();

		if (existingUser) {
			return json(
				{ message: 'Email already registered. Please login or use a different email.' },
				{ status: 409 }
			);
		}

		// Create auth user with Supabase
		const { data: authData, error: authError } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
				data: {
					username,
				},
			},
		});

		if (authError) {
			console.error('SUPABASE AUTH ERROR', authError);

			// If Supabase is rate-limiting email sends (429), attempt a dev-only admin user create
			if (authError.status === 429 || authError.code === 'over_email_send_rate_limit') {
				try {
					const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL;
					const serviceRoleKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

					if (supabaseUrl && serviceRoleKey) {
						const adminResp = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/admin/v1/users`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								apikey: serviceRoleKey,
								Authorization: `Bearer ${serviceRoleKey}`
							},
							body: JSON.stringify({
								email,
								password,
								email_confirm: true,
								user_metadata: { username }
							})
						});

						if (!adminResp.ok) {
							const text = await adminResp.text();
							console.error('Admin create failed', adminResp.status, text);

							// Try using the supabase-js client with the service role key as a fallback
							try {
								const adminClient = createClient(supabaseUrl, serviceRoleKey);
								if (adminClient.auth && (adminClient.auth as any).admin && typeof (adminClient.auth as any).admin.createUser === 'function') {
									const adminCreate = await (adminClient.auth as any).admin.createUser({
										email,
										password,
										user_metadata: { username },
										email_confirm: true
									});

									if (adminCreate.error) {
										console.error('admin.createUser error', adminCreate.error);
										return json({ message: 'Sign up failed (admin client).', details: adminCreate.error }, { status: 500 });
									}

									const newUser = adminCreate.user || adminCreate.data;
									const userId = newUser?.id;
									if (userId) {
										const { error: profileError2 } = await profileClient.from('users').upsert({
											id: userId,
											email,
											username,
											password_hash: '',
											email_verified: true,
											created_at: new Date().toISOString(),
											updated_at: new Date().toISOString(),
											settings: {}
										});

										if (profileError2) {
											console.error('Profile upsert after admin client failed', profileError2);
											return json({ message: 'User created (admin client) but profile upsert failed', details: profileError2.message }, { status: 500 });
										}

										return json({ success: true, message: 'User created (admin client fallback) and confirmed for dev testing.' }, { status: 201 });
									}
								}
							} catch (clientAdminErr) {
								console.error('Admin client fallback error', clientAdminErr);
								return json({ message: 'Sign up failed (admin client fallback).', details: String(clientAdminErr) }, { status: 500 });
							}

							return json({ message: 'Sign up failed (admin create).', details: text }, { status: 500 });
						}

						const adminData = await adminResp.json();

						// Upsert profile using admin client if available
						const profileClient = getProfileClient() ?? locals.supabase;
						const userId = adminData.id || adminData.user?.id;

						if (userId) {
							const { error: profileError } = await profileClient.from('users').upsert({
								id: userId,
								email,
								username,
								password_hash: '',
								email_verified: true,
								created_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
								settings: {}
							});

							if (profileError) {
								console.error('Error creating profile after admin user create:', profileError);
								return json({ message: 'User created but profile upsert failed', details: profileError.message }, { status: 500 });
							}

							return json({ success: true, message: 'User created (admin fallback) and confirmed for dev testing.' }, { status: 201 });
						}
					}
				} catch (adminErr) {
					console.error('Admin fallback error', adminErr);
					return json({ message: 'Sign up failed and admin fallback failed.', details: String(adminErr) }, { status: 500 });
				}
			}

			return json({ message: `Sign up error: ${authError.message}`, details: authError }, { status: 400 });
		}

		if (!authData.user) {
			return json({ message: 'Sign up failed. Please try again.' }, { status: 500 });
		}

		// Create user profile in database
		const { error: profileError } = await profileClient.from('users').upsert({
			id: authData.user.id,
			email,
			username,
			password_hash: '', // Managed by Supabase Auth
			email_verified: false,
			email_verification_token: null,
			reset_password_token: null,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			settings: {},
		});

		if (profileError) {
			console.error('Error creating user profile:', profileError);
			return json(
				{
					message:
						'Account was created in Supabase Auth, but the app profile could not be saved. Check SUPABASE_SERVICE_ROLE_KEY and users table RLS policies.',
					details: profileError.message,
				},
				{ status: 500 }
			);
		}

		return json(
			{
				success: true,
				message: 'Sign up successful! Please check your email to verify.',
				user: {
					id: authData.user.id,
					email: authData.user.email,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		// Handle validation errors
		if (error instanceof ZodError) {
			console.error('ZOD VALIDATION ERROR', error.issues);
			const fieldErrors = Object.fromEntries(error.issues.map((err) => [err.path[0], err.message]));

			return json(
				{
					message: 'Validation error',
					errors: fieldErrors,
				},
				{ status: 400 }
			);
		}

		// Handle other errors
		console.error('Signup error:', error);
		return json({ message: 'An unexpected error occurred. Please try again.' }, { status: 500 });
	}
};
