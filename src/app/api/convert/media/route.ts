import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10485760; // 10 MB in bytes

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;

    if (!file || !targetFormat) {
      return NextResponse.json(
        { error: 'File and target format are required' },
        { status: 400 }
      );
    }

    // Add file size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds maximum limit of ${MAX_FILE_SIZE} bytes`
        }
      }, { status: 400 });
    }

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'File received for conversion'
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to process conversion' },
      { status: 500 }
    );
  }
} 