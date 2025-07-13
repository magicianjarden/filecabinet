import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'No request ID provided' }, { status: 400 });
  }

  // Fetch the file request
  const { data: request, error: reqError } = await supabase
    .from('file_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (reqError || !request) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'Request already fulfilled or expired' }, { status: 409 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const iv = formData.get('iv') as string | null;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (file.size > 1 * 1024 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size exceeds 1GB limit' }, { status: 400 });
  }

  const ext = file.name.split('.').pop();
  const storagePath = `requests/${id}.${ext}`;
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

  // Update the file_requests row
  const fileMeta = {
    name: file.name,
    size: file.size,
    type: file.type,
    iv,
  };
  const { error: updateError } = await supabase
    .from('file_requests')
    .update({
      status: 'fulfilled',
      fulfilled_at: new Date().toISOString(),
      file_metadata: fileMeta,
      storage_path: storagePath,
    })
    .eq('id', id);
  if (updateError) {
    // Optionally, delete the file from storage if metadata update fails
    await supabase.storage.from('shared-files').remove([storagePath]);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ message: 'Upload route is working', id: params.id });
} 