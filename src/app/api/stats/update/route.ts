import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { 
      fileSize, 
      fromFormat, 
      toFormat, 
      conversionTime, 
      success 
    } = await request.json();

    const hour = new Date().getHours().toString();
    const today = new Date().toISOString().split('T')[0];

    // Increment counters
    await Promise.all([
      // Update total conversions
      kv.incr('stats:total_conversions'),
      
      // Update today's conversions
      kv.incr(`stats:daily:${today}`),
      
      // Update successful/failed counts
      success 
        ? kv.incr('stats:successful_conversions')
        : kv.incr('stats:failed_conversions'),
      
      // Update total size
      kv.incrby('stats:total_size', fileSize),
      
      // Update format stats
      kv.hincrby('stats:formats', `${fromFormat}-to-${toFormat}`, 1),
      
      // Update size category
      kv.hincrby('stats:sizes', getSizeCategory(fileSize), 1),
      
      // Update hourly activity
      kv.hincrby('stats:hourly', hour, 1),
      
      // Add conversion time to list
      conversionTime && kv.rpush('stats:conversion_times', conversionTime.toString())
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
function getSizeCategory(size: number): string {
  const mb = size / (1024 * 1024);
  if (mb < 1) return '< 1MB';
  if (mb < 5) return '1-5MB';
  if (mb < 10) return '5-10MB';
  if (mb < 50) return '10-50MB';
  return '> 50MB';
}
