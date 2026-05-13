<script lang="ts">
	import { Button, Input, Select, Textarea } from '$lib/components/ui';
	import { BackgroundTheme } from '$lib/schemas';
	import { addNotification } from '$lib/stores/ui';
	import type { z } from 'zod';

	export let scrapboardId: string;
	export let onNoteCreated: ((note: any) => void) | undefined = undefined;
	export let onCancel: (() => void) | undefined = undefined;

	let noteType: 'typed' | 'handwritten' = 'typed';
	let content = '';
	let selectedTheme: string = 'yellow_sticky';
	let isLoading = false;
	let error: string | null = null;

	// Theme options for display
	const themeOptions = [
		{ label: 'Yellow Sticky', value: 'yellow_sticky' },
		{ label: 'Pink Sticky', value: 'pink_sticky' },
		{ label: 'Kraft Paper', value: 'kraft_paper' },
		{ label: 'Postcard', value: 'postcard' },
		{ label: 'Blue Sticky', value: 'blue_sticky' },
		{ label: 'Scrap', value: 'scrap' }
	];

	const handleCreateNote = async () => {
		if (noteType === 'typed' && !content.trim()) {
			error = 'Please enter note text';
			return;
		}

		isLoading = true;
		error = null;

		try {
			const payload: Record<string, any> = {
				scrapboardId,
				type: noteType,
				backgroundTheme: selectedTheme,
				positionX: Math.random() * 200, // Random starting position
				positionY: Math.random() * 200
			};

			if (noteType === 'typed') {
				payload.content = content;
			}

			const response = await fetch('/api/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.message || 'Failed to create note';
				addNotification(error, 'error');
				return;
			}

			addNotification('Note created successfully', 'success');
			if (onNoteCreated) {
				onNoteCreated(data.note);
			}

			// Reset form
			content = '';
			selectedTheme = 'yellow_sticky';
		} catch (err) {
			console.error('Create note error:', err);
			error = 'An unexpected error occurred';
			addNotification(error, 'error');
		} finally {
			isLoading = false;
		}
	};

	const handleCancel = () => {
		content = '';
		error = null;
		if (onCancel) {
			onCancel();
		}
	};
</script>

<div class="note-creator">
	<div class="creator-header">
		<h3>Create New Note</h3>
	</div>

	<!-- Note Type Toggle -->
	<div class="type-toggle">
		<label class="toggle-item">
			<input
				type="radio"
				value="typed"
				bind:group={noteType}
				name="note-type"
			/>
			<span class:active={noteType === 'typed'}>✎ Typed</span>
		</label>
		<label class="toggle-item">
			<input
				type="radio"
				value="handwritten"
				bind:group={noteType}
				name="note-type"
			/>
			<span class:active={noteType === 'handwritten'}>🎨 Handwritten</span>
		</label>
	</div>

	<!-- Typed Note Input -->
	{#if noteType === 'typed'}
		<div class="form-group">
			<Textarea
				label="Note Text"
				placeholder="Write your note here..."
				bind:value={content}
				rows={4}
				disabled={isLoading}
			/>
		</div>
	{:else}
		<div class="form-group handwritten-info">
			<p>Click to open drawing canvas to create a handwritten note</p>
		</div>
	{/if}

	<!-- Theme Selector -->
	<div class="form-group">
		<Select
			label="Background Theme"
			options={themeOptions}
			bind:value={selectedTheme}
			disabled={isLoading}
		/>
	</div>

	<!-- Theme Preview -->
	<div class="theme-preview">
		<div class={`preview-note theme-${selectedTheme}`}>
			{#if noteType === 'typed' && content}
				<p>{content.substring(0, 50)}</p>
			{:else if noteType === 'typed'}
				<p class="placeholder">Your text here...</p>
			{:else}
				<p class="placeholder">Handwritten note preview</p>
			{/if}
		</div>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="error-message">
			{error}
		</div>
	{/if}

	<!-- Actions -->
	<div class="creator-actions">
		<Button
			variant="primary"
			on:click={handleCreateNote}
			disabled={isLoading}
		>
			{#if isLoading}
				<span class="spinner" /> Creating...
			{:else}
				Create Note
			{/if}
		</Button>
		<Button
			variant="secondary"
			on:click={handleCancel}
			disabled={isLoading}
		>
			Cancel
		</Button>
	</div>
</div>

<style>
	.note-creator {
		background: white;
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		box-shadow: var(--shadow-lg);
		max-width: 400px;
		border: 1px solid var(--color-gray-200);
	}

	.creator-header {
		margin-bottom: 1.5rem;
		border-bottom: 2px solid var(--color-gray-100);
		padding-bottom: 1rem;
	}

	.creator-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-gray-900);
	}

	.type-toggle {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		background: var(--color-gray-50);
		padding: 0.5rem;
		border-radius: var(--radius-md);
	}

	.toggle-item {
		flex: 1;
		position: relative;
	}

	.toggle-item input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-item span {
		display: block;
		padding: 0.75rem 1rem;
		text-align: center;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-normal);
		background: white;
		color: var(--color-gray-600);
		font-weight: 500;
	}

	.toggle-item input:checked + span.active {
		background: var(--color-primary);
		color: white;
		box-shadow: var(--shadow-sm);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.handwritten-info {
		background: var(--color-blue-50);
		padding: 1rem;
		border-radius: var(--radius-md);
		border-left: 4px solid var(--color-blue-500);
	}

	.handwritten-info p {
		margin: 0;
		color: var(--color-blue-700);
		font-size: 0.875rem;
	}

	.theme-preview {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--color-gray-50);
		border-radius: var(--radius-md);
		min-height: 120px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-note {
		width: 150px;
		height: 100px;
		padding: 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		line-height: 1.4;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		box-shadow: var(--shadow-md);
	}

	.preview-note p {
		margin: 0;
		word-wrap: break-word;
	}

	.preview-note .placeholder {
		color: rgba(0, 0, 0, 0.3);
		font-style: italic;
	}

	.error-message {
		background: var(--color-red-50);
		border: 1px solid var(--color-red-200);
		color: var(--color-red-700);
		padding: 0.75rem 1rem;
		border-radius: var(--radius-md);
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.creator-actions {
		display: flex;
		gap: 0.75rem;
	}

	:global(.creator-actions .btn) {
		flex: 1;
	}

	.spinner {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
