import { writable } from 'svelte/store';

// UI notifications
export interface Notification {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info' | 'warning';
	duration?: number;
}

export const notifications = writable<Notification[]>([]);

let notificationId = 0;

export const addNotification = (
	message: string,
	type: 'success' | 'error' | 'info' | 'warning' = 'info',
	duration = 3000
) => {
	const id = `notification-${notificationId++}`;
	const notification: Notification = { id, message, type, duration };

	notifications.update((n) => [...n, notification]);

	if (duration > 0) {
		setTimeout(() => {
			removeNotification(id);
		}, duration);
	}

	return id;
};

export const removeNotification = (id: string) => {
	notifications.update((n) => n.filter((notif) => notif.id !== id));
};

export const clearNotifications = () => {
	notifications.set([]);
};

// UI modal state
export interface Modal {
	type: string;
	isOpen: boolean;
	data?: unknown;
}

export const modals = writable<Record<string, Modal>>({});

export const openModal = (type: string, data?: unknown) => {
	modals.update((m) => ({
		...m,
		[type]: { type, isOpen: true, data }
	}));
};

export const closeModal = (type: string) => {
	modals.update((m) => ({
		...m,
		[type]: { ...m[type], isOpen: false }
	}));
};

export const toggleModal = (type: string, data?: unknown) => {
	modals.update((m) => {
		const current = m[type];
		return {
			...m,
			[type]: { type, isOpen: !current?.isOpen, data }
		};
	});
};

// Loading state
export const isLoading = writable(false);
export const setLoading = (loading: boolean) => {
	isLoading.set(loading);
};

// Error state
export const lastError = writable<string | null>(null);
export const setError = (error: string | null) => {
	lastError.set(error);
};

// Sidebar state
export const isSidebarOpen = writable(true);
export const toggleSidebar = () => {
	isSidebarOpen.update((v) => !v);
};

// Theme preference
export const theme = writable<'light' | 'dark'>('light');
export const setTheme = (t: 'light' | 'dark') => {
	theme.set(t);
	// Persist to localStorage
	if (typeof window !== 'undefined') {
		localStorage.setItem('theme', t);
	}
};
