// import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST() {
  // Commented out all stats tracking for build
  return NextResponse.json({
    success: true,
    totalConversions: 0,
    successfulConversions: 0
  });
} 