import { NextRequest, NextResponse } from 'next/server';
import { codeConverter } from '@/lib/converters/code';
import { handleConversionWithStats } from '@/lib/utils/conversion-wrapper';
import { getMimeType } from '@/lib/utils/mime-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const inputFormat = formData.get('inputFormat') as string;
    const outputFormat = formData.get('outputFormat') as string;

    if (!file || !inputFormat || !outputFormat) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await handleConversionWithStats(
      file,
      outputFormat,
      async () => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return await codeConverter.convert(buffer, inputFormat, outputFormat);
      }
    );

    return new NextResponse(result, {
      headers: {
        'Content-Type': getMimeType(outputFormat),
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
        'Content-Length': result.length.toString(),
      },
    });
  } catch (error) {
    console.error('Code conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert file' },
      { status: 500 }
    );
  }
}
