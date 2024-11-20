import { NextRequest, NextResponse } from 'next/server';
import { mediaConverter } from '@/lib/converters/media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for larger files

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
    const result = await mediaConverter.convert(buffer, inputFormat, outputFormat);

    const contentType = outputFormat === 'mp3' 
      ? 'audio/mpeg'
      : 'video/mp4';

    return new NextResponse(result, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
      },
    });
  } catch (error) {
    console.error('Media conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert file' },
      { status: 500 }
    );
  }
} 