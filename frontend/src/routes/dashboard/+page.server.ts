import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication - redirects to login if not authenticated
	const {
		data: { user },
		error: userError,
	} = await locals.supabase.auth.getUser();

	if (userError || !user) {
		throw redirect(302, '/auth/login');
	}

	try {
		// Fetch user's scrapboards
		const { data: scrapboards, error: fetchError } = await locals.supabase
			.from('scrapboards')
			.select('id, title, description, visibility, created_at')
			.eq('owner_user_id', user.id)
			.is('deleted_at', null)
			.order('created_at', { ascending: false });

		if (fetchError) {
			console.error('Error fetching scrapboards:', fetchError);
			return {
				scrapboards: [],
			};
		}

		// Transform database response to match UI expectations
		const transformedScrapboards = (scrapboards || []).map((sb) => ({
			id: sb.id,
			title: sb.title,
			description: sb.description,
			visibility: sb.visibility,
			createdAt: sb.created_at,
			itemCount: 0, // Will be populated by a separate query if needed
		}));

		return {
			scrapboards: transformedScrapboards,
		};
	} catch (error) {
		console.error('Dashboard load error:', error);
		return {
			scrapboards: [],
		};
	}
};
