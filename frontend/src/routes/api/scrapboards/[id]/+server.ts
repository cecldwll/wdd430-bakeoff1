import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { id } = params;

		// Check authentication
		const {
			data: { user },
			error: authError,
		} = await locals.supabase.auth.getUser();

		if (authError || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		// Verify ownership before deleting
		const { data: scrapboard, error: fetchError } = await locals.supabase
			.from('scrapboards')
			.select('owner_user_id')
			.eq('id', id)
			.single();

		if (fetchError || !scrapboard) {
			return json({ message: 'Scrapboard not found' }, { status: 404 });
		}

		if (scrapboard.owner_user_id !== user.id) {
			return json({ message: 'Forbidden - you do not own this scrapboard' }, { status: 403 });
		}

		// Soft delete the scrapboard
		const { error: deleteError } = await locals.supabase
			.from('scrapboards')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', id);

		if (deleteError) {
			console.error('Error deleting scrapboard:', deleteError);
			return json({ message: 'Failed to delete scrapboard' }, { status: 500 });
		}

		return json({ success: true, message: 'Scrapboard deleted' }, { status: 200 });
	} catch (error) {
		console.error('Delete error:', error);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
};
