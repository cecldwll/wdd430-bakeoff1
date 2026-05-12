# Supabase Edge Functions

This directory contains serverless functions deployed to Supabase.

## Structure

- `image-optimization/` — Optimize uploaded images (resize, compress)
- `generate-share-token/` — Create shareable links
- `cleanup-deleted/` — Soft-delete purge job (30-day retention)

## Deployment

```bash
# Deploy function
npx supabase functions deploy [function-name]

# Test locally
npx supabase functions serve [function-name]
```

## Notes

- Functions are written in TypeScript
- Deployed as serverless HTTP endpoints
- Can be triggered by HTTP requests or Supabase hooks
- Environment variables available via `Deno.env`
