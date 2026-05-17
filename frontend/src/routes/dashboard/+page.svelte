<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '../../components/ui';
	import { user } from '$lib/stores/user';
	import { addNotification } from '$lib/stores/ui';
	import type { PageData } from './$types';

	export let data: PageData;

	let scrapboards = data.scrapboards || [];
	let isLoading = false;

	const handleCreateScrapboard = async () => {
		isLoading = true;

		try {
			const response = await fetch('/api/scrapboards', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: 'Untitled Scrapboard',
					description: ''
				})
			});

			const data = await response.json();

			if (!response.ok) {
				addNotification(data.message || 'Failed to create scrapboard', 'error');
				return;
			}

			addNotification('Scrapboard created! Redirecting...', 'success');

			setTimeout(() => {
				goto(`/scrapboard/${data.scrapboard.id}`);
			}, 1000);
		} catch (error) {
			console.error('Create scrapboard error:', error);
			addNotification('An unexpected error occurred', 'error');
		} finally {
			isLoading = false;
		}
	};

	const handleOpenScrapboard = (id: string) => {
		goto(`/scrapboard/${id}`);
	};

	const handleDeleteScrapboard = async (id: string) => {
		if (!confirm('Are you sure you want to delete this scrapboard?')) {
			return;
		}

		try {
			const response = await fetch(`/api/scrapboards/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				addNotification(error.message || 'Failed to delete scrapboard', 'error');
				return;
			}

			addNotification('Scrapboard deleted', 'success');
			scrapboards = scrapboards.filter((sb) => sb.id !== id);
		} catch (error) {
			console.error('Delete error:', error);
			addNotification('An unexpected error occurred', 'error');
		}
	};
</script>

<div class="dashboard">
	<div class="dashboard-header">
		<div>
			<h1>Welcome, {$user?.username}!</h1>
			<p class="dashboard-subtitle">Manage your creative scrapboards</p>
		</div>
		<Button
			variant="primary"
			size="lg"
			on:click={handleCreateScrapboard}
			disabled={isLoading}
		>
			{#if isLoading}
				<span class="spinner" /> Creating...
			{:else}
				+ New Scrapboard
			{/if}
		</Button>
	</div>

	{#if scrapboards.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🎨</div>
			<h2>No scrapboards yet</h2>
			<p>Create your first scrapboard to start collecting notes, images, and ideas!</p>
			<Button variant="primary" on:click={handleCreateScrapboard} disabled={isLoading}>
				Create First Scrapboard
			</Button>
		</div>
	{:else}
		<div class="scrapboards-grid">
			{#each scrapboards as scrapboard (scrapboard.id)}
				<div class="scrapboard-card">
					<div class="card-header">
						<h3>{scrapboard.title}</h3>
						<span class="card-badge">{scrapboard.visibility}</span>
					</div>

					{#if scrapboard.description}
						<p class="card-description">{scrapboard.description}</p>
					{:else}
						<p class="card-description empty">No description</p>
					{/if}

					<div class="card-meta">
						<span class="created-date">
							Created {new Date(scrapboard.createdAt).toLocaleDateString()}
						</span>
						<span class="item-count">
							{scrapboard.itemCount || 0} items
						</span>
					</div>

					<div class="card-actions">
						<Button
							variant="primary"
							size="sm"
							on:click={() => handleOpenScrapboard(scrapboard.id)}
						>
							Open
						</Button>
						<Button
							variant="danger"
							size="sm"
							on:click={() => handleDeleteScrapboard(scrapboard.id)}
						>
							Delete
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
	}

	.dashboard-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 3rem;
		gap: 2rem;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2rem;
		color: var(--color-gray-900);
	}

	.dashboard-subtitle {
		margin: 0;
		color: var(--color-gray-600);
		font-size: 1rem;
	}

	.spinner {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: white;
		border-radius: var(--radius-lg);
		border: 2px dashed var(--color-gray-300);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		margin: 1rem 0 0.5rem 0;
		font-size: 1.5rem;
		color: var(--color-gray-900);
	}

	.empty-state p {
		color: var(--color-gray-600);
		margin-bottom: 2rem;
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	.scrapboards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}

	.scrapboard-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		box-shadow: var(--shadow-md);
		transition: all var(--transition-normal);
		border: 1px solid var(--color-gray-200);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.scrapboard-card:hover {
		box-shadow: var(--shadow-lg);
		transform: translateY(-2px);
		border-color: var(--color-primary);
	}

	.card-header {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	.card-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--color-gray-900);
		flex: 1;
		word-break: break-word;
	}

	.card-badge {
		background: var(--color-primary);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-md);
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.card-description {
		margin: 0;
		color: var(--color-gray-600);
		font-size: 0.875rem;
		line-height: 1.5;
		flex: 1;
	}

	.card-description.empty {
		color: var(--color-gray-400);
		font-style: italic;
	}

	.card-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: var(--color-gray-500);
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-gray-100);
	}

	.card-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: auto;
	}

	:global(.card-actions .btn) {
		flex: 1;
	}

	@media (max-width: 640px) {
		.dashboard-header {
			flex-direction: column;
			align-items: stretch;
			margin-bottom: 2rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.scrapboards-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.empty-state {
			padding: 2rem 1rem;
		}

		.empty-icon {
			font-size: 3rem;
		}
	}
</style>
