import { NextRequest, NextResponse } from 'next/server';
import { updateStats } from '@/lib/utils/stats-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let fileSize = 0;
  let fromFormat = '';
  let targetFormat = '';

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    targetFormat = formData.get('targetFormat') as string;
    fileSize = file.size;
    fromFormat = file.name.split('.').pop() || '';

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
    console.error('Conversion error:', error);

    // Record failed conversion
    await updateStats({
      fileSize,
      fromFormat,
      toFormat: targetFormat,
      success: false
    });

    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
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