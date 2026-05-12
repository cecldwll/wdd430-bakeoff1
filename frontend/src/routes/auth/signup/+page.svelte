<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Input } from '$lib/components/ui';
	import { SignUpSchema } from '$lib/schemas';
	import { addNotification } from '$lib/stores/ui';
	import type { PageData } from './$types';

	export let data: PageData;

	let email = '';
	let password = '';
	let confirmPassword = '';
	let username = '';
	let isLoading = false;
	let errors: Record<string, string> = {};

	const validateForm = (): boolean => {
		errors = {};

		// Validate email
		if (!email) {
			errors.email = 'Email is required';
		} else if (!email.includes('@')) {
			errors.email = 'Invalid email address';
		}

		// Validate username
		if (!username) {
			errors.username = 'Username is required';
		} else if (username.length < 2) {
			errors.username = 'Username must be at least 2 characters';
		}

		// Validate passwords
		if (!password) {
			errors.password = 'Password is required';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters';
		} else if (!/[A-Z]/.test(password)) {
			errors.password = 'Password must contain an uppercase letter';
		} else if (!/[0-9]/.test(password)) {
			errors.password = 'Password must contain a number';
		}

		if (!confirmPassword) {
			errors.confirmPassword = 'Please confirm your password';
		} else if (password !== confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}

		return Object.keys(errors).length === 0;
	};

	const handleSignUp = async (e: Event) => {
		e.preventDefault();

		if (!validateForm()) {
			addNotification('Please fix the errors below', 'error');
			return;
		}

		isLoading = true;

		try {
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password, username })
			});

			const data = await response.json();

			if (!response.ok) {
				addNotification(data.message || 'Sign up failed', 'error');
				return;
			}

			addNotification('Sign up successful! Please check your email to verify.', 'success');

			// Redirect to verification page after a short delay
			setTimeout(() => {
				goto(`/auth/verify?email=${encodeURIComponent(email)}`);
			}, 1500);
		} catch (error) {
			console.error('Sign up error:', error);
			addNotification('An unexpected error occurred. Please try again.', 'error');
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>Create Account</h1>
		<p class="auth-subtitle">Join the scrapboard community and start creating</p>

		<form on:submit={handleSignUp}>
			<Input
				label="Email Address"
				type="email"
				placeholder="you@example.com"
				bind:value={email}
				error={errors.email}
				disabled={isLoading}
			/>

			<Input
				label="Username"
				type="text"
				placeholder="Choose a username"
				bind:value={username}
				error={errors.username}
				disabled={isLoading}
			/>

			<Input
				label="Password"
				type="password"
				placeholder="At least 8 characters, 1 uppercase, 1 number"
				bind:value={password}
				error={errors.password}
				disabled={isLoading}
			/>

			<Input
				label="Confirm Password"
				type="password"
				placeholder="Re-enter your password"
				bind:value={confirmPassword}
				error={errors.confirmPassword}
				disabled={isLoading}
			/>

			<Button
				variant="primary"
				size="lg"
				type="submit"
				disabled={isLoading}
				class="submit-btn"
			>
				{#if isLoading}
					<span class="spinner" />
					Signing up...
				{:else}
					Sign Up
				{/if}
			</Button>
		</form>

		<div class="auth-footer">
			<p>Already have an account? <a href="/auth/login">Log in here</a></p>
		</div>

		<div class="password-requirements">
			<p class="req-title">Password requirements:</p>
			<ul>
				<li class:valid={password.length >= 8}>At least 8 characters</li>
				<li class:valid={/[A-Z]/.test(password)}>Contains uppercase letter</li>
				<li class:valid={/[0-9]/.test(password)}>Contains a number</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
	}

	.auth-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		box-shadow: var(--shadow-xl);
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 1.75rem;
		color: var(--color-gray-900);
		text-align: center;
	}

	.auth-subtitle {
		text-align: center;
		color: var(--color-gray-600);
		margin-bottom: 2rem;
		font-size: 0.875rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.submit-btn {
		width: 100%;
		margin-top: 0.5rem;
		display: flex;
		gap: 0.5rem;
	}

	.spinner {
		display: inline-block;
		width: 0.875rem;
		height: 0.875rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.auth-footer {
		text-align: center;
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-gray-200);
	}

	.auth-footer p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-gray-600);
	}

	.auth-footer a {
		color: var(--color-primary);
		font-weight: 500;
	}

	.password-requirements {
		background: var(--color-gray-50);
		border-radius: var(--radius-md);
		padding: 1rem;
		margin-top: 1rem;
	}

	.req-title {
		margin: 0 0 0.5rem 0;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-gray-700);
		text-transform: uppercase;
	}

	.password-requirements ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.password-requirements li {
		font-size: 0.8125rem;
		color: var(--color-gray-500);
		margin: 0.375rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.password-requirements li::before {
		content: '○';
		color: var(--color-gray-400);
		font-weight: bold;
	}

	.password-requirements li.valid {
		color: var(--color-success);
	}

	.password-requirements li.valid::before {
		content: '✓';
		color: var(--color-success);
	}

	@media (max-width: 640px) {
		.auth-card {
			padding: 1.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}
	}
</style>
