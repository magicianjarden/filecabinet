import { NextRequest, NextResponse } from 'next/server';
import { mediaConverter } from '@/lib/converters/media';
import { handleConversionWithStats } from '@/lib/utils/conversion-wrapper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit for media

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const inputFormat = formData.get('inputFormat') as string;
    const outputFormat = formData.get('outputFormat') as string;

    console.log('Media conversion request:', {
      fileName: file.name,
      fileSize: file.size,
      inputFormat,
      outputFormat
    });

    if (!file || !inputFormat || !outputFormat) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Converting media file...');
    
    try {
      const result = await handleConversionWithStats(
        file,
        outputFormat,
        async () => {
          const convertedBuffer = await mediaConverter.convert(
            buffer,
            inputFormat,
            outputFormat
          );
          console.log('Media conversion completed');
          return convertedBuffer;
        }
      );

      const mimeType = outputFormat.startsWith('audio/') ? `audio/${outputFormat}` : `video/${outputFormat}`;
      console.log('Sending response with mime type:', mimeType);

      return new NextResponse(result, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="converted.${outputFormat}"`,
          'Content-Length': result.length.toString(),
        },
      });
    } catch (conversionError: unknown) {
      console.error('Conversion process error:', conversionError);
      throw new Error(`Conversion failed: ${conversionError instanceof Error ? conversionError.message : String(conversionError)}`);
    }
  } catch (error: unknown) {
    console.error('Media conversion error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to convert media',
      code: 'CONVERSION_FAILED',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 