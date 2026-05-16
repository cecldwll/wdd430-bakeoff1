# Phase 4 Architecture & Data Flow

## Component Hierarchy

```
ScrapboardPage (+page.svelte)
├─ Header
│  ├─ ← Back Button
│  ├─ Title
│  └─ Toolbar
│     ├─ ↶ Undo Button → handleUndo()
│     ├─ ↷ Redo Button → handleRedo()
│     ├─ + Note Button → showNoteCreator = true
│     ├─ + Image Button → (Phase 5)
│     ├─ Share Button → (Phase 7)
│     └─ ⚙ Settings Button
│
├─ Modal Layer
│  ├─ NoteCreator
│  │  ├─ Type Toggle (Typed/Handwritten)
│  │  ├─ Textarea (for typed) → POST /api/notes
│  │  └─ Theme Selector (6 options)
│  │
│  └─ DrawingCanvas
│     ├─ HTML5 Canvas
│     ├─ Brush Controls
│     ├─ Eraser Toggle
│     └─ Clear & Save → POST /api/notes (handwritten)
│
├─ Canvas Area (Main Content)
│  ├─ GET /api/scrapboards/[id]/notes → loadNotes()
│  ├─ Note Components (rendered in {#each})
│  │  ├─ Note
│  │  │  ├─ Drag Handler
│  │  │  │  ├─ Track Mouse Events
│  │  │  │  ├─ Calculate Offset
│  │  │  │  ├─ Update Position
│  │  │  │  └─ Auto-Save via debounce
│  │  │  ├─ Edit Mode
│  │  │  │  └─ Textarea with Save/Cancel
│  │  │  ├─ Options Menu (⋮)
│  │  │  │  ├─ Edit Text
│  │  │  │  └─ Delete
│  │  │  └─ Content Render
│  │  │     ├─ For Typed: Text + Theme CSS
│  │  │     └─ For Handwritten: Canvas Image
│  │  │
│  │  └─ PATCH /api/notes/[id] → handleUpdateNote()
│  │  └─ DELETE /api/notes/[id] → handleDeleteNote()
│  │
│  └─ ThemeSelector (Fixed Position)
│     ├─ Visibility: if selectedNoteId != null
│     ├─ 6 Theme Options
│     └─ Apply → PATCH /api/notes/[id]

└─ State Management
   ├─ Local Reactive
   │  ├─ notes: Note[]
   │  ├─ selectedNoteId: string | null
   │  ├─ showNoteCreator: boolean
   │  └─ showDrawingCanvas: boolean
   │
   ├─ Stores
   │  ├─ undoRedo: UndoRedoStore
   │  │  ├─ addEntry(HistoryEntry)
   │  │  ├─ undo() → HistoryEntry
   │  │  ├─ redo() → HistoryEntry
   │  │  └─ subscribe() → listener
   │  │
   │  └─ autoSave: AutoSaveUtil
   │     ├─ saveNote(id, updates)
   │     ├─ debounce: 2000ms
   │     └─ batch PATCH requests
   │
   └─ Auth
      └─ locals.supabase
         └─ User verified → RLS enforced
```

---

## Data Flow Diagrams

### Create Typed Note Flow

```
User
  ↓
Click "+ Note"
  ↓ showNoteCreator = true
NoteCreator Modal Opens
  ↓
User Enters Text + Picks Theme
  ↓
Click "Create Note"
  ↓ POST /api/notes
Supabase
  ├─ Validate CreateNoteSchema
  ├─ Check User Owns Scrapboard (RLS)
  ├─ Generate Z-Order
  └─ INSERT note
  ↓
Response 201 { note }
  ↓
handleNoteCreated()
  ├─ Add to local notes array
  ├─ Close modal
  └─ Add undo history entry
  ↓
Note Renders on Canvas ✓
```

### Drag Note Flow

```
User
  ↓
Click + Hold Note
  ↓
handleMouseDown()
  ├─ Track drag offset
  └─ Set isDragging = true
  ↓
Mouse Move Events
  ↓
handleMouseMove()
  ├─ Calculate new positionX, positionY
  ├─ Update local note
  └─ Trigger auto-save (2s debounce)
  ↓
After 2s (or mouse up)
  ↓
handleUpdateNote()
  ↓ PATCH /api/notes/[id]
Supabase
  ├─ Validate UpdateNoteSchema
  ├─ Check ownership
  └─ UPDATE note SET position_x, position_y
  ↓
Response 200 { note }
  ↓
Local state synced ✓
```

### Delete Note with Undo Flow

```
User
  ↓
Click Note → Click "⋮" → Click "Delete"
  ↓
handleDeleteNote(noteId)
  ├─ Store previousState (copy of full note)
  └─ DELETE /api/notes/[id]
  ↓
Supabase (Soft Delete)
  ├─ UPDATE note SET deleted_at = now()
  ├─ Note stays in DB (not hard deleted)
  └─ Excluded from queries (WHERE deleted_at IS NULL)
  ↓
Response 200
  ↓
handleDeleteNote() Continued
  ├─ Remove from local notes array
  ├─ Add undo entry with previousState
  └─ Show notification
  ↓
User Sees Note Disappear ✓
  ↓
User Clicks "↶ Undo"
  ↓
handleUndo()
  ├─ Retrieve delete history entry
  ├─ Extract previousState
  ├─ POST /api/notes (recreate from previousState)
  └─ Add to local notes array
  ↓
Note Reappears ✓
```

### Theme Change Flow

```
User
  ↓
Click Note to Select
  ↓ selectedNoteId = noteId
ThemeSelector Becomes Active
  ↓
User Clicks Theme Option
  ↓
handleThemeSelected(noteId, theme)
  ↓
handleUpdateNote(noteId, { backgroundTheme: theme })
  ├─ Update local note
  ├─ Trigger auto-save
  └─ Add undo history
  ↓
After 2s Debounce
  ↓ PATCH /api/notes/[id]
Supabase
  ├─ UPDATE note SET background_theme = theme
  └─ UPDATE updated_at
  ↓
Response 200
  ↓
Local synced, Note Theme Updates ✓
```

---

## State Management Architecture

### Svelte Reactive State

```typescript
// Component Script
let notes: NoteType[] = [];           // Local reactive
let selectedNoteId: string | null;   // Local reactive
let showNoteCreator = false;         // Local reactive
let showDrawingCanvas = false;       // Local reactive

// When any change:
// - Svelte re-renders component
// - Child components reactively update
// - No manual state sync needed
```

### Undo/Redo Manager

```typescript
// UndoRedoManager class
{
  history: HistoryEntry[]  // [create, update, delete, ...]
  currentIndex: number     // Points to current state
  
  addEntry(entry) {
    // If index < length, delete future entries
    // Add new entry
    // Increment index
    // Notify subscribers
  }
  
  undo() {
    // Decrement index
    // Return history[index]
    // Notify subscribers
  }
  
  redo() {
    // Increment index
    // Return history[index]
    // Notify subscribers
  }
}

// Subscriber Pattern
undoRedo.subscribe((entry) => {
  console.log('State changed:', entry)
})
```

### Auto-Save Debouncing

```typescript
// useAutoSave Utility
{
  saveNote(noteId, updates) {
    // Cancel previous timeout (if exists)
    // Start new 2s timeout
    // On timeout:
    //   PATCH /api/notes/[id]
    //   Sync local state
  }
}

// Example
handleUpdateNote(noteId, { positionX: 100, positionY: 50 })
  → autoSave.saveNote(noteId, updates)
  → Wait 2 seconds...
  → User drags again
  → Cancel previous timeout
  → Start new 2s timeout
  → After 2s of inactivity
  → Send single PATCH request
```

---

## Database Schema (Phase 4)

```sql
-- Notes Table
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  scrapboard_id UUID NOT NULL,
  type text NOT NULL,              -- 'typed' or 'handwritten'
  content text,                     -- NULL for handwritten
  image_url text,                   -- NULL for typed
  position_x float DEFAULT 0,
  position_y float DEFAULT 0,
  width float DEFAULT 200,
  height float DEFAULT 150,
  background_theme text,            -- 6 theme options
  z_order int DEFAULT 0,            -- For layering
  deleted_at timestamp,             -- Soft delete marker
  created_at timestamp,
  updated_at timestamp
);

-- Indexes
CREATE INDEX notes_scrapboard_deleted_idx 
  ON notes(scrapboard_id, deleted_at);

-- RLS Policies
-- SELECT: User owns the scrapboard
-- INSERT: User owns the scrapboard
-- UPDATE: User owns the scrapboard
-- DELETE: User owns the scrapboard
```

---

## API Endpoints (Phase 4)

```
POST   /api/notes                 → Create note (typed/handwritten)
PATCH  /api/notes/[id]            → Update note (position/text/theme)
DELETE /api/notes/[id]            → Delete note (soft delete)
GET    /api/scrapboards/[id]/notes → Fetch all notes for scrapboard
```

---

## Error Handling Strategy

```
Frontend Validation (Zod)
  ↓
Sanitize Input
  ↓
POST to API
  ↓
Server Validation (Zod + Database)
  ↓
RLS Check (Supabase)
  ↓
Execute Query
  ↓
Return Response
  │
  ├─ 201/200: Success
  │   ├─ Update local state
  │   └─ Show success notification
  │
  ├─ 400: Validation Error
  │   ├─ Show error message
  │   └─ Don't update state
  │
  ├─ 401/403: Auth Error
  │   ├─ Redirect to login
  │   └─ Clear state
  │
  └─ 500: Server Error
      ├─ Show error notification
      ├─ Log to console
      └─ Don't update state
```

---

## Performance Optimizations

1. **Debounced Auto-Save**: Reduces API calls during dragging
   - Without: 100+ requests per drag
   - With: 1-2 requests per drag sequence

2. **Component Isolation**: Each note is independent
   - Update one note doesn't re-render others
   - Helps with large canvases (100+ notes)

3. **Lazy Loading**: Notes loaded on scrapboard view
   - Not on dashboard list
   - GET endpoint fetches all (batched)

4. **Memory Limits**: Undo history capped at 50 entries
   - Prevents memory leaks
   - Users typically undo/redo recent actions

5. **Canvas Rendering**: Native browser rendering
   - Handwritten notes: PNG data URLs
   - Typed notes: CSS-styled divs
   - No animation overhead for positioning

---

## Testing Coverage (Phase 4)

```
Unit Tests (20+ cases)
├─ CreateNoteSchema validation
├─ UpdateNoteSchema validation
├─ Theme validation (6 themes)
├─ UndoRedoManager operations
├─ Undo after delete scenarios
└─ History size limits

Integration Tests (Scaffolded)
├─ Create typed note E2E
├─ Create handwritten note E2E
├─ Drag and persist E2E
├─ Edit and save E2E
├─ Theme change E2E
├─ Delete and undo E2E
├─ Auto-save timing E2E
└─ Multiple notes overlap E2E
```

---

## Next Phase (Phase 5) Integration Points

**Image Component** (will follow same pattern)
```
Image Upload
  ↓ POST /api/images
Supabase Storage
  ↓
Image Component
  ├─ Drag-drop positioning
  ├─ Resize handles
  └─ Rotate controls
  ↓
PATCH /api/images/[id]
```

---
