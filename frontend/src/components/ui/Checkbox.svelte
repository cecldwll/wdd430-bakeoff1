<script lang="ts">
	interface $$Props {
		checked?: boolean;
		disabled?: boolean;
		label?: string;
		class?: string;
	}

	let { checked = false, disabled = false, label = '', class: className = '' } = $$props;
</script>

<label class="checkbox {className}">
	<input type="checkbox" {checked} {disabled} on:change />
	<span class="checkbox-mark" />
	{#if label}
		<span class="checkbox-label">{label}</span>
	{/if}
</label>

<style>
	.checkbox {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
	}

	.checkbox input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		cursor: pointer;
	}

	.checkbox-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--color-gray-300);
		border-radius: 0.375rem;
		background: white;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.checkbox input:checked ~ .checkbox-mark {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	.checkbox input:checked ~ .checkbox-mark::after {
		content: '✓';
		color: white;
		font-weight: bold;
		font-size: 0.875rem;
	}

	.checkbox input:focus ~ .checkbox-mark {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.checkbox input:disabled ~ .checkbox-mark {
		background: var(--color-gray-100);
		cursor: not-allowed;
	}

	.checkbox-label {
		font-size: 0.875rem;
		color: var(--color-gray-700);
	}

	.checkbox input:disabled ~ .checkbox-label {
		color: var(--color-gray-500);
		cursor: not-allowed;
	}
</style>
