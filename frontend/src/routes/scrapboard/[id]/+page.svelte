<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '../../../components/ui';
	import Note from '../../../components/Note.svelte';
	import NoteCreator from '../../../components/NoteCreator.svelte';
	import DrawingCanvas from '../../../components/DrawingCanvas.svelte';
	import ThemeSelector from '../../../components/ThemeSelector.svelte';
	import { createUndoRedoStore } from '$lib/undo';
	import { useAutoSave } from '$lib/autosave';
	import { addNotification } from '$lib/stores/ui';
	import type { PageData } from './$types';
	import type { Note as NoteType } from '$lib/schemas';

	export let data: PageData;

	let scrapboard = data.scrapboard;
	let notes: NoteType[] = [];
	let selectedNoteId: string | null = null;
	let showNoteCreator = false;
	let showDrawingCanvas = false;
	let isLoading = false;

	// Initialize undo/redo
	const undoRedo = createUndoRedoStore(50);

	// Initialize auto-save
	const autoSave = useAutoSave(scrapboard?.id || '');

	// Load notes on mount
	async function loadNotes() {
		if (!scrapboard) return;

		try {
			const response = await fetch(`/api/scrapboards/${scrapboard.id}/notes`);
			if (response.ok) {
				const data = await response.json();
				notes = data.notes || [];
			}
		} catch (error) {
			console.error('Error loading notes:', error);
		}
	}

	const handleAddNote = () => {
		showNoteCreator = true;
	};

	const handleNoteCreated = (newNote: NoteType) => {
		notes = [...notes, newNote];
		showNoteCreator = false;

		// Add to undo history
		undoRedo.addEntry({
			id: `create-${newNote.id}`,
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: newNote.id,
			currentState: newNote
		});
	};

	const handleUpdateNote = (noteId: string, updates: Partial<NoteType>) => {
		const noteIndex = notes.findIndex((n) => n.id === noteId);
		if (noteIndex === -1) return;

		const previousState = notes[noteIndex];
		const updatedNote = { ...previousState, ...updates };

		// Debounced auto-save
		autoSave.saveNote(noteId, updates);

		// Update local state
		notes[noteIndex] = updatedNote;
		notes = notes;

		// Add to undo history
		undoRedo.addEntry({
			id: `update-${noteId}-${Date.now()}`,
			timestamp: Date.now(),
			type: 'update',
			elementType: 'note',
			elementId: noteId,
			previousState,
			currentState: updatedNote
		});
	};

	const handleDeleteNote = async (noteId: string) => {
		const noteIndex = notes.findIndex((n) => n.id === noteId);
		if (noteIndex === -1) return;

		const deletedNote = notes[noteIndex];

		try {
			const response = await fetch(`/api/notes/${noteId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				addNotification('Failed to delete note', 'error');
				return;
			}

			// Remove from local state
			notes = notes.filter((n) => n.id !== noteId);

			// Add to undo history
			undoRedo.addEntry({
				id: `delete-${noteId}`,
				timestamp: Date.now(),
				type: 'delete',
				elementType: 'note',
				elementId: noteId,
				previousState: deletedNote,
				currentState: deletedNote
			});
		} catch (error) {
			console.error('Error deleting note:', error);
			addNotification('An unexpected error occurred', 'error');
		}
	};

	const handleUndo = () => {
		const entry = undoRedo.undo();
		if (!entry) {
			addNotification('Nothing to undo', 'info');
			return;
		}

		// Handle undo based on operation type
		// This is simplified; full implementation would need API calls
		addNotification('Undo: ' + entry.type, 'info');
	};

	const handleRedo = () => {
		const entry = undoRedo.redo();
		if (!entry) {
			addNotification('Nothing to redo', 'info');
			return;
		}

		addNotification('Redo: ' + entry.type, 'info');
	};

	const handleDrawingSaved = async (imageDataUrl: string) => {
		// Create handwritten note with drawing
		try {
			// In a full implementation, would upload image to Supabase Storage first
			// Then create note with imageUrl pointing to the stored image
			const response = await fetch('/api/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					scrapboardId: scrapboard?.id,
					type: 'handwritten',
					imageUrl: imageDataUrl, // In production, would be Supabase URL
					backgroundTheme: 'kraft_paper'
				})
			});

			const data = await response.json();
			if (response.ok) {
				handleNoteCreated(data.note);
			}
		} catch (error) {
			console.error('Error saving handwritten note:', error);
			addNotification('Failed to save handwritten note', 'error');
		}

		showDrawingCanvas = false;
	};

	const handleAddImage = () => {
		addNotification('Image upload feature coming in Phase 5', 'info');
	};

	const handleShare = () => {
		addNotification('Share feature coming in Phase 7', 'info');
	};

	const handleSettings = () => {
		addNotification('Settings feature coming soon', 'info');
	};

	// Load notes on component mount
	$: if (scrapboard && notes.length === 0) {
		loadNotes();
	}
</script>

<div class="scrapboard-container">
	<!-- Header -->
	<header class="scrapboard-header">
		<div class="header-left">
			<button class="back-button" on:click={() => goto('/dashboard')} title="Back to dashboard">
				← Back
			</button>
			<h1 class="scrapboard-title">{scrapboard?.title || 'Untitled Scrapboard'}</h1>
		</div>

		<div class="header-right">
			<div class="toolbar">
				<Button
					variant="secondary"
					size="sm"
					title="Undo (Ctrl+Z)"
					on:click={handleUndo}
				>
					↶ Undo
				</Button>
				<Button
					variant="secondary"
					size="sm"
					title="Redo (Ctrl+Y)"
					on:click={handleRedo}
				>
					↷ Redo
				</Button>
				<Button
					variant="primary"
					size="sm"
					on:click={handleAddNote}
				>
					+ Note
				</Button>
				<Button
					variant="primary"
					size="sm"
					on:click={handleAddImage}
				>
					+ Image
				</Button>
				<Button
					variant="secondary"
					size="sm"
					on:click={handleShare}
				>
					Share
				</Button>
				<Button
					variant="secondary"
					size="sm"
					on:click={handleSettings}
				>
					⚙
				</Button>
			</div>
		</div>
	</header>

	<!-- Canvas Area -->
	<main class="canvas-area">
		{#if showNoteCreator}
			<div class="modal-overlay" on:click={() => (showNoteCreator = false)}>
				<div class="modal-content" on:click|stopPropagation>
					<NoteCreator
						scrapboardId={scrapboard?.id || ''}
						onNoteCreated={handleNoteCreated}
						onCancel={() => (showNoteCreator = false)}
					/>
				</div>
			</div>
		{/if}

		{#if showDrawingCanvas}
			<div class="modal-overlay" on:click={() => (showDrawingCanvas = false)}>
				<div class="modal-content drawing" on:click|stopPropagation>
					<DrawingCanvas
						onSave={handleDrawingSaved}
						onCancel={() => (showDrawingCanvas = false)}
					/>
				</div>
			</div>
		{/if}

		<div class="canvas-container">
			{#if !scrapboard}
				<div class="loading-state">
					<div class="spinner" />
					<p>Loading scrapboard...</p>
				</div>
			{:else if notes.length === 0}
				<div class="blank-state">
					<div class="blank-icon">🎨</div>
					<h2>Your blank canvas awaits</h2>
					<p>Start creating! Add notes or images to begin building your scrapboard</p>
					<div class="blank-state-actions">
						<Button variant="primary" on:click={handleAddNote}>
							Create First Note
						</Button>
						<Button variant="secondary" on:click={handleAddImage}>
							Add Image
						</Button>
					</div>
				</div>
			{:else}
				<div class="canvas-content">
					{#each notes as note (note.id)}
						<Note
							note={note}
							scrapboardId={scrapboard?.id || ''}
							onDelete={handleDeleteNote}
							onUpdate={handleUpdateNote}
							onSelect={(id) => (selectedNoteId = id)}
						/>
					{/each}
				</div>

				<!-- Theme Selector for selected note -->
				{#if selectedNoteId}
					<div class="theme-selector-fixed">
						<ThemeSelector
							scrapboardId={scrapboard?.id || ''}
							selectedNoteId={selectedNoteId}
							onThemeSelected={(noteId, theme) => {
								handleUpdateNote(noteId, { backgroundTheme: theme });
							}}
						/>
					</div>
				{/if}
			{/if}
		</div>
	</main>
</div>

<style>
	.scrapboard-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #fafafa;
	}

	.scrapboard-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 2rem;
		background: white;
		border-bottom: 1px solid var(--color-gray-200);
		box-shadow: var(--shadow-sm);
		gap: 2rem;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		min-width: 0;
	}

	.back-button {
		background: none;
		border: none;
		color: var(--color-gray-600);
		cursor: pointer;
		font-size: 1rem;
		padding: 0.5rem;
		transition: color var(--transition-normal);
	}

	.back-button:hover {
		color: var(--color-gray-900);
	}

	.scrapboard-title {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-gray-900);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.toolbar {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.canvas-area {
		flex: 1;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.canvas-container {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #f5f5f5 0%, #efefef 100%);
		position: relative;
		overflow: auto;
	}

	.loading-state,
	.blank-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		background: white;
		padding: 3rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		max-width: 400px;
	}

	.spinner {
		display: inline-block;
		width: 2rem;
		height: 2rem;
		border: 3px solid rgba(0, 0, 0, 0.1);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-state p {
		margin-top: 1rem;
		color: var(--color-gray-600);
	}

	.blank-icon {
		font-size: 3.5rem;
		margin-bottom: 1rem;
	}

	.blank-state h2 {
		margin: 1rem 0 0.5rem 0;
		font-size: 1.5rem;
		color: var(--color-gray-900);
	}

	.blank-state p {
		color: var(--color-gray-600);
		margin-bottom: 1.5rem;
	}

	.blank-state-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.canvas-content {
		width: 100%;
		height: 100%;
		padding: 2rem;
		position: relative;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: var(--radius-lg);
		padding: 2rem;
		max-height: 90vh;
		overflow-y: auto;
		max-width: 500px;
	}

	.modal-content.drawing {
		max-width: 90vw;
		max-height: 80vh;
		padding: 0;
	}

	.theme-selector-fixed {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 100;
	}

	@media (max-width: 768px) {
		.scrapboard-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
			padding: 1rem;
		}

		.header-right {
			width: 100%;
		}

		.toolbar {
			width: 100%;
		}

		.blank-state {
			padding: 2rem;
			max-width: 90%;
		}

		.blank-icon {
			font-size: 2.5rem;
		}

		.modal-content {
			max-width: 95vw;
			padding: 1rem;
		}

		.theme-selector-fixed {
			bottom: 1rem;
			right: 1rem;
		}
	}
</style>
