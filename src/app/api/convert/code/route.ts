import { NextRequest, NextResponse } from 'next/server';
import { codeConverter } from '@/lib/converters/code';
import { trackConversion } from '@/lib/utils/stats-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
    const result = await codeConverter.convert(buffer, inputFormat, outputFormat);

    // Track conversion stats
    await trackConversion('code', inputFormat, outputFormat, buffer.length);

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    });
  } catch (error) {
    console.error('Code conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert file' },
      { status: 500 }
    );
  }
}
