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

export async function GET() {
  try {
    const [totalConversions, totalSize, successfulConversions, history] = await Promise.all([
      kv.get<number>('total_conversions'),
      kv.get<number>('total_size'),
      kv.get<number>('successful_conversions'),
      kv.get<ConversionRecord[]>('conversion_history')
    ]);

    return NextResponse.json({
      totalConversions: totalConversions || 0,
      totalSize: totalSize || 0,
      todayConversions: 0,
      successRate: totalConversions 
        ? Math.round((successfulConversions || 0) / totalConversions * 100) 
        : 0,
      history: history || []
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