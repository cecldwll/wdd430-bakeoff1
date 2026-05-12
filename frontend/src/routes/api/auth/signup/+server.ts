import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SignUpSchema } from '$lib/schemas';
import { ZodError } from 'zod';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Parse and validate request body
		const body = await request.json();
		const { email, password, username } = SignUpSchema.parse(body);

		// Check if user already exists
		const { data: existingUser } = await locals.supabase
			.from('users')
			.select('id')
			.eq('email', email)
			.single();

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
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
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
		const { error: profileError } = await locals.supabase.from('users').insert({
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
			// Still consider signup successful since auth user was created
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
				error.errors.map((err) => [
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
