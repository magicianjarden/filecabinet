-- Create users table for drive functionality
CREATE TABLE IF NOT EXISTS drive_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 10737418240, -- 10GB default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create folders table for drive organization
CREATE TABLE IF NOT EXISTS drive_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES drive_users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, parent_id, name)
);

-- Create files table for drive files
CREATE TABLE IF NOT EXISTS drive_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES drive_users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES drive_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  encryption_key TEXT NOT NULL, -- Encrypted file encryption key
  encryption_iv TEXT NOT NULL, -- Initialization vector for file encryption
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file sharing table for drive file sharing
CREATE TABLE IF NOT EXISTS drive_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES drive_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES drive_users(id) ON DELETE CASCADE NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Optional password protection
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drive_files_user_id ON drive_files(user_id);
CREATE INDEX IF NOT EXISTS idx_drive_files_folder_id ON drive_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_user_id ON drive_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_parent_id ON drive_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_drive_shares_file_id ON drive_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_drive_shares_token ON drive_shares(share_token);

-- Enable Row Level Security (RLS)
ALTER TABLE drive_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON drive_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON drive_users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON drive_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Folders policies
CREATE POLICY "Users can view own folders" ON drive_folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON drive_folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON drive_folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON drive_folders
  FOR DELETE USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view own files" ON drive_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON drive_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON drive_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON drive_files
  FOR DELETE USING (auth.uid() = user_id);

-- Shares policies
CREATE POLICY "Users can view own shares" ON drive_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shares" ON drive_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shares" ON drive_shares
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares" ON drive_shares
  FOR DELETE USING (auth.uid() = user_id);

-- Public access to shared files (for download)
CREATE POLICY "Public can view shared files" ON drive_shares
  FOR SELECT USING (true);

-- Create storage bucket for drive files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('drive-files', 'drive-files', false, 10737418240, ARRAY['*/*'])
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for drive files
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'drive-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'drive-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'drive-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'drive-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create functions for automatic user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.drive_users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update storage usage
CREATE OR REPLACE FUNCTION update_user_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE drive_users 
    SET storage_used = storage_used + NEW.size,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE drive_users 
    SET storage_used = storage_used - OLD.size,
        updated_at = NOW()
    WHERE id = OLD.user_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE drive_users 
    SET storage_used = storage_used - OLD.size + NEW.size,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for storage usage updates
CREATE OR REPLACE TRIGGER on_drive_file_change
  AFTER INSERT OR UPDATE OR DELETE ON drive_files
  FOR EACH ROW EXECUTE FUNCTION update_user_storage_usage(); 