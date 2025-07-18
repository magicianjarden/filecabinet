-- Fix storage bucket MIME type configuration
-- Run this in your Supabase SQL editor

-- Update existing bucket to allow all MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['*/*']
WHERE id = 'drive-files';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('drive-files', 'drive-files', false, 10737418240, ARRAY['*/*'])
ON CONFLICT (id) DO UPDATE SET 
  allowed_mime_types = ARRAY['*/*'],
  file_size_limit = 10737418240;

-- Verify the bucket configuration
SELECT id, name, allowed_mime_types, file_size_limit 
FROM storage.buckets 
WHERE id = 'drive-files'; 