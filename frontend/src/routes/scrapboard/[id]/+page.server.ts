import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;

	// Require authentication
	const {
		data: { user },
		error: userError,
	} = await locals.supabase.auth.getUser();

	if (userError || !user) {
		throw redirect(302, '/auth/login');
	}

	try {
		// Fetch the scrapboard
		const { data: scrapboard, error: fetchError } = await locals.supabase
			.from('scrapboards')
			.select('id, title, description, owner_user_id, visibility, created_at, updated_at')
			.eq('id', id)
			.is('deleted_at', null)
			.single();

		if (fetchError || !scrapboard) {
			throw redirect(302, '/dashboard');
		}

		// Check if user owns this scrapboard or has access via share token
		if (scrapboard.owner_user_id !== user.id) {
			// TODO: Check shared access when share functionality is implemented
			throw redirect(302, '/dashboard');
		}

		return {
			scrapboard: {
				id: scrapboard.id,
				title: scrapboard.title,
				description: scrapboard.description,
				visibility: scrapboard.visibility,
				createdAt: scrapboard.created_at,
				updatedAt: scrapboard.updated_at,
			},
		};
	} catch (error) {
		console.error('Scrapboard load error:', error);
		throw redirect(302, '/dashboard');
	}
};
