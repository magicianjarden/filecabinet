import { NextRequest, NextResponse } from 'next/server';
import { imageConverter } from '@/lib/converters/image';
import { trackConversion } from '@/lib/utils/stats-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const inputFormat = formData.get('inputFormat') as string;
    const outputFormat = formData.get('outputFormat') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await imageConverter.convert(buffer, inputFormat, outputFormat);

    // Track conversion stats
    await trackConversion(
      'image',
      inputFormat,
      outputFormat,
      buffer.length
    );

    return new NextResponse(result, {
      headers: {
        'Content-Type': `image/${outputFormat}`,
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    });
  } catch (error) {
    console.error('Image conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert file' },
      { status: 500 }
    );
  }
} 