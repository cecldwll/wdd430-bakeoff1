import { writable, derived } from 'svelte/store';
import type { Scrapboard, Note, Image, Line } from '$lib/schemas';

// Current scrapboard store
export const currentScrapboard = writable<Scrapboard | null>(null);

// Canvas elements stores
export const notes = writable<Note[]>([]);
export const images = writable<Image[]>([]);
export const lines = writable<Line[]>([]);

// Canvas state
export const canvasZoom = writable(1);
export const canvasPanX = writable(0);
export const canvasPanY = writable(0);

// Element selection and editing
export const selectedElementId = writable<string | null>(null);
export const selectedElementType = writable<'note' | 'image' | 'line' | null>(null);

export const isElementSelected = derived(selectedElementId, ($id) => $id !== null);

// Mode state
export const editorMode = writable<'select' | 'draw-line' | 'add-note'>('select');
export const isDrawingLine = derived(editorMode, ($mode) => $mode === 'draw-line');

// Get element by ID
export const getNote = derived(
	[notes, selectedElementId],
	([$notes, $id]) => $id ? $notes.find((n) => n.id === $id) : null
);

export const getImage = derived(
	[images, selectedElementId],
	([$images, $id]) => $id ? $images.find((i) => i.id === $id) : null
);

export const getLine = derived(
	[lines, selectedElementId],
	([$lines, $id]) => $id ? $lines.find((l) => l.id === $id) : null
);

// Canvas element counts
export const elementCount = derived(
	[notes, images, lines],
	([$notes, $images, $lines]) => $notes.length + $images.length + $lines.length
);

// Initialize scrapboard
export const setScrapboard = (scrapboard: Scrapboard | null) => {
	currentScrapboard.set(scrapboard);
	if (!scrapboard) {
		notes.set([]);
		images.set([]);
		lines.set([]);
		selectedElementId.set(null);
	}
};

// Add/update/delete notes
export const addNote = (note: Note) => {
	notes.update((n) => [...n, note]);
};

export const updateNote = (id: string, updates: Partial<Note>) => {
	notes.update((n) => n.map((note) => (note.id === id ? { ...note, ...updates } : note)));
};

export const deleteNote = (id: string) => {
	notes.update((n) => n.filter((note) => note.id !== id));
};

// Add/update/delete images
export const addImage = (image: Image) => {
	images.update((i) => [...i, image]);
};

export const updateImage = (id: string, updates: Partial<Image>) => {
	images.update((i) => i.map((img) => (img.id === id ? { ...img, ...updates } : img)));
};

export const deleteImage = (id: string) => {
	images.update((i) => i.filter((img) => img.id !== id));
};

// Add/update/delete lines
export const addLine = (line: Line) => {
	lines.update((l) => [...l, line]);
};

export const updateLine = (id: string, updates: Partial<Line>) => {
	lines.update((l) => l.map((line) => (line.id === id ? { ...line, ...updates } : line)));
};

export const deleteLine = (id: string) => {
	lines.update((l) => l.filter((line) => line.id !== id));
};

// Selection management
export const selectElement = (id: string | null, type: 'note' | 'image' | 'line' | null = null) => {
	selectedElementId.set(id);
	selectedElementType.set(type);
};

export const deselectElement = () => {
	selectedElementId.set(null);
	selectedElementType.set(null);
};

// Canvas controls
export const setZoom = (z: number) => {
	canvasZoom.set(Math.max(0.1, Math.min(5, z))); // Clamp between 0.1x and 5x
};

export const setPan = (x: number, y: number) => {
	canvasPanX.set(x);
	canvasPanY.set(y);
};

// Editor mode
export const setEditorMode = (mode: 'select' | 'draw-line' | 'add-note') => {
	editorMode.set(mode);
};
