import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { email } = await request.json();

		if (!email) {
			return json(
				{ message: 'Email is required' },
				{ status: 400 }
			);
		}

		// Resend verification email
		const { error } = await locals.supabase.auth.resend({
			type: 'signup',
			email,
			options: {
				emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
			}
		});

		if (error) {
			return json(
				{ message: `Error resending verification: ${error.message}` },
				{ status: 400 }
			);
		}

		return json(
			{
				success: true,
				message: 'Verification code sent to your email'
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Resend verification error:', error);
		return json(
			{ message: 'An unexpected error occurred. Please try again.' },
			{ status: 500 }
		);
	}
};
