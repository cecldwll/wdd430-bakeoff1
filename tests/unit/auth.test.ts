import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignUpSchema, LoginSchema, UserSchema } from '$lib/schemas';

describe('Auth Schemas', () => {
	describe('SignUpSchema', () => {
		it('should validate a correct signup form', () => {
			const data = {
				email: 'user@example.com',
				password: 'SecurePass123',
				username: 'johndoe'
			};

			const result = SignUpSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid email', () => {
			const data = {
				email: 'invalid-email',
				password: 'SecurePass123',
				username: 'johndoe'
			};

			const result = SignUpSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject password without uppercase letter', () => {
			const data = {
				email: 'user@example.com',
				password: 'securepass123',
				username: 'johndoe'
			};

			const result = SignUpSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject password without number', () => {
			const data = {
				email: 'user@example.com',
				password: 'SecurePass',
				username: 'johndoe'
			};

			const result = SignUpSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject password shorter than 8 characters', () => {
			const data = {
				email: 'user@example.com',
				password: 'Pass1',
				username: 'johndoe'
			};

			const result = SignUpSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject username shorter than 2 characters', () => {
			const data = {
				email: 'user@example.com',
				password: 'SecurePass123',
				username: 'j'
			};

			const result = SignUpSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should reject username longer than 50 characters', () => {
			const data = {
				email: 'user@example.com',
				password: 'SecurePass123',
				username: 'a'.repeat(51)
			};

			const result = SignUpSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('LoginSchema', () => {
		it('should validate correct login form', () => {
			const data = {
				email: 'user@example.com',
				password: 'SecurePass123'
			};

			const result = LoginSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid email', () => {
			const data = {
				email: 'invalid',
				password: 'SecurePass123'
			};

			const result = LoginSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should require password', () => {
			const data = {
				email: 'user@example.com',
				password: ''
			};

			const result = LoginSchema.safeParse(data);
			expect(result.success).toBe(false);
		});
	});

	describe('UserSchema', () => {
		it('should validate correct user object', () => {
			const data = {
				id: '550e8400-e29b-41d4-a716-446655440000',
				email: 'user@example.com',
				username: 'johndoe',
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const result = UserSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid UUID', () => {
			const data = {
				id: 'not-a-uuid',
				email: 'user@example.com',
				username: 'johndoe',
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const result = UserSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should handle optional settings field', () => {
			const data = {
				id: '550e8400-e29b-41d4-a716-446655440000',
				email: 'user@example.com',
				username: 'johndoe',
				emailVerified: false,
				createdAt: new Date(),
				updatedAt: new Date(),
				settings: { theme: 'dark' }
			};

			const result = UserSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});
});
