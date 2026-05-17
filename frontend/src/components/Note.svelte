<script lang="ts">
	import { Button } from './ui';
	import { addNotification } from '$lib/stores/ui';
	import type { Note } from '$lib/schemas';

	export let note: Note;
	export let scrapboardId: string;
	export let onDelete: ((noteId: string) => void) | undefined = undefined;
	export let onUpdate: ((noteId: string, updates: Partial<Note>) => void) | undefined = undefined;
	export let onSelect: ((noteId: string) => void) | undefined = undefined;

	let isDragging = false;
	let dragOffsetX = 0;
	let dragOffsetY = 0;
	let isEditing = false;
	let editContent = note.content || '';
	let showOptions = false;

	function handleMouseDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.note-options')) return;

		isDragging = true;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		dragOffsetX = e.clientX - rect.left;
		dragOffsetY = e.clientY - rect.top;

		if (onSelect) {
			onSelect(note.id);
		}

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;

		const canvas = document.querySelector('.canvas-container');
		if (!canvas) return;

		const canvasRect = canvas.getBoundingClientRect();
		const newX = e.clientX - canvasRect.left - dragOffsetX;
		const newY = e.clientY - canvasRect.top - dragOffsetY;

		// Update position
		if (onUpdate) {
			onUpdate(note.id, {
				...note,
				positionX: Math.max(0, newX),
				positionY: Math.max(0, newY)
			});
		}
	}

	function handleMouseUp() {
		isDragging = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	function handleEdit() {
		isEditing = true;
		showOptions = false;
	}

	function handleSaveEdit() {
		if (!editContent.trim()) {
			addNotification('Note cannot be empty', 'error');
			return;
		}

		if (onUpdate) {
			onUpdate(note.id, {
				...note,
				content: editContent
			});
		}

		isEditing = false;
		addNotification('Note updated', 'success');
	}

	function handleCancelEdit() {
		editContent = note.content || '';
		isEditing = false;
	}

	function handleDelete() {
		if (confirm('Delete this note?')) {
			if (onDelete) {
				onDelete(note.id);
			}
			addNotification('Note deleted', 'success');
		}
	}

	function handleToggleOptions() {
		showOptions = !showOptions;
	}

	$: themeClass = `theme-${note.backgroundTheme}`;
</script>

<div
	class="note"
	class:editing={isEditing}
	class:dragging={isDragging}
	class:has-image={note.type === 'handwritten'}
	style="
		left: {note.positionX}px;
		top: {note.positionY}px;
		width: {note.width}px;
		height: {note.height}px;
		z-index: {note.zOrder};
	"
	on:mousedown={handleMouseDown}
	role="button"
	tabindex="0"
>
	<!-- Note Content -->
	<div class={`note-content ${themeClass}`}>
		{#if note.type === 'handwritten' && note.imageUrl}
			<img src={note.imageUrl} alt="Handwritten note" class="note-image" />
		{:else if isEditing && note.type === 'typed'}
			<textarea
				bind:value={editContent}
				class="note-textarea"
				on:click|stopPropagation
				on:mousedown|stopPropagation
			></textarea>
		{:else}
			<div class="note-text">
				{note.content || 'Empty note'}
			</div>
		{/if}
	</div>

	<!-- Note Footer with Theme Badge -->
	<div class="note-footer">
		<span class="note-type">
			{#if note.type === 'typed'}
				✎
			{:else}
				🎨
			{/if}
		</span>
		<span class="note-theme">{note.backgroundTheme}</span>
	</div>

	<!-- Options Button -->
	{#if !isEditing}
		<button
			class="note-options-btn"
			on:click|stopPropagation={handleToggleOptions}
			title="Note options"
		>
			⋮
		</button>

		<!-- Options Menu -->
		{#if showOptions}
			<div class="note-options" on:click|stopPropagation={() => {}}>
				{#if note.type === 'typed'}
					<button class="option-item" on:click={handleEdit}>
						Edit Text
					</button>
				{/if}
				<button class="option-item" on:click={handleDelete}>
					Delete
				</button>
			</div>
		{/if}
	{/if}

	<!-- Edit Mode Actions -->
	{#if isEditing}
		<div class="edit-actions">
			<button class="edit-btn save" on:click|stopPropagation={handleSaveEdit} title="Save">
				✓
			</button>
			<button class="edit-btn cancel" on:click|stopPropagation={handleCancelEdit} title="Cancel">
				✕
			</button>
		</div>
	{/if}
</div>

<style>
	.note {
		position: absolute;
		border-radius: 4px;
		cursor: move;
		box-shadow: var(--shadow-md);
		transition: box-shadow 0.2s;
		user-select: none;
		overflow: hidden;
	}

	.note:hover {
		box-shadow: var(--shadow-lg);
	}

	.note.dragging {
		opacity: 0.9;
		box-shadow: var(--shadow-xl);
	}

	.note.editing {
		box-shadow: 3px 3px 0px var(--color-blue-500);
	}

	.note-content {
		width: 100%;
		height: calc(100% - 28px);
		padding: 0.75rem;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.note-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 2px;
	}

	.note-text {
		width: 100%;
		height: 100%;
		overflow: auto;
		font-size: 0.875rem;
		line-height: 1.4;
		word-wrap: break-word;
		white-space: pre-wrap;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.note-textarea {
		width: 100%;
		height: 100%;
		border: none;
		padding: 0.5rem;
		font-family: inherit;
		font-size: 0.875rem;
		resize: none;
		background: transparent;
		color: inherit;
		outline: 2px solid var(--color-blue-500);
	}

	.note-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.25rem 0.5rem;
		height: 28px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		font-size: 0.75rem;
		background: rgba(255, 255, 255, 0.7);
	}

	.note-type {
		font-size: 0.875rem;
		opacity: 0.6;
	}

	.note-theme {
		opacity: 0.5;
		font-size: 0.625rem;
		text-transform: uppercase;
	}

	.note-options-btn {
		position: absolute;
		top: 2px;
		right: 2px;
		background: rgba(0, 0, 0, 0.3);
		color: white;
		border: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		opacity: 0;
		transition: opacity 0.2s;
		z-index: 10;
	}

	.note:hover .note-options-btn {
		opacity: 1;
	}

	.note-options-btn:hover {
		background: rgba(0, 0, 0, 0.5);
	}

	.note-options {
		position: absolute;
		top: 28px;
		right: 0;
		background: white;
		border: 1px solid var(--color-gray-200);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 20;
		min-width: 120px;
	}

	.option-item {
		display: block;
		width: 100%;
		padding: 0.5rem 1rem;
		border: none;
		background: none;
		text-align: left;
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--color-gray-700);
		transition: background-color 0.15s;
	}

	.option-item:hover {
		background-color: var(--color-gray-100);
	}

	.option-item:first-child {
		border-radius: var(--radius-md) var(--radius-md) 0 0;
	}

	.option-item:last-child {
		border-radius: 0 0 var(--radius-md) var(--radius-md);
	}

	.edit-actions {
		position: absolute;
		bottom: 4px;
		right: 4px;
		display: flex;
		gap: 4px;
		z-index: 15;
	}

	.edit-btn {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-btn.save {
		background: var(--color-green-500);
		color: white;
	}

	.edit-btn.save:hover {
		background: var(--color-green-600);
		box-shadow: var(--shadow-md);
	}

	.edit-btn.cancel {
		background: var(--color-red-500);
		color: white;
	}

	.edit-btn.cancel:hover {
		background: var(--color-red-600);
		box-shadow: var(--shadow-md);
	}
</style>
