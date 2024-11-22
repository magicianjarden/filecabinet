import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const { inputFormat, outputFormat } = await request.json();

    return NextResponse.json({
      message: 'Please use specific converter endpoints',
      availableEndpoints: [
        '/api/convert/archive',
        '/api/convert/document',
        '/api/convert/image',
        '/api/convert/media',
        '/api/convert/code'
      ]
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
} 