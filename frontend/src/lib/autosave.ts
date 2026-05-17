/**
 * Auto-save utility for scrapboard elements
 * Provides debounced saving to reduce API calls
 */

import type { Note, Image, Line } from '$lib/schemas';

interface SaveOptions {
	debounceMs?: number;
}

const DEFAULT_DEBOUNCE_MS = 2000; // 2 second debounce

/**
 * Creates a debounced save function for scrapboard elements
 * @param scrapboardId - The ID of the scrapboard being saved
 * @param options - Configuration options
 * @returns Functions to save different element types
 */
export function createAutoSave(scrapboardId: string, options?: SaveOptions) {
	const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
	let noteSaveTimeout: ReturnType<typeof setTimeout> | null = null;
	let imageSaveTimeout: ReturnType<typeof setTimeout> | null = null;
	let lineSaveTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Debounced note save
	 */
	const saveNote = async (noteId: string, updates: Partial<Note>) => {
		return new Promise<void>((resolve) => {
			if (noteSaveTimeout) {
				clearTimeout(noteSaveTimeout);
			}

			noteSaveTimeout = setTimeout(async () => {
				try {
					const response = await fetch(`/api/scrapboards/${scrapboardId}/notes/${noteId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(updates),
					});

					if (!response.ok) {
						const error = await response.json();
						console.error('Note save failed:', error);
					}
				} catch (error) {
					console.error('Note save error:', error);
				} finally {
					resolve();
				}
			}, debounceMs);
		});
	};

	/**
	 * Debounced image save
	 */
	const saveImage = async (imageId: string, updates: Partial<Image>) => {
		return new Promise<void>((resolve) => {
			if (imageSaveTimeout) {
				clearTimeout(imageSaveTimeout);
			}

			imageSaveTimeout = setTimeout(async () => {
				try {
					const response = await fetch(`/api/scrapboards/${scrapboardId}/images/${imageId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(updates),
					});

					if (!response.ok) {
						const error = await response.json();
						console.error('Image save failed:', error);
					}
				} catch (error) {
					console.error('Image save error:', error);
				} finally {
					resolve();
				}
			}, debounceMs);
		});
	};

	/**
	 * Debounced line save
	 */
	const saveLine = async (lineId: string, updates: Partial<Line>) => {
		return new Promise<void>((resolve) => {
			if (lineSaveTimeout) {
				clearTimeout(lineSaveTimeout);
			}

			lineSaveTimeout = setTimeout(async () => {
				try {
					const response = await fetch(`/api/scrapboards/${scrapboardId}/lines/${lineId}`, {
						method: 'PATCH',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(updates),
					});

					if (!response.ok) {
						const error = await response.json();
						console.error('Line save failed:', error);
					}
				} catch (error) {
					console.error('Line save error:', error);
				} finally {
					resolve();
				}
			}, debounceMs);
		});
	};

	/**
	 * Force immediate save (cancel debounce)
	 */
	const flushSaves = () => {
		if (noteSaveTimeout) clearTimeout(noteSaveTimeout);
		if (imageSaveTimeout) clearTimeout(imageSaveTimeout);
		if (lineSaveTimeout) clearTimeout(lineSaveTimeout);
	};

	return {
		saveNote,
		saveImage,
		saveLine,
		flushSaves,
	};
}

/**
 * Provides a hook-like interface for auto-save in Svelte components
 * @param scrapboardId - The ID of the scrapboard
 * @returns Auto-save functions
 */
export function useAutoSave(scrapboardId: string) {
	return createAutoSave(scrapboardId);
}
