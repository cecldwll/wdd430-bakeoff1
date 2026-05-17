<script lang="ts">
	import { Button } from './ui';
	import { addNotification } from '$lib/stores/ui';
	import { onMount } from 'svelte';

	export let onSave: ((imageDataUrl: string) => void) | undefined = undefined;
	export let onCancel: (() => void) | undefined = undefined;

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let isDrawing = false;
	let lastX = 0;
	let lastY = 0;
	let isSaving = false;

	// Drawing settings
	let brushSize = 3;
	let brushColor = '#000000';
	let isErasing = false;

	onMount(() => {
		if (!canvas) return;

		ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Set canvas size to fill container
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;

		// Fill with white background
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Add event listeners
		canvas.addEventListener('mousedown', handleMouseDown);
		canvas.addEventListener('mousemove', handleMouseMove);
		canvas.addEventListener('mouseup', handleMouseUp);
		canvas.addEventListener('mouseout', handleMouseUp);

		// Touch support
		canvas.addEventListener('touchstart', handleTouchStart);
		canvas.addEventListener('touchmove', handleTouchMove);
		canvas.addEventListener('touchend', handleTouchEnd);

		return () => {
			canvas.removeEventListener('mousedown', handleMouseDown);
			canvas.removeEventListener('mousemove', handleMouseMove);
			canvas.removeEventListener('mouseup', handleMouseUp);
			canvas.removeEventListener('mouseout', handleMouseUp);
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchmove', handleTouchMove);
			canvas.removeEventListener('touchend', handleTouchEnd);
		};
	});

	function getCanvasCoords(e: MouseEvent | Touch) {
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY
		};
	}

	function handleMouseDown(e: MouseEvent) {
		isDrawing = true;
		const coords = getCanvasCoords(e);
		lastX = coords.x;
		lastY = coords.y;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDrawing || !ctx) return;

		const coords = getCanvasCoords(e);
		draw(lastX, lastY, coords.x, coords.y);
		lastX = coords.x;
		lastY = coords.y;
	}

	function handleMouseUp() {
		isDrawing = false;
	}

	function handleTouchStart(e: TouchEvent) {
		isDrawing = true;
		const touch = e.touches[0];
		const coords = getCanvasCoords(touch);
		lastX = coords.x;
		lastY = coords.y;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDrawing || !ctx) return;

		e.preventDefault();
		const touch = e.touches[0];
		const coords = getCanvasCoords(touch);
		draw(lastX, lastY, coords.x, coords.y);
		lastX = coords.x;
		lastY = coords.y;
	}

	function handleTouchEnd() {
		isDrawing = false;
	}

	function draw(fromX: number, fromY: number, toX: number, toY: number) {
		if (!ctx) return;

		if (isErasing) {
			ctx.clearRect(toX - brushSize / 2, toY - brushSize / 2, brushSize, brushSize);
		} else {
			ctx.strokeStyle = brushColor;
			ctx.lineWidth = brushSize;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.beginPath();
			ctx.moveTo(fromX, fromY);
			ctx.lineTo(toX, toY);
			ctx.stroke();
		}
	}

	function handleClear() {
		if (!ctx) return;
		if (confirm('Clear the entire canvas?')) {
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	}

	function handleUndo() {
		// Canvas undo would require storing history; simplified for now
		addNotification('Undo coming in future version', 'info');
	}

	function handleSave() {
		if (!canvas) return;

		// Check if canvas is empty (all white)
		const imageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
		if (!imageData) return;

		const data = imageData.data;
		let isEmpty = true;
		for (let i = 0; i < data.length; i += 4) {
			// Check if any pixel is not white (255, 255, 255)
			if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
				isEmpty = false;
				break;
			}
		}

		if (isEmpty) {
			addNotification('Please draw something before saving', 'error');
			return;
		}

		isSaving = true;
		try {
			const imageDataUrl = canvas.toDataURL('image/png');
			if (onSave) {
				onSave(imageDataUrl);
			}
			addNotification('Handwritten note saved', 'success');
		} catch (error) {
			console.error('Error saving drawing:', error);
			addNotification('Failed to save drawing', 'error');
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		if (onCancel) {
			onCancel();
		}
	}
</script>

<div class="drawing-canvas-container">
	<div class="drawing-header">
		<h3>Draw Your Note</h3>
		<p class="drawing-instructions">Draw on the canvas below to create a handwritten note</p>
	</div>

	<div class="drawing-toolbar">
		<div class="tool-group">
			<label class="tool-label">Brush Size:</label>
			<input
				type="range"
				min="1"
				max="20"
				bind:value={brushSize}
				class="tool-input"
			/>
			<span class="brush-preview" style="width: {brushSize}px; height: {brushSize}px;"></span>
		</div>

		<div class="tool-group">
			<label class="tool-label">Color:</label>
			<input
				type="color"
				bind:value={brushColor}
				class="color-picker"
				disabled={isErasing}
			/>
		</div>

		<div class="tool-group">
			<label class="tool-label">
				<input
					type="checkbox"
					bind:checked={isErasing}
				/>
				Eraser
			</label>
		</div>

		<div class="tool-group spacer">
			<Button
				variant="secondary"
				size="sm"
				on:click={handleClear}
			>
				Clear
			</Button>
			<Button
				variant="secondary"
				size="sm"
				on:click={handleUndo}
				disabled
			>
				Undo
			</Button>
		</div>
	</div>

	<div class="canvas-wrapper">
		<canvas
			bind:this={canvas}
			class="drawing-canvas"
		></canvas>
	</div>

	<div class="drawing-actions">
		<Button
			variant="primary"
			on:click={handleSave}
			disabled={isSaving}
		>
			{#if isSaving}
				<span class="spinner" /> Saving...
			{:else}
				Save & Create Note
			{/if}
		</Button>
		<Button
			variant="secondary"
			on:click={handleCancel}
			disabled={isSaving}
		>
			Cancel
		</Button>
	</div>
</div>

<style>
	.drawing-canvas-container {
		background: white;
		border-radius: var(--radius-lg);
		padding: 1.5rem;
		box-shadow: var(--shadow-lg);
		max-width: 600px;
		width: 100%;
		border: 1px solid var(--color-gray-200);
	}

	.drawing-header {
		margin-bottom: 1.5rem;
		border-bottom: 2px solid var(--color-gray-100);
		padding-bottom: 1rem;
	}

	.drawing-header h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: var(--color-gray-900);
	}

	.drawing-instructions {
		margin: 0;
		color: var(--color-gray-600);
		font-size: 0.875rem;
	}

	.drawing-toolbar {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--color-gray-50);
		border-radius: var(--radius-md);
		flex-wrap: wrap;
	}

	.tool-group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.tool-group.spacer {
		margin-left: auto;
		gap: 0.5rem;
	}

	.tool-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-gray-700);
		white-space: nowrap;
	}

	.tool-input {
		width: 100px;
		height: 6px;
		cursor: pointer;
	}

	.brush-preview {
		display: inline-block;
		background: var(--color-gray-900);
		border-radius: 50%;
		margin-left: 0.5rem;
	}

	.color-picker {
		width: 50px;
		height: 40px;
		border: 2px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.canvas-wrapper {
		background: white;
		border: 2px solid var(--color-gray-200);
		border-radius: var(--radius-md);
		overflow: hidden;
		margin-bottom: 1.5rem;
		aspect-ratio: 4 / 3;
	}

	.drawing-canvas {
		display: block;
		width: 100%;
		height: 100%;
		cursor: crosshair;
		background: white;
		touch-action: none;
	}

	.drawing-actions {
		display: flex;
		gap: 0.75rem;
	}

	:global(.drawing-actions .btn) {
		flex: 1;
	}

	.spinner {
		display: inline-block;
		width: 0.75rem;
		height: 0.75rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 600px) {
		.drawing-canvas-container {
			padding: 1rem;
		}

		.drawing-toolbar {
			gap: 1rem;
		}

		.tool-group.spacer {
			width: 100%;
			margin-left: 0;
		}
	}
</style>
