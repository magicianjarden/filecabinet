import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { ConversionStats } from '@/types/stats';

interface StatsData {
  total: number;
  today: number;
  size: number;
  successful: number;
  failed: number;
}

export async function GET() {
  try {
    console.log('Fetching stats from KV...');

    const [
      conversions,
      sizes,
      times,
      formats,
      hourly
    ] = await Promise.all([
      kv.get<StatsData>('stats:conversions').then(data => data || {
        total: 0,
        today: 0,
        size: 0,
        successful: 0,
        failed: 0
      }),
      kv.hgetall('stats:sizes').then(data => convertToNumberRecord(data || {})),
      kv.lrange('stats:times', 0, 99).then(data => 
        (data || []).map(time => Number(time))
      ),
      kv.hgetall('stats:formats').then(data => convertToNumberRecord(data || {})),
      kv.hgetall('stats:hourly').then(data => convertToNumberRecord(data || {}))
    ]);

    console.log('Raw KV data:', { conversions, sizes, times, formats, hourly });

    const stats: ConversionStats = {
      totalConversions: conversions.total,
      todayConversions: conversions.today,
      totalSize: conversions.size,
      successfulConversions: conversions.successful,
      failedConversions: conversions.failed,
      averageTime: times.length 
        ? times.reduce((a, b) => a + b, 0) / times.length 
        : 0,
      conversionRate: conversions.total > 0
        ? (conversions.successful / conversions.total) * 100 
        : 0,
      conversionTimes: times,
      byFormat: formats,
      bySize: sizes,
      hourlyActivity: hourly,
      successRate: conversions.total > 0
        ? (conversions.successful / conversions.total) * 100 
        : 0,
      lastUpdated: new Date().toISOString(),
      popularConversions: Object.entries(formats)
        .map(([format, count]) => {
          const [from, to] = format.split('-to-');
          return { from, to, count };
        })
        .sort((a, b) => b.count - a.count)
    };

    console.log('Processed stats:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' }, 
      { status: 500 }
    );
  }
}

// Helper function to convert record values to numbers
function convertToNumberRecord(record: Record<string, unknown>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : 0
    ])
  );
} 