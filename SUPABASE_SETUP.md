<!-- SUPABASE PROJECT SETUP GUIDE -->

# Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in or create an account
2. Click "New Project"
3. Fill in project details:
   - **Name**: digital-scrapboard (or your preferred name)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose closest to your users (e.g., us-east-1, eu-west-1)
   - **Pricing Plan**: Select appropriate tier
4. Wait for project provisioning (2-3 minutes)

# Step 2: Get Your API Keys

Once project is created:

1. Go to **Settings → API** in your Supabase dashboard
2. You'll see:
   - **Project URL**: `https://[YOUR-PROJECT-ID].supabase.co`
   - **Anon Key**: Public key (safe to expose in frontend)
   - **Service Role Key**: Secret key (KEEP PRIVATE - only for server/edge functions)

Copy these values - you'll need them in the next step.

# Step 3: Get Database Credentials (Optional - for local Supabase)

For local Supabase development with `supabase start`:
1. The CLI will generate LOCAL credentials automatically
2. You'll see output like:
   ```
   Started supabase local development setup.
   
   API URL: http://localhost:54321
   Anon Key: eyJ...
   Service Role Key: eyJ...
   ```

# Step 4: Environment Variables

Add your Supabase credentials to `.env.local` in the project root:

```env
# Supabase API Configuration
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service Role Key (NEVER commit this - use .env.local or server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Storage Configuration
SUPABASE_STORAGE_BUCKET=images
```

Or for local development with Supabase CLI:

```env
# Local Supabase Setup
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # from supabase start output
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # from supabase start output
SUPABASE_STORAGE_BUCKET=images
```

# Step 5: Verify Connection

Run this command to test your connection:

```bash
cd frontend
npm run dev
```

Then open browser to http://localhost:5173 and check console for any errors.
