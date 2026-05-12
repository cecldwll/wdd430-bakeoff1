<script lang="ts">
	interface $$Props {
		label?: string;
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		rows?: number;
		error?: string;
		class?: string;
	}

	let { label, value = '', placeholder = '', disabled = false, rows = 3, error = '', class: className = '' } = $$props;
</script>

<div class="textarea-group {className}">
	{#if label}
		<label for="textarea">{label}</label>
	{/if}
	<textarea
		id="textarea"
		{placeholder}
		{value}
		{disabled}
		{rows}
		class:has-error={!!error}
		on:input
		on:change
		on:focus
		on:blur
	/>
	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.textarea-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-700);
	}

	textarea {
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		font-size: 0.875rem;
		font-family: var(--font-mono);
		transition: all var(--transition-fast);
		background: white;
		color: var(--color-gray-900);
		resize: vertical;
	}

	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	textarea:disabled {
		background: var(--color-gray-100);
		color: var(--color-gray-500);
		cursor: not-allowed;
	}

	textarea.has-error {
		border-color: var(--color-danger);
	}

	textarea.has-error:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--color-danger);
		font-weight: 500;
	}
</style>
