import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get bucket information
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json({ error: bucketsError.message }, { status: 500 });
    }

    // Find the drive-files bucket
    const driveFilesBucket = buckets.find(bucket => bucket.id === 'drive-files');

    return NextResponse.json({
      buckets: buckets.map(bucket => ({
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        allowedMimeTypes: bucket.allowed_mime_types,
        fileSizeLimit: bucket.file_size_limit,
      })),
      driveFilesBucket: driveFilesBucket ? {
        id: driveFilesBucket.id,
        name: driveFilesBucket.name,
        public: driveFilesBucket.public,
        allowedMimeTypes: driveFilesBucket.allowed_mime_types,
        fileSizeLimit: driveFilesBucket.file_size_limit,
      } : null,
    });

  } catch (error) {
    console.error('Storage debug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 