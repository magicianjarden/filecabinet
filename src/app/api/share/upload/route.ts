import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const iv = formData.get('iv') as string | null;
  const expiration = Number(formData.get('expiration')) || 24;
  const deleteOnDownload = formData.get('deleteOnDownload') === 'true';
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (file.size > 1 * 1024 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size exceeds 1GB limit' }, { status: 400 });
  }

  const fileId = uuidv4();
  const ext = file.name.split('.').pop();
  const storagePath = `${fileId}.${ext}`;

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from('shared-files')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Calculate expiration timestamp
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiration * 60 * 60 * 1000).toISOString();

  // Store metadata in shared_files table
  const { error: metaError } = await supabase.from('shared_files').insert([
    {
      id: fileId,
      path: storagePath,
      expires_at: expiresAt,
      delete_on_download: deleteOnDownload,
      iv,
    },
  ]);

  if (metaError) {
    // Optionally, delete the file from storage if metadata insert fails
    await supabase.storage.from('shared-files').remove([storagePath]);
    return NextResponse.json({ error: metaError.message }, { status: 500 });
  }

  return NextResponse.json({ id: fileId, name: file.name, type: file.type, ext, path: storagePath });
} 