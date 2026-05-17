<script lang="ts">
	interface $$Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'success';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		type?: string;
		title?: string;
		class?: string;
	}

	let { variant = 'primary', size = 'md', disabled = false, type = 'button', class: className = '' } =
		$$props;
</script>

<button {type} {disabled} class="btn btn-{variant} btn-{size} {className}" on:click {...$$restProps}>
	<slot />
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 500;
		border: none;
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
	}

	.btn-md {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
	}

	.btn-lg {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
		box-shadow: var(--shadow-md);
	}

	.btn-secondary {
		background: var(--color-gray-200);
		color: var(--color-gray-900);
	}

	.btn-secondary:hover:not(:disabled) {
		background: var(--color-gray-300);
	}

	.btn-danger {
		background: var(--color-danger);
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background: #dc2626;
		box-shadow: var(--shadow-md);
	}

	.btn-success {
		background: var(--color-success);
		color: white;
	}

	.btn-success:hover:not(:disabled) {
		background: #059669;
		box-shadow: var(--shadow-md);
	}
</style>
