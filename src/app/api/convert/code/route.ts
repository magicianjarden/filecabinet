import { NextRequest, NextResponse } from 'next/server';
import { codeConverter } from '@/lib/converters/code';
import { getMimeType } from '@/config/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

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

    return new NextResponse(result, {
      headers: {
        'Content-Type': getMimeType(outputFormat),
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
