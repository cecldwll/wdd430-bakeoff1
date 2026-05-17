import { json } from '@sveltejs/kit';
import { UpdateNoteSchema } from '$lib/schemas';
import type { RequestHandler } from './$types';

type NoteWithOwner = {
	id: string;
	scrapboard_id: string;
	scrapboards: { owner_user_id: string } | { owner_user_id: string }[];
};

const getOwnerId = (note: NoteWithOwner) => {
	const scrapboard = Array.isArray(note.scrapboards) ? note.scrapboards[0] : note.scrapboards;
	return scrapboard?.owner_user_id;
};

/**
 * PATCH /api/notes/[id]
 * Update a note's properties (content, position, size, theme)
 *
 * Request body: Any combination of:
 * - content: update text content
 * - positionX: new X coordinate
 * - positionY: new Y coordinate
 * - width: new width
 * - height: new height
 * - backgroundTheme: new theme
 * - zOrder: new z-order (for layering)
 *
 * Response:
 * - 200: { success: true, note: Note }
 * - 400: Validation error
 * - 401: Unauthorized
 * - 404: Note not found
 * - 403: Forbidden (not note owner)
 * - 500: Server error
 */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { id } = params;

		// Check authentication
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();

		if (authError || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		// Get the note and verify ownership through scrapboard
		const { data: note, error: fetchError } = await locals.supabase
			.from('notes')
			.select(
				`id, scrapboard_id, 
			 scrapboards!inner(owner_user_id)`
			)
			.eq('id', id)
			.is('deleted_at', null)
			.single();

		if (fetchError || !note) {
			return json({ message: 'Note not found' }, { status: 404 });
		}

		if (getOwnerId(note as NoteWithOwner) !== user.id) {
			return json({ message: 'Forbidden' }, { status: 403 });
		}

		// Parse and validate update
		const body = await request.json();
		const validation = UpdateNoteSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{
					message: 'Validation error',
					errors: validation.error.flatten()
				},
				{ status: 400 }
			);
		}

		const updateData = validation.data;

		// Build update object - only include provided fields
		const updates: Record<string, any> = {};
		if (updateData.content !== undefined) updates.content = updateData.content;
		if (updateData.positionX !== undefined) updates.position_x = updateData.positionX;
		if (updateData.positionY !== undefined) updates.position_y = updateData.positionY;
		if (updateData.width !== undefined) updates.width = updateData.width;
		if (updateData.height !== undefined) updates.height = updateData.height;
		if (updateData.backgroundTheme !== undefined)
			updates.background_theme = updateData.backgroundTheme;
		if (updateData.zOrder !== undefined) updates.z_order = updateData.zOrder;
		updates.updated_at = new Date().toISOString();

		// Update the note
		const { data: updatedNote, error: updateError } = await locals.supabase
			.from('notes')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (updateError) {
			console.error('Error updating note:', updateError);
			return json({ message: 'Failed to update note' }, { status: 500 });
		}

		return json(
			{
				success: true,
				note: {
					id: updatedNote.id,
					scrapboardId: updatedNote.scrapboard_id,
					type: updatedNote.type,
					content: updatedNote.content,
					imageUrl: updatedNote.image_url,
					positionX: updatedNote.position_x,
					positionY: updatedNote.position_y,
					width: updatedNote.width,
					height: updatedNote.height,
					backgroundTheme: updatedNote.background_theme,
					zOrder: updatedNote.z_order,
					updatedAt: updatedNote.updated_at
				}
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Update note error:', error);
		return json(
			{ message: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
};

/**
 * DELETE /api/notes/[id]
 * Soft-delete a note (marks with deleted_at timestamp)
 *
 * Response:
 * - 200: { success: true, message: 'Note deleted' }
 * - 401: Unauthorized
 * - 404: Note not found
 * - 403: Forbidden
 * - 500: Server error
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { id } = params;

		// Check authentication
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();

		if (authError || !user) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}

		// Verify ownership
		const { data: note, error: fetchError } = await locals.supabase
			.from('notes')
			.select(
				`id, scrapboard_id, 
			 scrapboards!inner(owner_user_id)`
			)
			.eq('id', id)
			.is('deleted_at', null)
			.single();

		if (fetchError || !note) {
			return json({ message: 'Note not found' }, { status: 404 });
		}

		if (getOwnerId(note as NoteWithOwner) !== user.id) {
			return json({ message: 'Forbidden' }, { status: 403 });
		}

		// Soft delete
		const { error: deleteError } = await locals.supabase
			.from('notes')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', id);

		if (deleteError) {
			console.error('Error deleting note:', deleteError);
			return json({ message: 'Failed to delete note' }, { status: 500 });
		}

		return json(
			{ success: true, message: 'Note deleted' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Delete note error:', error);
		return json(
			{ message: 'An unexpected error occurred' },
			{ status: 500 }
		);
	}
};
