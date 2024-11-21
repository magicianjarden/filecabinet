import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileSize } = await request.json();

    // Get current values with default values if null
    const [totalConversions, totalSize, successfulConversions] = await Promise.all([
      kv.get<number>('total_conversions').then(val => val ?? 0),
      kv.get<number>('total_size').then(val => val ?? 0),
      kv.get<number>('successful_conversions').then(val => val ?? 0)
    ]);

    // Update values
    await Promise.all([
      kv.set('total_conversions', totalConversions + 1),
      kv.set('total_size', totalSize + fileSize),
      kv.set('successful_conversions', successfulConversions + 1)
    ]);

    // Return updated stats
    return NextResponse.json({
      totalConversions: totalConversions + 1,
      totalSize: totalSize + fileSize,
      todayConversions: 0,
      successRate: Math.round(((successfulConversions + 1) / (totalConversions + 1)) * 100)
    });
  } catch (error) {
    console.error('Failed to update stats:', error);
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
  }
}