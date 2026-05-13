<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui';
	import { currentScrapboard, notes, images, lines, selectedElementId } from '$lib/stores/scrapboard';
	import { addNotification } from '$lib/stores/ui';
	import type { PageData } from './$types';

	export let data: PageData;

	let scrapboard = data.scrapboard;
	let isLoading = false;

	const handleAddNote = () => {
		// TODO: Implement add note functionality
		addNotification('Add note feature coming soon', 'info');
	};

	const handleAddImage = () => {
		// TODO: Implement add image functionality
		addNotification('Add image feature coming soon', 'info');
	};

	const handleUndo = () => {
		// TODO: Implement undo functionality
		addNotification('Undo feature coming soon', 'info');
	};

	const handleRedo = () => {
		// TODO: Implement redo functionality
		addNotification('Redo feature coming soon', 'info');
	};

	const handleShare = () => {
		// TODO: Implement share functionality
		addNotification('Share feature coming soon', 'info');
	};

	const handleSettings = () => {
		// TODO: Implement settings modal
		addNotification('Settings feature coming soon', 'info');
	};
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
		<div class="canvas-container">
			{#if !scrapboard}
				<div class="loading-state">
					<div class="spinner" />
					<p>Loading scrapboard...</p>
				</div>
			{:else if $notes.length === 0 && $images.length === 0}
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
					<!-- Canvas elements will render here -->
					<p style="text-align: center; color: var(--color-gray-500); padding: 2rem;">
						Canvas rendering coming in next phase
					</p>
				</div>
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
	}
</style>
