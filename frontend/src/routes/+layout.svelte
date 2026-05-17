<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { user, isAuthenticated } from '$lib/stores/user';
	import { notifications, modals } from '$lib/stores/ui';
	import '../styles/global.css';
	import '../styles/themes.css';

	let { children } = $props();

	onMount(() => {
		// Load user from page data
		if ($page.data.user) {
			user.set($page.data.user);
		}

		// Load theme preference from localStorage
		if (typeof window !== 'undefined') {
			const savedTheme = localStorage.getItem('theme') || 'light';
			document.documentElement.setAttribute('data-theme', savedTheme);
		}
	});

	// Close modals on escape key
	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			modals.update((m) => {
				const updated = { ...m };
				Object.keys(updated).forEach((key) => {
					updated[key].isOpen = false;
				});
				return updated;
			});
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app">
	<!-- Header -->
	<header class="header">
		<div class="header-content">
			<div class="logo-section">
				<a href="/" class="logo">
					<span class="logo-icon">🎨</span>
					<span class="logo-text">Digital Scrapboard</span>
				</a>
			</div>

			<nav class="nav-main">
				{#if $isAuthenticated}
					<a href="/dashboard" class="nav-link" class:active={$page.url.pathname === '/dashboard'}>
						Dashboard
					</a>
					<a
						href="/scrapboard"
						class="nav-link"
						class:active={$page.url.pathname.startsWith('/scrapboard')}
					>
						Scrapboard
					</a>
				{/if}
			</nav>

			<div class="header-actions">
				{#if $isAuthenticated}
					<div class="user-menu">
						<span class="user-email">{$user?.email}</span>
						<button class="btn-icon" title="Settings">⚙️</button>
						<button class="btn-logout" title="Logout">Logout</button>
					</div>
				{:else}
					<a href="/auth/login" class="btn btn-primary">Login</a>
					<a href="/auth/signup" class="btn btn-secondary">Sign Up</a>
				{/if}
			</div>
		</div>
	</header>

	<!-- Main content -->
	<main class="main">
		{@render children()}
	</main>

	<!-- Notifications -->
	<div class="notifications">
		{#each $notifications as notification (notification.id)}
			<div class="notification notification-{notification.type}">
				{#if notification.type === 'success'}
					<span class="icon">✓</span>
				{:else if notification.type === 'error'}
					<span class="icon">✕</span>
				{:else if notification.type === 'warning'}
					<span class="icon">⚠</span>
				{:else}
					<span class="icon">ℹ</span>
				{/if}
				<span class="message">{notification.message}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		--color-primary: #3b82f6;
		--color-primary-dark: #1e40af;
		--color-secondary: #8b5cf6;
		--color-danger: #ef4444;
		--color-success: #10b981;
		--color-warning: #f59e0b;
		--color-info: #0ea5e9;
		--color-gray-50: #f9fafb;
		--color-gray-100: #f3f4f6;
		--color-gray-200: #e5e7eb;
		--color-gray-300: #d1d5db;
		--color-gray-400: #9ca3af;
		--color-gray-500: #6b7280;
		--color-gray-600: #4b5563;
		--color-gray-700: #374151;
		--color-gray-800: #1f2937;
		--color-gray-900: #111827;
		--font-sans:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
		--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: var(--font-sans);
		background: var(--color-gray-50);
		color: var(--color-gray-900);
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.header {
		background: white;
		border-bottom: 1px solid var(--color-gray-200);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.logo-section {
		flex-shrink: 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-gray-900);
		font-weight: 600;
		font-size: 1.125rem;
		transition: color 0.2s;
	}

	.logo:hover {
		color: var(--color-primary);
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	.logo-text {
		display: none;
	}

	@media (min-width: 768px) {
		.logo-text {
			display: inline;
		}
	}

	.nav-main {
		flex: 1;
		display: flex;
		gap: 2rem;
		margin-left: 3rem;
		margin-right: 2rem;
	}

	.nav-link {
		color: var(--color-gray-600);
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
		border-bottom: 2px solid transparent;
		padding-bottom: 0.5rem;
	}

	.nav-link:hover,
	.nav-link.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-left: 1rem;
		border-left: 1px solid var(--color-gray-200);
	}

	.user-email {
		font-size: 0.875rem;
		color: var(--color-gray-600);
		display: none;
	}

	@media (min-width: 768px) {
		.user-email {
			display: inline;
		}
	}

	.btn-icon {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.375rem;
		transition: background-color 0.2s;
	}

	.btn-icon:hover {
		background-color: var(--color-gray-100);
	}

	.btn-logout {
		background: var(--color-danger);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.btn-logout:hover {
		background-color: #dc2626;
	}

	.main {
		flex: 1;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.notifications {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		z-index: 1000;
	}

	.notification {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 0.5rem;
		background: white;
		box-shadow: var(--shadow-lg);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(400px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.notification-success {
		border-left: 4px solid var(--color-success);
	}

	.notification-error {
		border-left: 4px solid var(--color-danger);
	}

	.notification-warning {
		border-left: 4px solid var(--color-warning);
	}

	.notification-info {
		border-left: 4px solid var(--color-info);
	}

	.notification .icon {
		font-weight: bold;
		min-width: 1.25rem;
	}

	.notification-success .icon {
		color: var(--color-success);
	}

	.notification-error .icon {
		color: var(--color-danger);
	}

	.notification-warning .icon {
		color: var(--color-warning);
	}

	.notification-info .icon {
		color: var(--color-info);
	}

	.message {
		font-size: 0.875rem;
		color: var(--color-gray-700);
	}

	/* Button styles */
	:global(.btn) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.625rem 1rem;
		border-radius: 0.375rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		border: none;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	:global(.btn-primary) {
		background: var(--color-primary);
		color: white;
	}

	:global(.btn-primary:hover) {
		background: var(--color-primary-dark);
		box-shadow: var(--shadow-md);
	}

	:global(.btn-secondary) {
		background: var(--color-gray-200);
		color: var(--color-gray-900);
	}

	:global(.btn-secondary:hover) {
		background: var(--color-gray-300);
	}

	:global(.btn-danger) {
		background: var(--color-danger);
		color: white;
	}

	:global(.btn-danger:hover) {
		background: #dc2626;
	}
</style>
