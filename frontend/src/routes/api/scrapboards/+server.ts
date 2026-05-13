import { json } from '@sveltejs/kit';
import { CreateScrapboardSchema } from '$lib/schemas';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check authentication
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();

		if (authError || !user) {
			return json(
				{ message: 'Unauthorized' },
				{ status: 401 }
			);
		}

		// Parse and validate request body
		const body = await request.json();
		const validation = CreateScrapboardSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{
					message: 'Validation error',
					errors: validation.error.flatten()
				},
				{ status: 400 }
			);
		}

		const { title, description } = validation.data;

		// Create scrapboard in database
		const { data: scrapboard, error: createError } = await locals.supabase
			.from('scrapboards')
			.insert({
				owner_user_id: user.id,
				title,
				description,
				visibility: 'private',
				share_token: null
			})
			.select()
			.single();

		if (createError) {
			console.error('Error creating scrapboard:', createError);
			return json(
				{ message: 'Failed to create scrapboard' },
				{ status: 500 }
			);
		}

		return json(
			{
				success: true,
				scrapboard: {
					id: scrapboard.id,
					title: scrapboard.title,
					description: scrapboard.description,
					visibility: scrapboard.visibility
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Create scrapboard error:', error);
		return json(
			{ message: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
};
