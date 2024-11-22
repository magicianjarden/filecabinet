import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

interface ConversionRecord {
  fileName: string;
  fileSize: number;
  originalFormat: string;
  targetFormat: string;
  timestamp: string;
  status: 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
}

// Consider adding caching to prevent frequent KV access
const CACHE_TTL = 60 * 1000; // 1 minute
let statsCache = {
  data: {} as { totalConversions: number; totalSize: number; },
  timestamp: 0
};

export async function GET() {
  try {
    // Check cache first
    if (Date.now() - statsCache.timestamp < CACHE_TTL) {
      return NextResponse.json(statsCache.data);
    }

    const stats = await Promise.all([
      kv.get<number>('total_conversions'),
      kv.get<number>('total_size'),
      kv.get<number>('successful_conversions'),
      kv.get<ConversionRecord[]>('conversion_history')
    ]);

    // Update cache
    statsCache = {
      data: {
        totalConversions: stats[0] || 0,
        totalSize: stats[1] || 0,
        // ... other stats
      },
      timestamp: Date.now()
    };

    return NextResponse.json(statsCache.data);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({
      totalConversions: 0,
      totalSize: 0,
      todayConversions: 0,
      successRate: 0,
      history: []
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json() as ConversionRecord;
    
    // Get current values with default values if null
    const [currentHistory, currentTotalConversions, currentTotalSize, currentSuccessfulConversions] = await Promise.all([
      kv.get<ConversionRecord[]>('conversion_history').then(val => val || []),
      kv.get<number>('total_conversions').then(val => val || 0),
      kv.get<number>('total_size').then(val => val || 0),
      kv.get<number>('successful_conversions').then(val => val || 0)
    ]);

    const updatedHistory = [record, ...currentHistory].slice(0, 100);
    const isSuccessful = record.status === 'completed';

    await Promise.all([
      kv.set('conversion_history', updatedHistory),
      kv.set('total_conversions', currentTotalConversions + 1),
      kv.set('total_size', currentTotalSize + record.fileSize),
      isSuccessful ? kv.set('successful_conversions', currentSuccessfulConversions + 1) : null
    ]);

    return NextResponse.json({
      history: updatedHistory,
      totalConversions: currentTotalConversions + 1,
      totalSize: currentTotalSize + record.fileSize,
      todayConversions: 0,
      successRate: Math.round(((currentSuccessfulConversions + (isSuccessful ? 1 : 0)) / (currentTotalConversions + 1)) * 100)
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({
      totalConversions: 0,
      totalSize: 0,
      todayConversions: 0,
      successRate: 0,
      history: []
    }, { status: 500 });
  }
} 