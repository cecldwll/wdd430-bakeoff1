/**
 * Undo/Redo functionality for scrapboard operations
 * Provides history management for note/image/line operations
 */

export interface HistoryEntry {
	id: string; // unique operation ID
	timestamp: number;
	type: 'create' | 'update' | 'delete';
	elementType: 'note' | 'image' | 'line';
	elementId: string;
	previousState?: any; // State before the operation (for undo)
	currentState: any; // State after the operation (for redo)
}

export class UndoRedoManager {
	private history: HistoryEntry[] = [];
	private currentIndex: number = -1;
	private maxHistorySize: number = 50; // Maximum history entries to keep
	private listeners: Set<() => void> = new Set();

	constructor(maxSize: number = 50) {
		this.maxHistorySize = maxSize;
	}

	/**
	 * Add an operation to the history
	 */
	addEntry(entry: HistoryEntry) {
		// Remove any entries after current index (when user performs new action after undo)
		if (this.currentIndex < this.history.length - 1) {
			this.history = this.history.slice(0, this.currentIndex + 1);
		}

		// Add new entry
		this.history.push(entry);
		this.currentIndex = this.history.length - 1;

		// Trim history if exceeded max size
		if (this.history.length > this.maxHistorySize) {
			this.history.shift();
			this.currentIndex = Math.max(0, this.currentIndex - 1);
		}

		this.notifyListeners();
	}

	/**
	 * Undo the last operation
	 */
	undo(): HistoryEntry | null {
		if (!this.canUndo()) {
			return null;
		}

		const entry = this.history[this.currentIndex];
		this.currentIndex--;
		this.notifyListeners();
		return entry;
	}

	/**
	 * Redo the last undone operation
	 */
	redo(): HistoryEntry | null {
		if (!this.canRedo()) {
			return null;
		}

		this.currentIndex++;
		const entry = this.history[this.currentIndex];
		this.notifyListeners();
		return entry;
	}

	/**
	 * Check if undo is possible
	 */
	canUndo(): boolean {
		return this.currentIndex > 0;
	}

	/**
	 * Check if redo is possible
	 */
	canRedo(): boolean {
		return this.currentIndex < this.history.length - 1;
	}

	/**
	 * Get current history state for display
	 */
	getState() {
		return {
			totalEntries: this.history.length,
			currentIndex: this.currentIndex,
			canUndo: this.canUndo(),
			canRedo: this.canRedo(),
			historySize: this.maxHistorySize,
		};
	}

	/**
	 * Clear all history
	 */
	clear() {
		this.history = [];
		this.currentIndex = -1;
		this.notifyListeners();
	}

	/**
	 * Get all history entries (for debugging)
	 */
	getHistory() {
		return [...this.history];
	}

	/**
	 * Subscribe to changes
	 */
	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners() {
		this.listeners.forEach((listener) => listener());
	}
}

/**
 * Create an undo/redo manager instance for a scrapboard
 * Usage:
 *   const manager = createUndoRedoManager();
 *   manager.addEntry({
 *     id: 'op-123',
 *     timestamp: Date.now(),
 *     type: 'create',
 *     elementType: 'note',
 *     elementId: 'note-456',
 *     currentState: { content: 'Hello' }
 *   });
 *   const canUndo = manager.canUndo();
 */
export function createUndoRedoManager(maxSize: number = 50) {
	return new UndoRedoManager(maxSize);
}

/**
 * Svelte store integration for undo/redo
 */
import { writable } from 'svelte/store';

export function createUndoRedoStore(maxSize: number = 50) {
	const manager = new UndoRedoManager(maxSize);

	const state = writable(manager.getState());

	manager.subscribe(() => {
		state.set(manager.getState());
	});

	return {
		subscribe: state.subscribe,
		undo: () => manager.undo(),
		redo: () => manager.redo(),
		addEntry: (entry: HistoryEntry) => manager.addEntry(entry),
		clear: () => manager.clear(),
		getHistory: () => manager.getHistory(),
	};
}
