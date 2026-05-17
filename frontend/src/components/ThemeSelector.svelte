<script lang="ts">
	import { addNotification } from '$lib/stores/ui';
	import type { BackgroundThemeValue } from '$lib/schemas';

	export let selectedNoteId: string | null = null;
	export let onThemeSelected: ((noteId: string, theme: BackgroundThemeValue) => void) | undefined =
		undefined;

	const themes = [
		{ id: 'yellow_sticky', label: 'Yellow Sticky', color: '#ffd54f' },
		{ id: 'pink_sticky', label: 'Pink Sticky', color: '#ff80ab' },
		{ id: 'kraft_paper', label: 'Kraft Paper', color: '#d7ccc8' },
		{ id: 'postcard', label: 'Postcard', color: '#fff9c4' },
		{ id: 'blue_sticky', label: 'Blue Sticky', color: '#81d4fa' },
		{ id: 'scrap', label: 'Scrap', color: '#ffccbc' },
	];

	let isOpen = false;
	let isApplying = false;
	let selectedTheme: BackgroundThemeValue | null = null;

	function handleToggle() {
		isOpen = !isOpen;
	}

	function handleSelectTheme(themeId: BackgroundThemeValue) {
		selectedTheme = themeId;
	}

	async function handleApplyTheme() {
		if (!selectedNoteId || !selectedTheme) {
			addNotification('Please select a theme', 'error');
			return;
		}

		isApplying = true;

		try {
			const response = await fetch(`/api/notes/${selectedNoteId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					backgroundTheme: selectedTheme,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				addNotification(error.message || 'Failed to update theme', 'error');
				return;
			}

			addNotification('Theme updated successfully', 'success');

			if (onThemeSelected) {
				onThemeSelected(selectedNoteId, selectedTheme);
			}

			isOpen = false;
			selectedTheme = null;
		} catch (error) {
			console.error('Error applying theme:', error);
			addNotification('An unexpected error occurred', 'error');
		} finally {
			isApplying = false;
		}
	}
</script>

<div class="theme-selector" class:open={isOpen}>
	<button
		class="theme-toggle"
		on:click={handleToggle}
		title="Change note theme"
		disabled={!selectedNoteId}
	>
		🎨 Theme
	</button>

	{#if isOpen && selectedNoteId}
		<div class="theme-panel">
			<div class="theme-header">
				<h4>Select Theme</h4>
				<button class="close-btn" on:click={() => (isOpen = false)}>✕</button>
			</div>

			<div class="theme-grid">
				{#each themes as theme (theme.id)}
					<button
						class="theme-option"
						class:selected={selectedTheme === theme.id}
						on:click={() => handleSelectTheme(theme.id as BackgroundThemeValue)}
						title={theme.label}
					>
						<div class="theme-preview" style="background-color: {theme.color};"></div>
						<span class="theme-name">{theme.label}</span>
					</button>
				{/each}
			</div>

			<div class="theme-actions">
				<button
					class="btn-apply"
					on:click={handleApplyTheme}
					disabled={!selectedTheme || isApplying}
				>
					{#if isApplying}
						<span class="spinner"></span> Applying...
					{:else}
						Apply Theme
					{/if}
				</button>
				<button class="btn-cancel" on:click={() => (isOpen = false)} disabled={isApplying}>
					Cancel
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.theme-selector {
		position: relative;
		display: inline-block;
	}

	.theme-toggle {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.theme-toggle:hover:not(:disabled) {
		background: var(--color-primary-hover);
	}

	.theme-toggle:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.theme-panel {
		position: absolute;
		top: 100%;
		right: 0;
		background: white;
		border: 1px solid var(--color-gray-200);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		padding: 1.25rem;
		margin-top: 0.5rem;
		z-index: 100;
		min-width: 320px;
	}

	.theme-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--color-gray-200);
	}

	.theme-header h4 {
		margin: 0;
		font-size: 1rem;
		color: var(--color-gray-900);
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--color-gray-500);
		cursor: pointer;
		font-size: 1.25rem;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		color: var(--color-gray-700);
	}

	.theme-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.theme-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border: 2px solid transparent;
		border-radius: var(--radius-md);
		background: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.theme-option:hover {
		border-color: var(--color-primary);
		background: var(--color-gray-50);
	}

	.theme-option.selected {
		border-color: var(--color-primary);
		background: var(--color-primary-light);
		box-shadow: var(--shadow-md);
	}

	.theme-preview {
		width: 60px;
		height: 60px;
		border-radius: 4px;
		box-shadow: var(--shadow-sm);
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.theme-name {
		font-size: 0.75rem;
		color: var(--color-gray-600);
		text-align: center;
		word-break: break-word;
		font-weight: 500;
	}

	.theme-actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn-apply,
	.btn-cancel {
		flex: 1;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.btn-apply {
		background: var(--color-primary);
		color: white;
	}

	.btn-apply:hover:not(:disabled) {
		background: var(--color-primary-hover);
		box-shadow: var(--shadow-md);
	}

	.btn-apply:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-cancel {
		background: var(--color-gray-100);
		color: var(--color-gray-700);
	}

	.btn-cancel:hover:not(:disabled) {
		background: var(--color-gray-200);
	}

	.btn-cancel:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.spinner {
		display: inline-block;
		width: 0.65rem;
		height: 0.65rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		margin-right: 0.35rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.theme-panel {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			right: auto;
			min-width: 90vw;
			max-width: 400px;
		}

		.theme-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
