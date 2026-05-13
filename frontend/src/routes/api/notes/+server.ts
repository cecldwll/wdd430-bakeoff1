import { json } from '@sveltejs/kit';
import { CreateNoteSchema } from '$lib/schemas';
import type { RequestHandler } from './$types';

/**
 * POST /api/notes
 * Create a new note (typed or handwritten) on a scrapboard
 *
 * Request body:
 * - scrapboardId: UUID of the scrapboard
 * - type: 'typed' or 'handwritten'
 * - content: text content (for typed notes)
 * - imageUrl: URL of handwritten note image (for handwritten notes)
 * - positionX: X coordinate (default 0)
 * - positionY: Y coordinate (default 0)
 * - width: note width in pixels (default 200)
 * - height: note height in pixels (default 150)
 * - backgroundTheme: one of the theme options
 *
 * Response:
 * - 201: { success: true, note: Note }
 * - 400: Validation error
 * - 401: Unauthorized
 * - 404: Scrapboard not found
 * - 500: Server error
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check authentication
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();

		if (authError || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		// Parse and validate request
		const body = await request.json();
		const validation = CreateNoteSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{
					message: 'Validation error',
					errors: validation.error.flatten()
				},
				{ status: 400 }
			);
		}

		const {
			scrapboardId,
			type,
			content,
			imageUrl,
			positionX,
			positionY,
			width,
			height,
			backgroundTheme
		} = validation.data;

		// Verify user owns the scrapboard
		const { data: scrapboard, error: sbError } = await locals.supabase
			.from('scrapboards')
			.select('owner_user_id')
			.eq('id', scrapboardId)
			.single();

		if (sbError || !scrapboard) {
			return json({ message: 'Scrapboard not found' }, { status: 404 });
		}

		if (scrapboard.owner_user_id !== user.id) {
			return json({ message: 'Forbidden' }, { status: 403 });
		}

		// Get max z-order for this scrapboard
		const { data: maxZOrder, error: zError } = await locals.supabase
			.from('notes')
			.select('z_order')
			.eq('scrapboard_id', scrapboardId)
			.is('deleted_at', null)
			.order('z_order', { ascending: false })
			.limit(1)
			.single();

		const nextZOrder = (maxZOrder?.z_order || 0) + 1;

		// Create note
		const { data: note, error: createError } = await locals.supabase
			.from('notes')
			.insert({
				scrapboard_id: scrapboardId,
				type,
				content: type === 'typed' ? content : null,
				image_url: type === 'handwritten' ? imageUrl : null,
				position_x: positionX,
				position_y: positionY,
				width,
				height,
				background_theme: backgroundTheme,
				z_order: nextZOrder
			})
			.select()
			.single();

		if (createError) {
			console.error('Error creating note:', createError);
			return json({ message: 'Failed to create note' }, { status: 500 });
		}

		return json(
			{
				success: true,
				note: {
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
					createdAt: note.created_at
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Create note error:', error);
		return json(
			{ message: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
};
