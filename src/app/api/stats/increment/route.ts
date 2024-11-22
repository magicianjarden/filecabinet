import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const [currentTotal, currentSuccessful] = await Promise.all([
      kv.get<number>('total_conversions').then(val => val || 0),
      kv.get<number>('successful_conversions').then(val => val || 0)
    ]);

    await kv.set('total_conversions', currentTotal + 1);
    await kv.set('successful_conversions', currentSuccessful + 1);

    return NextResponse.json({
      success: true,
      totalConversions: currentTotal + 1,
      successfulConversions: currentSuccessful + 1
    });
  } catch (error) {
    console.error('Failed to increment stats:', error);
    return NextResponse.json({ error: 'Failed to increment stats' }, { status: 500 });
  }
} 