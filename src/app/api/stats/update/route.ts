// import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Commented out all stats tracking for build
  return NextResponse.json({ success: true });
}
function getSizeCategory(size: number): string {
  const mb = size / (1024 * 1024);
  if (mb < 1) return '< 1MB';
  if (mb < 5) return '1-5MB';
  if (mb < 10) return '5-10MB';
  if (mb < 50) return '10-50MB';
  return '> 50MB';
}
