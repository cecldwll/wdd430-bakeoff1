-- Storage Bucket Configuration for Digital Scrapboard
-- This migration sets up the images bucket for user uploads

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, owner, public)
VALUES ('images', 'images', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload images to their own scrapboards
CREATE POLICY "Users can upload images to their scrapboards"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can read images from their own scrapboards
CREATE POLICY "Users can read images from their scrapboards"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can update images (modify metadata) in their scrapboards
CREATE POLICY "Users can update images in their scrapboards"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can delete images from their scrapboards
CREATE POLICY "Users can delete images from their scrapboards"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Anonymous users can read public images from shared scrapboards
CREATE POLICY "Anonymous can read images from shared scrapboards"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[2] = 'public'
  );
