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
			persistSession: false
		}
	});
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Parse and validate request body
		const body = await request.json();
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
					username
				}
			}
		});

		if (authError) {
			return json(
				{ message: `Sign up error: ${authError.message}` },
				{ status: 400 }
			);
		}

		if (!authData.user) {
			return json(
				{ message: 'Sign up failed. Please try again.' },
				{ status: 500 }
			);
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
			settings: {}
		});

		if (profileError) {
			console.error('Error creating user profile:', profileError);
			return json(
				{
					message:
						'Account was created in Supabase Auth, but the app profile could not be saved. Check SUPABASE_SERVICE_ROLE_KEY and users table RLS policies.',
					details: profileError.message
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
					email: authData.user.email
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		// Handle validation errors
		if (error instanceof ZodError) {
			const fieldErrors = Object.fromEntries(
				error.issues.map((err) => [
					err.path[0],
					err.message
				])
			);

			return json(
				{
					message: 'Validation error',
					errors: fieldErrors
				},
				{ status: 400 }
			);
		}

		// Handle other errors
		console.error('Signup error:', error);
		return json(
			{ message: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
};
