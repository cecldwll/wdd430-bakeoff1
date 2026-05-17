import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	try {
		// Get the token from query parameters or request body
		const { email, token } = await request.json();

		if (!token) {
			return json(
				{ message: 'Verification token is required' },
				{ status: 400 }
			);
		}

		// Verify the email with Supabase
		const { data, error } = email
			? await locals.supabase.auth.verifyOtp({
					email,
					token,
					type: 'signup'
				})
			: await locals.supabase.auth.verifyOtp({
					token_hash: token,
					type: 'signup'
				});

		if (error) {
			return json(
				{ message: `Verification error: ${error.message}` },
				{ status: 400 }
			);
		}

		if (!data.user) {
			return json(
				{ message: 'Verification failed. Please try again.' },
				{ status: 400 }
			);
		}

		// Update user profile to mark email as verified
		const { error: updateError } = await locals.supabase
			.from('users')
			.update({
				email_verified: true,
				email_verification_token: null,
				updated_at: new Date().toISOString()
			})
			.eq('id', data.user.id);

		if (updateError) {
			console.error('Error updating email verification status:', updateError);
			// Still consider verification successful since auth accepted it
		}

		return json(
			{
				success: true,
				message: 'Email verified successfully!',
				user: {
					id: data.user.id,
					email: data.user.email,
					emailVerified: true
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Email verification error:', error);
		return json(
			{ message: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
};
