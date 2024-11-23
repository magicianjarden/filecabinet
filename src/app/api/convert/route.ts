import { NextRequest, NextResponse } from 'next/server';
import { updateStats } from '@/lib/utils/stats-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const { inputFormat, outputFormat } = await request.json();

    return NextResponse.json({
      message: 'Please use specific converter endpoints',
      availableEndpoints: [
        '/api/convert/archive',
        '/api/convert/document',
        '/api/convert/image',
        '/api/convert/media',
        '/api/convert/code'
      ]
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } finally {
    const endTime = Date.now();
    const conversionTime = (endTime - startTime) / 1000;

    // Record failed conversion attempt
    await updateStats({
      fileSize: 0,
      fromFormat: '',
      toFormat: '', 
      conversionTime,
      success: false
    });
  }
} 