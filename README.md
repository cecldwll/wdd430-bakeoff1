# 🎨 Digital Scrapboard

> An artistic, freeform canvas for creating and sharing handwritten notes, images, and visual connections. Sticky notes meets evidence board.

## ✨ Features

- **📝 Typed & Handwritten Notes** — Create sticky notes or draw directly on canvas
- **🖼️ Image Upload** — Add images and reposition freely
- **🔗 Visual Connections** — Draw lines between elements to show relationships
- **🎨 Artistic Themes** — Choose from multiple background styles (sticky notes, kraft paper, postcards)
- **🔄 Real-time Sync** — Cross-tab synchronization via Supabase Realtime
- **🔐 Secure Sharing** — Generate read-only share links for collaboration
- **📱 Responsive Design** — Works on desktop, tablet, and mobile
- **♿ Accessible** — WCAG 2.1 AA compliant

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **npm** 10+ (bundled with Node.js)
- **Supabase account** ([sign up](https://supabase.com)) — **optional for local development**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-scrapboard
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables**

   **Option A: Local Supabase (Recommended for Development)**
   ```bash
   # Initialize local Supabase
   npx supabase init
   npx supabase start
   
   # Copy example env file
   cp .env.example frontend/.env.local
   
   # Update frontend/.env.local with values from supabase start output:
   # PUBLIC_SUPABASE_URL=http://localhost:54321
   # PUBLIC_SUPABASE_ANON_KEY=<from output>
   # SUPABASE_SERVICE_ROLE_KEY=<from output>
   ```

   **Option B: Hosted Supabase**
   ```bash
   cp .env.example frontend/.env.local
   
   # Edit frontend/.env.local with your Supabase project credentials from:
   # https://app.supabase.com/project/[YOUR-PROJECT]/settings/api
   ```

4. **Verify environment setup**
   ```bash
   # PowerShell
   ./scripts/verify-env.ps1
   
   # Bash
   bash scripts/verify-env.sh
   ```

5. **Start development server**
   ```bash
   cd frontend
   npm run dev
   
   # Open http://localhost:5173 in your browser
   ```

## 📂 Project Structure

```
digital-scrapboard/
├── frontend/                    # SvelteKit application
│   ├── src/
│   │   ├── routes/             # SvelteKit routes & pages
│   │   ├── components/         # Svelte components
│   │   ├── lib/
│   │   │   ├── server/        # Server-side utilities
│   │   │   └── schemas.ts     # Zod validation schemas
│   │   ├── stores/             # Svelte reactive stores
│   │   └── styles/             # CSS & theme styles
│   ├── tests/
│   │   ├── unit/              # Unit tests (Vitest)
│   │   ├── integration/        # Integration tests
│   │   └── e2e/               # End-to-end tests (Playwright)
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite build config
│   ├── vitest.config.ts        # Vitest config
│   ├── playwright.config.ts    # Playwright config
│   └── .env.local              # Local environment variables
├── supabase/
│   ├── migrations/             # Database migrations
│   ├── functions/              # Edge functions
│   └── storage/                # Storage bucket config
├── scripts/
│   ├── verify-env.sh          # Environment verification (Bash)
│   └── verify-env.ps1         # Environment verification (PowerShell)
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions pipeline
├── .gitignore                  # Git ignore rules
├── .dockerignore                # Docker ignore rules
└── README.md                   # This file
```

## 💻 Development

### Running the Development Server

```bash
cd frontend
npm run dev -- --host
```

Access at `http://localhost:5173` (or the URL shown in terminal)

### Building for Production

```bash
cd frontend
npm run build

# Preview production build
npm run preview
```

Build output goes to `frontend/.svelte-kit/output/`

### Code Quality

```bash
# Type checking
npm run check

# Continuous type checking
npm run check:watch

# Linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Format check (without changes)
npm run format -- --check
```

## 🧪 Testing

### Unit Tests

```bash
cd frontend

# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test:run

# View test UI dashboard
npm run test:ui
```

### End-to-End Tests

```bash
cd frontend

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- example.spec.ts
```

### Test File Locations

- Unit tests: `frontend/tests/unit/`
- Integration tests: `frontend/tests/integration/`
- E2E tests: `frontend/tests/e2e/`
- Performance tests: `frontend/tests/performance/`

## 🔌 Database

### Using Supabase Local (Development)

```bash
# Start local Supabase
npx supabase start

# View database UI at http://localhost:54323 (Studio)
# API runs on http://localhost:54321

# Push migrations
npx supabase db push

# Pull schema changes
npx supabase db pull

# Stop local Supabase
npx supabase stop
```

### Using Hosted Supabase (Production)

```bash
# Link to remote project
npx supabase link --project-ref <project-id>

# Push migrations to production
npx supabase db push --linked

# Pull schema from production
npx supabase db pull --linked
```

## 🚢 Deployment

### Frontend Deployment

The frontend is optimized for Vercel, Netlify, or any static host.

**Vercel** (Recommended)
```bash
npm i -g vercel
vercel login
vercel
```

**Netlify**
- Connect GitHub repo to Netlify
- Set build command: `npm run build` (in `frontend/` directory)
- Set publish directory: `frontend/.svelte-kit/output/`

**Environment Variables for Deployment**
```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend Deployment

Supabase is fully managed — all data and auth flows through their hosted service.

1. Create project on [supabase.com](https://supabase.com)
2. Run migrations: `npx supabase db push --linked`
3. Configure Storage bucket access policies
4. Enable RLS policies for data protection

## 🔐 Environment Variables

### Public (Safe in Frontend)
```env
PUBLIC_SUPABASE_URL=     # Your Supabase project URL
PUBLIC_SUPABASE_ANON_KEY= # Public API key (safe to expose)
```

### Private (Server-Side Only)
```env
SUPABASE_SERVICE_ROLE_KEY= # Secret key — KEEP PRIVATE!
```

### Optional
```env
SUPABASE_STORAGE_BUCKET=images # Storage bucket name
NODE_ENV=development           # development, production, test
```

### Security Notes
- **Never** commit `.env.local` to git (included in `.gitignore`)
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Use environment variables for all secrets
- Rotate keys regularly in production

## 📚 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | SvelteKit | 2.57.0 |
| **Language** | TypeScript | 6.0.2 |
| **Build Tool** | Vite | 8.0.7 |
| **Backend** | Supabase | Latest |
| **Database** | PostgreSQL | 15+ |
| **Storage** | Supabase Storage | - |
| **Auth** | Supabase Auth | - |
| **Realtime** | Supabase Realtime | - |
| **Testing** | Vitest + Playwright | 4.1.6 + 1.60.0 |
| **Validation** | Zod | 4.4.3 |
| **Styling** | CSS + Svelte | - |

## 🛣️ Roadmap

### Phase 1: Core Setup ✅
- [x] SvelteKit initialization
- [x] Supabase configuration
- [x] Dependencies installation
- [ ] Testing framework setup

### Phase 2: Foundational Infrastructure (In Progress)
- [ ] Database migrations
- [ ] Auth middleware
- [ ] Shared UI components

### Phase 3-7: User Stories (Not Started)
- Scrapboard creation & management
- Notes (typed & handwritten)
- Image uploads
- Connection lines
- Theme customization

### Phase 8-9: Post-MVP (Not Started)
- Share links & public views
- Scrapboard organization

### Phase 10: Polish (Not Started)
- Performance optimization
- Accessibility audit
- Error handling
- Deployment

## 🤝 Contributing

Contributions are welcome! Please:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit with clear messages: `git commit -m 'Add feature description'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

### Development Guidelines
- Write tests for new features
- Follow existing code style (use `npm run lint:fix`)
- Keep components small and focused
- Document complex logic with comments

## 🐛 Troubleshooting

### Port 5173 Already in Use
```bash
# Kill process on port 5173
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### npm install Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues
- Check that `.env.local` has correct credentials
- Verify `PUBLIC_SUPABASE_URL` is accessible: `curl https://your-url.supabase.co`
- Check API key has proper permissions in Supabase dashboard

### Tests Not Running
```bash
# Reinstall test dependencies
npm install --save-dev vitest @testing-library/svelte

# Clear Vitest cache
npm run test -- --clearCache
```

## 📖 Documentation

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Playwright Docs](https://playwright.dev/)
- [Vitest Docs](https://vitest.dev/)

## 📄 License

MIT — See LICENSE file for details

## 👥 Authors

- Design & Specification: [Your Name]
- Implementation: [Your Name]

## 💬 Support

For questions, issues, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review documentation links above

---

**Happy creating! 🎨**
