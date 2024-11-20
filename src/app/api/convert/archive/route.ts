import { NextRequest, NextResponse } from 'next/server';
import { archiveConverter } from '@/lib/converters/archive';
import { trackConversion } from '@/lib/utils/stats-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

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
    const result = await archiveConverter.convert(buffer, inputFormat, outputFormat);

    // Track conversion stats
    await trackConversion('archive', inputFormat, outputFormat, buffer.length);

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    });
  } catch (error) {
    console.error('Archive conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert file' },
      { status: 500 }
    );
  }
} 