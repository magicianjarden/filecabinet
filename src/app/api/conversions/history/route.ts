import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { ConversionRecord } from '@/types';

export async function GET() {
  try {
    const history = await kv.get<ConversionRecord[]>('conversion_history');
    return NextResponse.json(history || []);
  } catch (error) {
    console.error('Failed to fetch conversion history:', error);
    return NextResponse.json([], { status: 500 });
  }
} 