# Supabase Storage Configuration

This directory contains storage bucket policies and configuration.

## Structure

- `images/` — Bucket for user-uploaded images and handwritten notes

## Bucket Setup

The `images` bucket is configured for:
- File types: JPG, PNG, GIF, WebP (validated)
- Max file size: 5MB
- Access: Authenticated users can upload; public URLs via signed links or share tokens

## Storage Policies

- **Authenticated Upload**: Users can upload to `/scrapboards/{scrapboard_id}/` folder
- **Public Read**: Signed URLs generated for temporary access (1 hour)
- **Permanent Read**: Share token holders can view images read-only

## Notes

- All uploads scanned for malware (Supabase default)
- Images served via CDN for performance
- Old images auto-purged with soft-delete cleanup job
