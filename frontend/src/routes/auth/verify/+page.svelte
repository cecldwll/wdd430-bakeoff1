<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import { Button } from '../../../components/ui';
	import { setUser } from '$lib/stores/user';
	import { addNotification } from '$lib/stores/ui';

	let email = '';
	let verificationCode = '';
	let isLoading = false;
	let timeRemaining = 300; // 5 minutes
	let canResend = false;
	let timer: ReturnType<typeof setTimeout> | null = null;

	$: {
		const urlEmail = $page.url.searchParams.get('email');
		if (urlEmail && !email) {
			email = urlEmail;
		}
	}

	$: if (timeRemaining > 0 && !canResend) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timeRemaining -= 1;
		}, 1000);
	} else if (timeRemaining === 0) {
		canResend = true;
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleVerify = async (e: Event) => {
		e.preventDefault();

		if (!verificationCode) {
			addNotification('Please enter the verification code', 'error');
			return;
		}

		isLoading = true;

		try {
			const response = await fetch('/api/auth/verify-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, token: verificationCode }),
			});

			const data = await response.json();

			if (!response.ok) {
				addNotification(data.message || 'Verification failed', 'error');
				return;
			}

			addNotification('Email verified successfully! Redirecting to dashboard...', 'success');

			// Update user store
			if (data.user) {
				setUser({
					id: data.user.id,
					email: data.user.email,
					username: data.user.email.split('@')[0],
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}

			// Refresh the page data and redirect
			await invalidate('app:layout');
			setTimeout(() => {
				goto('/dashboard');
			}, 1500);
		} catch (error) {
			console.error('Verification error:', error);
			addNotification('An unexpected error occurred. Please try again.', 'error');
		} finally {
			isLoading = false;
		}
	};

	const handleResendCode = async () => {
		if (!email) {
			addNotification('Email is required', 'error');
			return;
		}

		try {
			const response = await fetch('/api/auth/resend-verification', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				addNotification(data.message || 'Failed to resend code', 'error');
				return;
			}

			addNotification('Verification code sent to your email', 'success');
			timeRemaining = 300;
			canResend = false;
		} catch (error) {
			console.error('Resend error:', error);
			addNotification('Failed to resend verification code', 'error');
		}
	};
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>Verify Email</h1>
		<p class="auth-subtitle">
			We sent a verification code to<br />
			<strong>{email}</strong>
		</p>

		<form on:submit={handleVerify}>
			<div class="code-input-group">
				<label for="code">Verification Code</label>
				<input
					id="code"
					type="text"
					placeholder="Enter 6-digit code"
					bind:value={verificationCode}
					maxlength="6"
					disabled={isLoading}
					class="code-input"
				/>
				<p class="code-hint">Check your email for the 6-digit code</p>
			</div>

			<Button
				variant="primary"
				size="lg"
				type="submit"
				disabled={isLoading || verificationCode.length < 6}
				class="submit-btn"
			>
				{#if isLoading}
					<span class="spinner"></span>
					Verifying...
				{:else}
					Verify Email
				{/if}
			</Button>
		</form>

		<div class="resend-section">
			<p class="resend-text">
				{#if canResend}
					Didn't receive the code?
					<button type="button" on:click={handleResendCode} class="resend-btn"> Resend </button>
				{:else}
					Resend code in <strong>{formatTime(timeRemaining)}</strong>
				{/if}
			</p>
		</div>

		<div class="auth-footer">
			<p>
				Wrong email? <a href="/auth/signup">Create a new account</a>
			</p>
		</div>
	</div>

	<div class="verification-info">
		<h3>What to do:</h3>
		<ol>
			<li>Check your email inbox for a message from Digital Scrapboard</li>
			<li>Copy the 6-digit verification code</li>
			<li>Paste it above and click "Verify Email"</li>
			<li>You'll be redirected to your dashboard</li>
		</ol>
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
		gap: 2rem;
	}

	.auth-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: 2rem;
		width: 100%;
		max-width: 400px;
		box-shadow: var(--shadow-xl);
	}

	.verification-info {
		background: rgba(255, 255, 255, 0.95);
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		max-width: 350px;
		box-shadow: var(--shadow-lg);
	}

	.verification-info h3 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
	}

	.verification-info ol {
		padding-left: 1.5rem;
		margin: 0;
	}

	.verification-info li {
		font-size: 0.875rem;
		line-height: 1.5;
		margin-bottom: 0.75rem;
		color: var(--color-gray-700);
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

	.code-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-700);
	}

	.code-input {
		padding: 1rem;
		border: 2px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		font-size: 1.5rem;
		letter-spacing: 0.5em;
		text-align: center;
		font-weight: 600;
		text-transform: uppercase;
		transition: all var(--transition-fast);
	}

	.code-input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.code-hint {
		font-size: 0.75rem;
		color: var(--color-gray-500);
		margin: 0;
	}

	:global(.submit-btn) {
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

	.resend-section {
		text-align: center;
		padding: 1rem;
		background: var(--color-gray-50);
		border-radius: var(--radius-md);
		margin-bottom: 1rem;
	}

	.resend-text {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-gray-700);
	}

	.resend-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		font-weight: 600;
		cursor: pointer;
		margin-left: 0.25rem;
		transition: color var(--transition-fast);
	}

	.resend-btn:hover {
		color: var(--color-primary-dark);
		text-decoration: underline;
	}

	.resend-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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

	@media (max-width: 1024px) {
		.auth-container {
			flex-direction: column;
			gap: 1rem;
		}

		.verification-info {
			max-width: 100%;
		}
	}

	@media (max-width: 640px) {
		.auth-card {
			padding: 1.5rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.verification-info {
			display: none;
		}
	}
</style>
