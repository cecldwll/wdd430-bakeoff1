<script lang="ts">
	interface $$Props {
		label?: string;
		name: string;
		value: string;
		checked?: boolean;
		disabled?: boolean;
		class?: string;
	}

	let { label, name, value, checked = false, disabled = false, class: className = '' } = $$props;
</script>

<label class="radio {className}">
	<input type="radio" {name} {value} {checked} {disabled} on:change />
	<span class="radio-mark" />
	{#if label}
		<span class="radio-label">{label}</span>
	{/if}
</label>

<style>
	.radio {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
	}

	.radio input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		cursor: pointer;
	}

	.radio-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid var(--color-gray-300);
		border-radius: 50%;
		background: white;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.radio input:checked ~ .radio-mark {
		border-color: var(--color-primary);
	}

	.radio input:checked ~ .radio-mark::after {
		content: '';
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--color-primary);
	}

	.radio input:focus ~ .radio-mark {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.radio input:disabled ~ .radio-mark {
		background: var(--color-gray-100);
		cursor: not-allowed;
	}

	.radio-label {
		font-size: 0.875rem;
		color: var(--color-gray-700);
	}

	.radio input:disabled ~ .radio-label {
		color: var(--color-gray-500);
		cursor: not-allowed;
	}
</style>
