# Quickstart: Digital Scrapboard

## Recommended Stack
- Frontend: SvelteKit + TypeScript
- Backend services: Supabase Auth, Database, Storage, Realtime
- Database: PostgreSQL via Supabase
- Storage: Supabase Storage for image and handwritten assets
- Realtime: Supabase Realtime subscriptions

## Local Setup

1. Install Node.js 20+ and the Supabase CLI.
2. Clone the repository and open the workspace.
3. Create a `.env` file in the project root with values from your Supabase project:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=images
```

4. Initialize and start local Supabase services:

```bash
npx supabase init
npx supabase start
```

5. Install frontend dependencies:

```bash
cd frontend
npm install
```

## Development

### Run the app

```bash
cd frontend
npm run dev -- --host
```

### Apply database schema

```bash
npx supabase db push
```

## Testing

- Unit tests with Vitest:

```bash
cd frontend
npm test
```

- End-to-end tests with Playwright:

```bash
cd frontend
npm run test:e2e
```

## Deployment

- Deploy the frontend to a static host or SvelteKit host (Vercel, Netlify, Cloudflare Pages).
- Use Supabase hosted services for auth, database, storage, and realtime.
- Configure `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the deployment environment.

## Notes

- Use Supabase Storage for images and handwritten assets, serving them via signed URLs or public bucket access.
- Keep public share links separate from authenticated board state to preserve read-only access.
- Use row-level security policies in Supabase to restrict board data to owners and allow share-token access for public views.
- Prefer `zod` validation on the client for board item payloads before sending updates to Supabase.
