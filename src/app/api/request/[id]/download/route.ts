import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'No request ID provided' }, { status: 400 });
  }

  // Fetch file request
  const { data: request, error } = await supabase
    .from('file_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  // Check expiration
  const now = new Date();
  const expiresAt = new Date(request.expires_at);
  if (now > expiresAt) {
    // Delete file and metadata
    if (request.storage_path) {
      await supabase.storage.from('shared-files').remove([request.storage_path]);
    }
    await supabase.from('file_requests').delete().eq('id', id);
    return NextResponse.json({ error: 'File expired' }, { status: 410 });
  }

  if (request.status !== 'fulfilled' || !request.storage_path) {
    return NextResponse.json({ error: 'File not available for download' }, { status: 404 });
  }

  // Download file from storage
  const { data: fileData, error: fileError } = await supabase.storage.from('shared-files').download(request.storage_path);
  if (fileError || !fileData) {
    // If file is missing but metadata exists, treat as already deleted after first download
    if (request.delete_after_download) {
      await supabase.from('file_requests').delete().eq('id', id);
      return NextResponse.json({ error: 'File was already deleted after first download.' }, { status: 410 });
    }
    return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
  }

  // If delete_after_download, delete file and metadata after serving
  let response = new Response(fileData, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${request.file_metadata?.name || id}.enc"`,
    },
  });

  if (request.delete_after_download) {
    // Delete asynchronously so the response is not delayed
    (async () => {
      await supabase.storage.from('shared-files').remove([request.storage_path]);
      await supabase.from('file_requests').delete().eq('id', id);
    })();
  } else {
    // Optionally, mark as downloaded
    await supabase.from('file_requests').update({ status: 'downloaded' }).eq('id', id);
  }

  return response;
} 