import { NextRequest, NextResponse } from 'next/server';
import { archiveConverter } from '@/lib/converters/archive';
import { handleConversionWithStats } from '@/lib/utils/conversion-wrapper';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

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

    const result = await handleConversionWithStats(
      file,
      outputFormat,
      async () => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return await archiveConverter.convert(buffer, inputFormat, outputFormat);
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
    console.error('Archive conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert file' },
      { status: 500 }
    );
  }
} 