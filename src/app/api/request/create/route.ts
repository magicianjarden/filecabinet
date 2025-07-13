import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  // Set expiration to 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.from('file_requests').insert([
    {
      status: 'pending',
      expires_at: expiresAt,
    },
  ]).select('id').single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
} 