import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

// This endpoint is for preview/decryption only. It MUST NEVER delete the file.
// Only the /download endpoint or the edge function should delete files.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
  }

  // Fetch metadata from shared_files table
  const { data: meta, error: metaError } = await supabase
    .from('shared_files')
    .select('*')
    .eq('id', id)
    .single();
  if (metaError || !meta) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Check expiration
  const now = new Date();
  const expiresAt = new Date(meta.expires_at);
  if (now > expiresAt) {
    // Delete file and metadata (only by expiration, not by preview)
    await supabase.storage.from('shared-files').remove([meta.path]);
    await supabase.from('shared_files').delete().eq('id', id);
    return NextResponse.json({ error: 'File expired' }, { status: 410 });
  }

  // Download file from storage (for preview/decryption only, never delete here)
  const { data: fileData, error: fileError } = await supabase.storage.from('shared-files').download(meta.path);
  if (fileError || !fileData) {
    return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
  }

  return new Response(fileData, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `inline; filename="${id}.enc"`,
    },
  });
} 