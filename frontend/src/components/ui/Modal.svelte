<script lang="ts">
	import { onMount } from 'svelte';

	interface $$Props {
		title: string;
		isOpen: boolean;
		size?: 'sm' | 'md' | 'lg';
		onClose: () => void;
		class?: string;
	}

	let { title, isOpen, size = 'md', onClose, class: className = '' } = $$props;
	let dialogElement: HTMLDialogElement;

	onMount(() => {
		if (isOpen) {
			dialogElement?.showModal();
		}
	});

	$: if (dialogElement) {
		if (isOpen) {
			dialogElement.showModal();
		} else {
			dialogElement.close();
		}
	}

	const handleBackdropClick = (e: MouseEvent) => {
		if (e.target === dialogElement) {
			onClose();
		}
	};
</script>

<dialog
	bind:this={dialogElement}
	on:click={handleBackdropClick}
	class="modal modal-{size} {className}"
>
	<div class="modal-content">
		<div class="modal-header">
			<h2>{title}</h2>
			<button class="modal-close" on:click={onClose} title="Close">✕</button>
		</div>
		<div class="modal-body">
			<slot />
		</div>
	</div>
</dialog>

<style>
	dialog {
		border: none;
		border-radius: var(--radius-lg);
		padding: 0;
		background: white;
		box-shadow: var(--shadow-xl);
		max-width: 90vw;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-sm {
		width: 400px;
	}

	.modal-md {
		width: 600px;
	}

	.modal-lg {
		width: 800px;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-gray-200);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: var(--color-gray-600);
		transition: color var(--transition-fast);
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-close:hover {
		color: var(--color-gray-900);
	}

	.modal-body {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}

	@media (max-width: 640px) {
		dialog {
			width: 95vw;
		}

		.modal-sm,
		.modal-md,
		.modal-lg {
			width: 95vw;
		}

		.modal-header {
			padding: 1rem;
		}

		.modal-body {
			padding: 1rem;
		}
	}
</style>
