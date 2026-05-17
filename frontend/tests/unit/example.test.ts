import { describe, expect, it, vi } from 'vitest';

describe('Utility: Validation', () => {
	it('validates email format', () => {
		const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

		expect(validateEmail('user@example.com')).toBe(true);
		expect(validateEmail('invalid-email')).toBe(false);
		expect(validateEmail('test@domain.co.uk')).toBe(true);
	});

	it('validates strong password', () => {
		const validatePassword = (password: string) => password.length >= 8 && /[A-Z]/.test(password);

		expect(validatePassword('StrongPass123')).toBe(true);
		expect(validatePassword('weak')).toBe(false);
		expect(validatePassword('UPPERCASE123')).toBe(true);
	});
});

describe('Async: API Calls', () => {
	it('fetches data successfully', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ success: true, data: [] }),
		});

		vi.stubGlobal('fetch', mockFetch);

		const response = await fetch('/api/test');
		const data = await response.json();

		expect(data.success).toBe(true);
		expect(mockFetch).toHaveBeenCalledOnce();
	});

	it('handles network errors', async () => {
		const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

		vi.stubGlobal('fetch', mockFetch);

		await expect(fetch('/api/test')).rejects.toThrow('Network error');
	});
});
