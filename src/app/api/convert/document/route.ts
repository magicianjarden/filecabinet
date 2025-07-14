import { NextRequest, NextResponse } from 'next/server';
import { documentConverter } from '@/lib/converters/document';
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

    if (["epub", "mobi", "azw3"].includes(inputFormat) || ["epub", "mobi", "azw3"].includes(outputFormat)) {
      return NextResponse.json({ error: 'Ebook formats must be converted using the /api/convert/ebook endpoint.' }, { status: 400 });
    }

    if (!documentConverter.inputFormats.includes(inputFormat)) {
      return NextResponse.json({
        error: `Unsupported input format: ${inputFormat}`,
        code: 'INVALID_INPUT_FORMAT'
      }, { status: 400 });
    }
    if (!documentConverter.outputFormats.includes(outputFormat)) {
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
        return await documentConverter.convert(buffer, inputFormat, outputFormat);
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
    console.error('Document conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert file' },
      { status: 500 }
    );
  }
} 