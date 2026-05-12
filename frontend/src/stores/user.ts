import { writable, derived } from 'svelte/store';
import type { User } from '$lib/schemas';

// User authentication and profile store
export const user = writable<User | null>(null);
export const isAuthenticated = derived(user, ($user) => $user !== null);
export const isEmailVerified = derived(user, ($user) => $user?.emailVerified ?? false);

export const setUser = (userData: User | null) => {
	user.set(userData);
};

export const updateUser = (updates: Partial<User>) => {
	user.update((current) => (current ? { ...current, ...updates } : null));
};

export const clearUser = () => {
	user.set(null);
};
