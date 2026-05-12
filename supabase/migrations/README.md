# Supabase Migrations

This directory contains database migrations for the Digital Scrapboard project.

## Structure

- `001_initial_schema.sql` — User, Scrapboard, Note, Image, Line, SharedAccess tables
- `002_rls_policies.sql` — Row-Level Security policies for data protection
- `003_storage_setup.sql` — Storage bucket configuration

## Running Migrations

### Local Development

```bash
# Initialize Supabase local environment
npx supabase init

# Start local Supabase
npx supabase start

# Apply migrations
npx supabase db push
```

### Production

```bash
# Push migrations to hosted Supabase
npx supabase db push --linked
```

## Migration Naming Convention

- Prefix with sequential numbers (001, 002, 003, ...)
- Use descriptive names in snake_case
- One logical change per migration
- Include both up and down operations

## Notes

- All tables include soft-delete with `deleted_at` column
- Row-Level Security (RLS) enforces data access control
- Storage buckets configured for image uploads
- Migrations are version-controlled for reproducibility
