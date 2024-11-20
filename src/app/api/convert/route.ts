import { NextResponse } from 'next/server';

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

    // Your conversion logic here
    // For now, let's just return the file as-is
    return new NextResponse(file, {
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="converted.${targetFormat}"`,
      },
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
    );
  }
} 