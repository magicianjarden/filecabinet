import { NextRequest, NextResponse } from 'next/server';
import { ebookConverter } from '@/lib/converters/ebook';
import { handleConversionWithStats } from '@/lib/utils/conversion-wrapper';

const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 1GB

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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        code: 'FILE_TOO_LARGE'
      }, { status: 400 });
    }

    if (!ebookConverter.inputFormats.includes(inputFormat)) {
      return NextResponse.json({
        error: `Unsupported input format: ${inputFormat}`,
        code: 'INVALID_INPUT_FORMAT'
      }, { status: 400 });
    }

    if (!ebookConverter.outputFormats.includes(outputFormat)) {
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
        return await ebookConverter.convert(buffer, inputFormat, outputFormat);
      }
    );

    return new NextResponse(result, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
        'Content-Length': result.length.toString(),
      },
    });
  } catch (error) {
    console.error('Ebook conversion error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to convert ebook',
      code: 'CONVERSION_FAILED',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 