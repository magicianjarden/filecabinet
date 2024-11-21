import { NextRequest, NextResponse } from 'next/server';
import { mediaConverter } from '@/lib/converters/media';

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
    const result = await mediaConverter.convert(buffer, inputFormat, outputFormat);

    // Determine the correct MIME type based on the output format
    let contentType = 'video/mp4'; // default
    
    // Video formats
    if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(outputFormat)) {
      switch (outputFormat) {
        case 'mp4':
          contentType = 'video/mp4';
          break;
        case 'webm':
          contentType = 'video/webm';
          break;
        case 'mov':
          contentType = 'video/quicktime';
          break;
        case 'avi':
          contentType = 'video/x-msvideo';
          break;
        default:
          contentType = 'video/mp4'; // fallback for other video formats
      }
    }
    // Audio formats
    else if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(outputFormat)) {
      switch (outputFormat) {
        case 'mp3':
          contentType = 'audio/mpeg';
          break;
        case 'wav':
          contentType = 'audio/wav';
          break;
        case 'ogg':
          contentType = 'audio/ogg';
          break;
        case 'm4a':
          contentType = 'audio/mp4';
          break;
        case 'flac':
          contentType = 'audio/flac';
          break;
        case 'aac':
          contentType = 'audio/aac';
          break;
        default:
          contentType = 'audio/mpeg'; // fallback for other audio formats
      }
    }

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