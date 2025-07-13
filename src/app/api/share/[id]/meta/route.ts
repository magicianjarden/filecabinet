import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

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

  // Optionally, fetch file size/type from storage
  let size = null;
  let type = null;
  if (meta.path) {
    const { data: stat, error: statError } = await supabase.storage.from('shared-files').list('', { search: meta.path });
    if (!statError && stat && stat.length > 0) {
      size = stat[0].metadata?.size || null;
      type = stat[0].metadata?.mimetype || null;
    }
  }

  return NextResponse.json({
    name: meta.name || meta.path.replace(/^[^/]*\//, '').replace(/\.enc$/, ''),
    type: meta.type || type || 'application/octet-stream',
    size,
  });
} 