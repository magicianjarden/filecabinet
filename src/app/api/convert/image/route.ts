import { NextRequest, NextResponse } from 'next/server';
import { imageConverter } from '@/lib/converters/image';
import { handleConversionWithStats } from '@/lib/utils/conversion-wrapper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

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

    if (!imageConverter.inputFormats.includes(inputFormat)) {
      return NextResponse.json({
        error: `Unsupported input format: ${inputFormat}`,
        code: 'INVALID_INPUT_FORMAT'
      }, { status: 400 });
    }

    if (!imageConverter.outputFormats.includes(outputFormat)) {
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
        return await imageConverter.convert(buffer, inputFormat, outputFormat);
      }
    );

    return new NextResponse(result, {
      headers: {
        'Content-Type': `image/${outputFormat}`,
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
        'Content-Length': result.length.toString(),
      },
    });
  } catch (error) {
    console.error('Image conversion error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to convert image',
      code: 'CONVERSION_FAILED',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 