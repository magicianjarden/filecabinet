import { NextRequest, NextResponse } from 'next/server';
import { mediaConverter } from '@/lib/converters/media';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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

    console.log(`Starting media conversion: ${inputFormat} -> ${outputFormat}`);
    console.log(`File size: ${file.size} bytes`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mediaConverter.convert(buffer, inputFormat, outputFormat);

    console.log('Conversion completed successfully');

    return new NextResponse(result, {
      headers: {
        'Content-Type': getMimeTypeForFormat(outputFormat),
        'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    });
  } catch (error) {
    console.error('Media conversion error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to convert file' },
      { status: 500 }
    );
  }
}

function getMimeTypeForFormat(format: string): string {
  const mimeTypes: Record<string, string> = {
    // Video formats
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'm4v': 'video/x-m4v',
    
    // Audio formats
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
  };

  return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
} 