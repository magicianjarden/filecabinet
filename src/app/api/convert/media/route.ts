import { NextRequest, NextResponse } from 'next/server';
import { mediaConverter } from '@/lib/converters/media';
import { handleConversionWithStats } from '@/lib/utils/conversion-wrapper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit for media

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const inputFormat = formData.get('inputFormat') as string;
    const outputFormat = formData.get('outputFormat') as string;

    // Validation
    if (!file || !inputFormat || !outputFormat) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        code: 'FILE_TOO_LARGE'
      }, { status: 400 });
    }

    if (!mediaConverter.inputFormats.includes(inputFormat)) {
      return NextResponse.json({
        error: `Unsupported input format: ${inputFormat}`,
        code: 'INVALID_INPUT_FORMAT'
      }, { status: 400 });
    }

    if (!mediaConverter.outputFormats.includes(outputFormat)) {
      return NextResponse.json({
        error: `Unsupported output format: ${outputFormat}`,
        code: 'INVALID_OUTPUT_FORMAT'
      }, { status: 400 });
    }

    const result = await handleConversionWithStats(
      file,
      outputFormat,
      async () => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const convertedBuffer = await mediaConverter.convert(
          buffer,
          inputFormat,
          outputFormat
        );

        return convertedBuffer;
      }
    );

    return new NextResponse(result, {
      headers: {
        'Content-Type': `video/${outputFormat}`,
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
        'Content-Length': result.length.toString(),
      },
    });
  } catch (error) {
    console.error('Media conversion error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to convert media',
      code: 'CONVERSION_FAILED',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 