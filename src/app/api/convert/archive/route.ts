import { NextRequest, NextResponse } from 'next/server';
import { archiveConverter } from '@/lib/converters/archive';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

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

    // Validate input format
    if (!['zip', 'rar'].includes(inputFormat)) {
      return NextResponse.json(
        { error: 'Unsupported input format' },
        { status: 400 }
      );
    }

    // For now, we only support converting to ZIP
    if (outputFormat !== 'zip') {
      return NextResponse.json(
        { error: 'Currently only supports converting to ZIP format' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await archiveConverter.convert(buffer, inputFormat, outputFormat);

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