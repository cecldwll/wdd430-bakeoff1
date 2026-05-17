import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/scrapboards/[id]/notes
 * Fetch all notes for a scrapboard
 *
 * Query parameters:
 * - none currently
 *
 * Response:
 * - 200: { notes: Note[] }
 * - 401: Unauthorized
 * - 404: Scrapboard not found
 * - 500: Server error
 */
export const GET: RequestHandler = async ({ params, locals }) => {
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

		// Verify user owns scrapboard
		const { data: scrapboard, error: sbError } = await locals.supabase
			.from('scrapboards')
			.select('owner_user_id')
			.eq('id', id)
			.is('deleted_at', null)
			.single();

		if (sbError || !scrapboard) {
			return json({ message: 'Scrapboard not found' }, { status: 404 });
		}

		if (scrapboard.owner_user_id !== user.id) {
			return json({ message: 'Forbidden' }, { status: 403 });
		}

		// Fetch all non-deleted notes for the scrapboard
		const { data: notes, error: notesError } = await locals.supabase
			.from('notes')
			.select('*')
			.eq('scrapboard_id', id)
			.is('deleted_at', null)
			.order('z_order', { ascending: true });

		if (notesError) {
			console.error('Error fetching notes:', notesError);
			return json({ message: 'Failed to fetch notes' }, { status: 500 });
		}

		// Transform to client format
		const transformedNotes = (notes || []).map((note) => ({
			id: note.id,
			scrapboardId: note.scrapboard_id,
			type: note.type,
			content: note.content,
			imageUrl: note.image_url,
			positionX: note.position_x,
			positionY: note.position_y,
			width: note.width,
			height: note.height,
			backgroundTheme: note.background_theme,
			zOrder: note.z_order,
			createdAt: note.created_at,
			updatedAt: note.updated_at,
		}));

		return json({ notes: transformedNotes }, { status: 200 });
	} catch (error) {
		console.error('Fetch notes error:', error);
		return json({ message: 'An unexpected error occurred' }, { status: 500 });
	}
};
