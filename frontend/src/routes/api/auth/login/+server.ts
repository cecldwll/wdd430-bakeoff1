import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { LoginSchema } from '$lib/schemas';
import { ZodError } from 'zod';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();
		const { email, password } = LoginSchema.parse(body);

		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return json({ message: error.message }, { status: 401 });
		}

		return json({
			success: true,
			user: data.user,
		});
	} catch (error) {
		if (error instanceof ZodError) {
			return json(
				{
					message: 'Validation error',
					errors: Object.fromEntries(error.issues.map((issue) => [issue.path[0], issue.message])),
				},
				{ status: 400 }
			);
		}

		console.error('Login error:', error);
		return json({ message: 'An unexpected error occurred. Please try again.' }, { status: 500 });
	}
};
