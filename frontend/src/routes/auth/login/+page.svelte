<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input } from '../../../components/ui';
	import { addNotification } from '$lib/stores/ui';

	let email = '';
	let password = '';
	let isLoading = false;
	let errors: Record<string, string> = {};

	const handleLogin = async (event: Event) => {
		event.preventDefault();
		errors = {};

		if (!email) errors.email = 'Email is required';
		if (!password) errors.password = 'Password is required';

		if (Object.keys(errors).length > 0) return;

		isLoading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				addNotification(data.message || 'Login failed', 'error');
				return;
			}

			addNotification('Welcome back', 'success');
			await goto('/dashboard');
		} catch (error) {
			console.error('Login error:', error);
			addNotification('An unexpected error occurred. Please try again.', 'error');
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>Log In</h1>
		<p class="auth-subtitle">Return to your scrapboards</p>

		<form on:submit={handleLogin}>
			<Input
				label="Email Address"
				type="email"
				placeholder="you@example.com"
				bind:value={email}
				error={errors.email}
				disabled={isLoading}
			/>

			<Input
				label="Password"
				type="password"
				placeholder="Your password"
				bind:value={password}
				error={errors.password}
				disabled={isLoading}
			/>

			<Button variant="primary" size="lg" type="submit" disabled={isLoading} class="submit-btn">
				{isLoading ? 'Logging in...' : 'Log In'}
			</Button>
		</form>

		<div class="auth-footer">
			<p>Need an account? <a href="/auth/signup">Sign up here</a></p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 128px);
		padding: 1rem;
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
		border: 1px solid var(--color-gray-200);
		border-radius: 8px;
		background: white;
		box-shadow: var(--shadow-lg);
	}

	h1 {
		margin: 0 0 0.5rem;
		text-align: center;
	}

	.auth-subtitle {
		margin: 0 0 2rem;
		color: var(--color-gray-600);
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	:global(.submit-btn) {
		width: 100%;
		margin-top: 0.5rem;
	}

	.auth-footer {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-gray-200);
		text-align: center;
	}

	.auth-footer p {
		margin: 0;
		color: var(--color-gray-600);
		font-size: 0.875rem;
	}
</style>
