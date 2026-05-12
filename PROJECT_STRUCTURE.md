# Project Structure & File Conventions

## Directory Layout

```
digital-scrapboard/
├── frontend/                          # SvelteKit application
│   ├── src/
│   │   ├── app.d.ts                  # Global TypeScript definitions
│   │   ├── app.html                  # HTML entry point
│   │   ├── routes/
│   │   │   ├── +page.svelte          # Home page
│   │   │   ├── +layout.svelte        # Root layout wrapper
│   │   │   ├── api/                  # API routes (server-side)
│   │   │   ├── auth/                 # Authentication routes
│   │   │   ├── dashboard/            # Dashboard & scrapboards
│   │   │   └── share/                # Public share pages
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Scrapboard.svelte     # Canvas component
│   │   │   ├── Note.svelte           # Note component
│   │   │   ├── Image.svelte          # Image component
│   │   │   └── Line.svelte           # Connection line component
│   │   ├── lib/
│   │   │   ├── server/
│   │   │   │   └── auth.ts          # Authentication utilities
│   │   │   ├── schemas.ts            # Zod validation schemas
│   │   │   ├── autosave.ts          # Auto-save logic
│   │   │   ├── undo.ts              # Undo/redo system
│   │   │   ├── imageOptimize.ts     # Image optimization
│   │   │   ├── errorHandler.ts      # Error handling
│   │   │   └── offlineQueue.ts      # Offline support
│   │   ├── stores/
│   │   │   ├── user.ts               # User state store
│   │   │   ├── scrapboard.ts         # Scrapboard state store
│   │   │   └── ui.ts                 # UI state store
│   │   └── styles/
│   │       ├── global.css            # Global styles
│   │       ├── themes.css            # Note themes
│   │       └── variables.css         # CSS variables
│   ├── static/
│   │   ├── favicon.png              # Favicon
│   │   └── robots.txt               # SEO robots file
│   ├── tests/
│   │   ├── unit/
│   │   │   └── *.test.ts            # Unit tests
│   │   ├── integration/
│   │   │   └── us*.test.ts          # User story tests
│   │   ├── e2e/
│   │   │   └── *.spec.ts            # Playwright tests
│   │   ├── performance/
│   │   │   └── *.test.ts            # Performance tests
│   │   └── setup.ts                 # Test environment setup
│   ├── build/                        # Build output (generated)
│   ├── .svelte-kit/                 # SvelteKit cache (generated)
│   ├── node_modules/                # Dependencies (generated)
│   ├── .gitignore                   # Files to ignore in version control
│   ├── package.json                 # Dependencies & scripts
│   ├── package-lock.json            # Exact dependency versions (generated)
│   ├── tsconfig.json                # TypeScript configuration
│   ├── vite.config.ts               # Build configuration
│   ├── vitest.config.ts             # Test configuration
│   ├── playwright.config.ts         # E2E test configuration
│   ├── svelte.config.js             # SvelteKit configuration
│   ├── .prettierrc                  # Code formatting rules
│   ├── eslint.config.js             # Linting rules
│   ├── .env.example                 # Environment template
│   └── .env.local                   # Local environment (NOT in git)
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Initial database schema
│   │   ├── 002_rls_policies.sql     # Row-level security policies
│   │   ├── 003_storage_setup.sql    # Storage bucket configuration
│   │   └── README.md                # Migration documentation
│   ├── functions/
│   │   ├── image-optimization/      # Image processing
│   │   ├── generate-share-token/    # Share link generation
│   │   ├── cleanup-deleted/         # Soft-delete cleanup
│   │   └── README.md                # Functions documentation
│   ├── storage/
│   │   ├── images/                  # Storage bucket configuration
│   │   └── README.md                # Storage documentation
│   └── config.toml                  # Supabase project config
├── scripts/
│   ├── verify-env.sh               # Environment verification (Bash)
│   ├── verify-env.ps1              # Environment verification (PowerShell)
│   └── README.md                   # Scripts documentation
├── .github/
│   ├── workflows/
│   │   └── ci-cd.yml               # GitHub Actions pipeline
│   └── PULL_REQUEST_TEMPLATE.md    # PR template (future)
├── .gitignore                       # Git ignore rules
├── .dockerignore                    # Docker ignore rules
├── .env.example                     # Environment template
└── README.md                        # Project documentation

```

## File Naming Conventions

### Components (`frontend/src/components/`)
- **PascalCase** for component files: `MyComponent.svelte`
- **Descriptive names**: `Scrapboard.svelte`, `NoteCreator.svelte`, `ImageUploader.svelte`
- **Suffixes for variants**: 
  - `Component.svelte` — Main component
  - `ComponentForm.svelte` — Form variant
  - `ComponentDialog.svelte` — Modal variant

### Routes (`frontend/src/routes/`)
- **SvelteKit convention**: `+page.svelte`, `+layout.svelte`, `+server.ts`
- **kebab-case** for folders: `/auth-signup`, `/dashboard-items`
- **Dynamic routes**: `[id]`, `[...slug]`

### Stores (`frontend/src/stores/`)
- **lowercase.ts** for store files: `user.ts`, `scrapboard.ts`
- **Export named stores**: `export const authStore = writable(...)`

### Utilities (`frontend/src/lib/`)
- **lowercase.ts** for utility files: `autosave.ts`, `errorHandler.ts`
- **Group by functionality**: `lib/server/`, `lib/validation/`, etc.

### Tests (`frontend/tests/`)
- **Match source path**: `lib/autosave.ts` → `unit/autosave.test.ts`
- **Descriptive test names**: `*.test.ts`, `*.spec.ts`
- **User story tests**: `us1-create-scrapboard.test.ts`, `us2-notes.test.ts`

### Styles (`frontend/src/styles/`)
- **lowercase.css** for stylesheets
- **Global imports**: `global.css` loads first
- **Component scoping**: Use Svelte `:global()` for shared styles

## Code Structure Standards

### Svelte Components

```svelte
<script lang="ts">
	import type { ComponentProps } from './types';

	interface Props {
		title: string;
		onSave: (data: unknown) => void;
	}

	let { title, onSave }: Props = $props();
	let isLoading = $state(false);

	function handleSave() {
		// Logic here
	}
</script>

<div>
	<h1>{title}</h1>
	<!-- Template here -->
</div>

<style>
	/* Component styles */
</style>
```

### TypeScript Utilities

```typescript
// Export types first
export type UserId = string & { readonly __brand: 'UserId' };

// Then exports and functions
export function validateUser(user: unknown): boolean {
	// Implementation
}

export const config = {
	timeout: 5000,
	retries: 3,
} as const;
```

### API Routes

```typescript
// frontend/src/routes/api/[endpoint]/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		// Process data
		return json({ success: true });
	} catch (error) {
		return json({ error: String(error) }, { status: 400 });
	}
};
```

## Import Path Aliases

```typescript
// Use $lib alias for imports
import { validateEmail } from '$lib/schemas';
import { authStore } from '$lib/stores/user';
import Header from '$lib/components/Header.svelte';

// Avoid relative paths for cross-module imports
// ❌ Don't: import utils from '../../../lib/utils';
// ✅ Do: import { util } from '$lib/utils';
```

## Version Control Best Practices

### Committing Code

```bash
# Good commit messages
git commit -m "feat: add note creation form"
git commit -m "fix: resolve autosave race condition"
git commit -m "docs: update API documentation"

# Commit format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore
```

### Branch Strategy

- **main** — Production-ready code
- **develop** — Integration branch for features
- **feature/user-story-name** — Individual feature branches
- **hotfix/issue-description** — Emergency production fixes

### Before Pushing

```bash
# Always run checks locally
npm run check       # TypeScript
npm run lint        # ESLint
npm run format      # Prettier
npm run test:run    # Tests
npm run build       # Build verification
```

## Documentation Standards

### Comments

```typescript
// Use comments for "why", not "what"
// ✅ Good: Retry after 100ms to allow DB to settle
setTimeout(() => retry(), 100);

// ❌ Avoid: Set timeout to 100 milliseconds
setTimeout(() => retry(), 100);
```

### JSDoc for Public APIs

```typescript
/**
 * Validates an email address format
 * @param email - The email to validate
 * @returns True if valid email format, false otherwise
 * @example
 * validateEmail('user@example.com') // true
 */
export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### README in Each Directory

Every major directory should have a `README.md`:
- `supabase/migrations/README.md` — Migration patterns
- `frontend/tests/README.md` — Testing guidelines
- `scripts/README.md` — Script documentation

## Git Ignore Patterns

### Already Excluded:
- `node_modules/` — Dependencies
- `.svelte-kit/` — Build cache
- `build/`, `dist/` — Build outputs
- `.env.local` — Local secrets
- `*.log` — Log files
- `.DS_Store`, `Thumbs.db` — OS files
- `.vscode/`, `.idea/` — IDE config
- `coverage/` — Test coverage reports

### To Ignore (Add as Needed):
- `.env` — Environment secrets
- `*.pem` — SSL certificates
- `secrets.json` — Local credentials
- `.supabase/` — Local Supabase data

## Performance Considerations

### File Size Targets

| File Type | Target Size | Why |
|-----------|-------------|-----|
| Component | < 500 lines | Maintainability |
| Bundle | < 200KB gzip | Initial load |
| Image | < 200KB | Load time |
| API response | < 1MB | Network bandwidth |

### Code Splitting

- Routes are auto-split by SvelteKit
- Large components should be lazy-loaded
- Dependencies optimized in build phase

---

**Last Updated**: May 2026
**Version**: 1.0.0
