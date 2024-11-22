import { NextResponse } from 'next/server';
import { getGlobalStats } from '@/lib/utils/stats-service';

export async function GET() {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({
        totalConversions: 0,
        todayConversions: 0,
        totalSize: 0,
        successfulConversions: 0,
        failedConversions: 0,
        averageTime: 0,
        conversionRate: 0,
        conversionTimes: [],
        byFormat: {},
        bySize: {},
        hourlyActivity: {},
        successRate: 0,
        lastUpdated: new Date().toISOString(),
        popularConversions: []
      });
    }

    const stats = await getGlobalStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 