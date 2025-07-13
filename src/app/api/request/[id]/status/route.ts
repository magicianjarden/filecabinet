import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'No request ID provided' }, { status: 400 });
  }

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
  let expired = false;
  if (now > expiresAt) {
    expired = true;
  }

  return NextResponse.json({
    status: expired ? 'expired' : request.status,
    file: request.file_metadata || null,
    available: !expired && request.status === 'fulfilled',
    expires_at: request.expires_at,
    fulfilled_at: request.fulfilled_at,
  });
} 