import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

// This endpoint is the ONLY place where delete-on-download logic should occur.
// Only delete after a successful download, and never on preview.
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
    // Delete file and metadata
    await supabase.storage.from('shared-files').remove([meta.path]);
    await supabase.from('shared_files').delete().eq('id', id);
    return NextResponse.json({ error: 'File expired' }, { status: 410 });
  }

  // Download file from storage
  const { data: fileData, error: fileError } = await supabase.storage.from('shared-files').download(meta.path);
  if (fileError || !fileData) {
    // If file is missing but metadata exists, treat as already deleted after first download
    if (meta.delete_on_download) {
      await supabase.from('shared_files').delete().eq('id', id);
      return NextResponse.json({ error: 'File was already deleted after first download.' }, { status: 410 });
    }
    return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
  }

  // If delete_on_download, delete file and metadata after serving (only if file is served)
  let response = new Response(fileData, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${id}.enc"`,
    },
  });

  if (meta.delete_on_download) {
    // Delete asynchronously so the response is not delayed
    (async () => {
      await supabase.storage.from('shared-files').remove([meta.path]);
      await supabase.from('shared_files').delete().eq('id', id);
    })();
  }

  return response;
} 