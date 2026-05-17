<script lang="ts">
	export let label: string | undefined = undefined;
	export let type = 'text';
	export let placeholder = '';
	export let value = '';
	export let disabled = false;
	export let error = '';
	let className = '';
	export { className as class };
</script>

<div class="input-group {className}">
	{#if label}
		<label for="input">{label}</label>
	{/if}
	<input
		id="input"
		{type}
		{placeholder}
		bind:value
		{disabled}
		on:input
		on:change
		on:focus
		on:blur
		class:has-error={!!error}
	/>
	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-700);
	}

	input {
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		transition: all var(--transition-fast);
		background: white;
		color: var(--color-gray-900);
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input:disabled {
		background: var(--color-gray-100);
		color: var(--color-gray-500);
		cursor: not-allowed;
	}

	input.has-error {
		border-color: var(--color-danger);
	}

	input.has-error:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--color-danger);
		font-weight: 500;
	}
</style>
