import { NextRequest, NextResponse } from 'next/server';
import { presentationConverter } from '@/lib/converters/presentation';
import { handleConversionWithStats } from '@/lib/utils/conversion-wrapper';
import { getMimeType } from '@/lib/utils/mime-types';

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

    if (!presentationConverter.inputFormats.includes(inputFormat)) {
      return NextResponse.json({
        error: `Unsupported input format: ${inputFormat}`,
        code: 'INVALID_INPUT_FORMAT'
      }, { status: 400 });
    }

    if (!presentationConverter.outputFormats.includes(outputFormat)) {
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
        return await presentationConverter.convert(buffer, inputFormat, outputFormat);
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
    console.error('Presentation conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert presentation' },
      { status: 500 }
    );
  }
} 