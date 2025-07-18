-- Update storage bucket to allow all MIME types including application/octet-stream
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['*/*']
WHERE id = 'drive-files';

-- If the bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('drive-files', 'drive-files', false, 10737418240, ARRAY['*/*'])
ON CONFLICT (id) DO UPDATE SET 
  allowed_mime_types = ARRAY['*/*'],
  file_size_limit = 10737418240; 