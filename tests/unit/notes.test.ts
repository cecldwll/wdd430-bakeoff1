import { describe, it, expect, beforeEach } from 'vitest';
import { CreateNoteSchema, UpdateNoteSchema, NoteSchema } from '$lib/schemas';
import { UndoRedoManager } from '$lib/undo';

describe('Note Schemas', () => {
	describe('CreateNoteSchema', () => {
		it('should validate typed note creation', () => {
			const data = {
				scrapboardId: '550e8400-e29b-41d4-a716-446655440000',
				type: 'typed',
				content: 'Test note',
				backgroundTheme: 'yellow_sticky'
			};

			const result = CreateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate handwritten note creation', () => {
			const data = {
				scrapboardId: '550e8400-e29b-41d4-a716-446655440000',
				type: 'handwritten',
				imageUrl: 'https://example.com/image.png',
				backgroundTheme: 'pink_sticky'
			};

			const result = CreateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should use default positioning values', () => {
			const data = {
				scrapboardId: '550e8400-e29b-41d4-a716-446655440000',
				type: 'typed',
				content: 'Hello'
			};

			const result = CreateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.positionX).toBe(0);
				expect(result.data.positionY).toBe(0);
				expect(result.data.width).toBe(200);
				expect(result.data.height).toBe(150);
			}
		});

		it('should validate custom positioning', () => {
			const data = {
				scrapboardId: '550e8400-e29b-41d4-a716-446655440000',
				type: 'typed',
				content: 'Hello',
				positionX: 100,
				positionY: 150,
				width: 300,
				height: 200
			};

			const result = CreateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should reject invalid background theme', () => {
			const data = {
				scrapboardId: '550e8400-e29b-41d4-a716-446655440000',
				type: 'typed',
				content: 'Hello',
				backgroundTheme: 'invalid_theme'
			};

			const result = CreateNoteSchema.safeParse(data);
			expect(result.success).toBe(false);
		});

		it('should validate all background themes', () => {
			const themes = [
				'yellow_sticky',
				'pink_sticky',
				'kraft_paper',
				'postcard',
				'blue_sticky',
				'scrap'
			];

			themes.forEach((theme) => {
				const data = {
					scrapboardId: '550e8400-e29b-41d4-a716-446655440000',
					type: 'typed',
					content: 'Hello',
					backgroundTheme: theme
				};

				const result = CreateNoteSchema.safeParse(data);
				expect(result.success).toBe(true);
			});
		});
	});

	describe('UpdateNoteSchema', () => {
		it('should validate partial updates', () => {
			const data = {
				content: 'Updated content'
			};

			const result = UpdateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate position updates', () => {
			const data = {
				positionX: 200,
				positionY: 300
			};

			const result = UpdateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate size updates', () => {
			const data = {
				width: 400,
				height: 300
			};

			const result = UpdateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should validate theme updates', () => {
			const data = {
				backgroundTheme: 'postcard'
			};

			const result = UpdateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});

		it('should allow empty update (all optional)', () => {
			const data = {};

			const result = UpdateNoteSchema.safeParse(data);
			expect(result.success).toBe(true);
		});
	});
});

describe('Undo/Redo Manager', () => {
	let manager: UndoRedoManager;

	beforeEach(() => {
		manager = new UndoRedoManager(50);
	});

	it('should start with empty history', () => {
		expect(manager.canUndo()).toBe(false);
		expect(manager.canRedo()).toBe(false);
	});

	it('should add entries to history', () => {
		manager.addEntry({
			id: 'op-1',
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'Hello' }
		});

		expect(manager.canUndo()).toBe(false); // First entry, nothing to undo to
		expect(manager.getHistory().length).toBe(1);
	});

	it('should handle undo after multiple entries', () => {
		manager.addEntry({
			id: 'op-1',
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'Hello' }
		});

		manager.addEntry({
			id: 'op-2',
			timestamp: Date.now(),
			type: 'update',
			elementType: 'note',
			elementId: 'note-1',
			previousState: { content: 'Hello' },
			currentState: { content: 'World' }
		});

		expect(manager.canUndo()).toBe(true);
		const undone = manager.undo();
		expect(undone?.id).toBe('op-2');
		expect(manager.canRedo()).toBe(true);
	});

	it('should handle redo', () => {
		manager.addEntry({
			id: 'op-1',
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'Hello' }
		});

		manager.addEntry({
			id: 'op-2',
			timestamp: Date.now(),
			type: 'update',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'World' }
		});

		manager.undo();
		expect(manager.canRedo()).toBe(true);

		const redone = manager.redo();
		expect(redone?.id).toBe('op-2');
		expect(manager.canRedo()).toBe(false);
	});

	it('should clear history after undo and new action', () => {
		manager.addEntry({
			id: 'op-1',
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'Hello' }
		});

		manager.addEntry({
			id: 'op-2',
			timestamp: Date.now(),
			type: 'update',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'World' }
		});

		manager.undo();
		manager.addEntry({
			id: 'op-3',
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: 'note-2',
			currentState: { content: 'New' }
		});

		// After undo + new action, op-2 should be gone
		expect(manager.canRedo()).toBe(false);
		expect(manager.getHistory().length).toBe(2); // op-1 and op-3
	});

	it('should respect max history size', () => {
		const smallManager = new UndoRedoManager(5);

		for (let i = 0; i < 10; i++) {
			smallManager.addEntry({
				id: `op-${i}`,
				timestamp: Date.now(),
				type: 'create',
				elementType: 'note',
				elementId: `note-${i}`,
				currentState: { content: `Note ${i}` }
			});
		}

		// Should only keep last 5 entries
		expect(smallManager.getHistory().length).toBe(5);
	});

	it('should provide state information', () => {
		manager.addEntry({
			id: 'op-1',
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'Hello' }
		});

		const state = manager.getState();
		expect(state.totalEntries).toBe(1);
		expect(state.currentIndex).toBe(0);
		expect(state.canUndo).toBe(false);
		expect(state.historySize).toBe(50);
	});

	it('should support subscriptions', () => {
		let callCount = 0;
		const unsubscribe = manager.subscribe(() => {
			callCount++;
		});

		manager.addEntry({
			id: 'op-1',
			timestamp: Date.now(),
			type: 'create',
			elementType: 'note',
			elementId: 'note-1',
			currentState: { content: 'Hello' }
		});

		expect(callCount).toBe(1);

		manager.undo();
		expect(callCount).toBe(2);

		unsubscribe();
		manager.redo();
		expect(callCount).toBe(2); // Should not increase after unsubscribe
	});
});
