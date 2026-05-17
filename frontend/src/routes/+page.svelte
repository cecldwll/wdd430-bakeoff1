<script lang="ts">
	import { isAuthenticated } from '$lib/stores/user';
</script>

<svelte:head>
	<title>Digital Scrapboard</title>
	<meta
		name="description"
		content="Create personal scrapboards with typed notes, handwritten notes, freeform positioning, and paper themes."
	/>
</svelte:head>

<section class="home">
	<div class="intro">
		<p class="eyebrow">Personal creative workspace</p>
		<h1>Digital Scrapboard</h1>
		<p class="lede">
			Capture typed notes, sketch handwritten ideas, arrange everything freely, and keep the board
			saved across sessions.
		</p>
		<div class="actions">
			{#if $isAuthenticated}
				<a class="btn btn-primary" href="/dashboard">Open dashboard</a>
			{:else}
				<a class="btn btn-primary" href="/auth/signup">Create an account</a>
				<a class="btn btn-secondary" href="/auth/login">Log in</a>
			{/if}
		</div>
	</div>

	<div class="board-preview" aria-label="Scrapboard preview">
		<div class="preview-note yellow">Project launch<br />ideas</div>
		<div class="preview-note blue">Color palette</div>
		<div class="preview-note kraft">Sketch area</div>
		<div class="preview-note pink">Remember to save</div>
	</div>

	<div class="feature-row">
		<div>
			<strong>Phase 1-2</strong>
			<span>Project setup, Supabase schema, auth middleware, layout, and shared UI.</span>
		</div>
		<div>
			<strong>Phase 3</strong>
			<span>Signup, verification, dashboard, scrapboard creation, and persistence.</span>
		</div>
		<div>
			<strong>Phase 4</strong>
			<span>Typed and handwritten notes, free positioning, deletion, undo, and themes.</span>
		</div>
	</div>
</section>

<style>
	.home {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(320px, 1.1fr);
		align-items: center;
		gap: 3rem;
		min-height: calc(100vh - 128px);
		padding: 1rem 0 3rem;
	}

	.eyebrow {
		margin: 0 0 0.75rem;
		color: var(--color-primary-dark);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		color: var(--color-gray-900);
		font-size: clamp(2.5rem, 7vw, 5rem);
		line-height: 0.95;
	}

	.lede {
		max-width: 34rem;
		margin: 1.25rem 0 0;
		color: var(--color-gray-600);
		font-size: 1.125rem;
		line-height: 1.7;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.board-preview {
		position: relative;
		min-height: 430px;
		border: 1px solid var(--color-gray-200);
		border-radius: 8px;
		background:
			linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.72)),
			linear-gradient(90deg, rgba(17, 24, 39, 0.06) 1px, transparent 1px),
			linear-gradient(rgba(17, 24, 39, 0.06) 1px, transparent 1px);
		background-size:
			auto,
			32px 32px,
			32px 32px;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}

	.preview-note {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 180px;
		height: 125px;
		padding: 1rem;
		border-radius: 4px;
		color: #292524;
		font-weight: 700;
		text-align: center;
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.14);
	}

	.yellow {
		top: 52px;
		left: 56px;
		background: #fef08a;
		transform: rotate(-4deg);
	}

	.blue {
		top: 80px;
		right: 72px;
		background: #bfdbfe;
		transform: rotate(3deg);
	}

	.kraft {
		bottom: 60px;
		left: 120px;
		background: #d6b98c;
		transform: rotate(2deg);
	}

	.pink {
		right: 64px;
		bottom: 92px;
		background: #fbcfe8;
		transform: rotate(-5deg);
	}

	.feature-row {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}

	.feature-row div {
		padding: 1rem;
		border-left: 3px solid var(--color-primary);
		background: white;
		box-shadow: var(--shadow-sm);
	}

	.feature-row strong,
	.feature-row span {
		display: block;
	}

	.feature-row span {
		margin-top: 0.375rem;
		color: var(--color-gray-600);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	@media (max-width: 900px) {
		.home,
		.feature-row {
			grid-template-columns: 1fr;
		}

		.board-preview {
			min-height: 360px;
		}
	}
</style>
