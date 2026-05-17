<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	export let label: string | undefined = undefined;
	export let options: Option[] = [];
	export let value = '';
	export let disabled = false;
	export let error = '';
	let className = '';
	export { className as class };
</script>

<div class="select-group {className}">
	{#if label}
		<label for="select">{label}</label>
	{/if}
	<select
		id="select"
		bind:value
		{disabled}
		class:has-error={!!error}
		on:change
		on:focus
		on:blur
	>
		<option value="">Select an option</option>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.select-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-700);
	}

	select {
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		transition: all var(--transition-fast);
		background: white;
		color: var(--color-gray-900);
		cursor: pointer;
	}

	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	select:disabled {
		background: var(--color-gray-100);
		color: var(--color-gray-500);
		cursor: not-allowed;
	}

	select.has-error {
		border-color: var(--color-danger);
	}

	select.has-error:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--color-danger);
		font-weight: 500;
	}
</style>
