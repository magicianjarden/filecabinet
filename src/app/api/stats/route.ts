import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all stats data
    const [
      totalConversions,
      successfulConversions,
      failedConversions,
      totalSize,
      conversionTimes,
      formats,
      sizes,
      hourly
    ] = await Promise.all([
      kv.get('stats:total_conversions'),
      kv.get('stats:successful_conversions'),
      kv.get('stats:failed_conversions'),
      kv.get('stats:total_size'),
      kv.lrange('stats:conversion_times', 0, 99),
      kv.hgetall('stats:formats'),
      kv.hgetall('stats:sizes'),
      kv.hgetall('stats:hourly')
    ]);

    // Convert times to numbers and calculate average
    const times = (conversionTimes || []).map(Number).filter(t => !isNaN(t));
    const averageTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;

    // Calculate success rate
    const total = Number(totalConversions) || 0;
    const successful = Number(successfulConversions) || 0;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    // Process format data
    const popularConversions = Object.entries(formats || {})
      .map(([format, count]) => {
        const [from, to] = format.split('-to-');
        return { from, to, count: Number(count) };
      })
      .sort((a, b) => b.count - a.count);

    const stats = {
      totalConversions: total,
      successfulConversions: successful,
      failedConversions: Number(failedConversions) || 0,
      totalSize: Number(totalSize) || 0,
      averageTime,
      successRate,
      conversionTimes: times,
      byFormat: formats || {},
      bySize: sizes || {},
      hourlyActivity: hourly || {},
      popularConversions,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 