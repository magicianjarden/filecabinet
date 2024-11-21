import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalConversions, totalSize, successfulConversions] = await Promise.all([
      kv.get<number>('total_conversions'),
      kv.get<number>('total_size'),
      kv.get<number>('successful_conversions')
    ]);

    return NextResponse.json({
      totalConversions: totalConversions || 0,
      totalSize: totalSize || 0,
      todayConversions: 0,
      successRate: totalConversions 
        ? Math.round((successfulConversions || 0) / totalConversions * 100) 
        : 0
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({
      totalConversions: 0,
      totalSize: 0,
      todayConversions: 0,
      successRate: 0
    }, { status: 500 });
  }
} 