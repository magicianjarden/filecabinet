import { NextRequest, NextResponse } from 'next/server';
import { getFileCategory } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const category = getFileCategory(file.name);
    const endpoint = `/api/convert/${category}`;

    console.log(`Routing conversion request to ${endpoint}`, {
      fileName: file.name,
      fileSize: file.size,
      category
    });

    return NextResponse.json({
      redirect: endpoint,
      category,
      message: `Please use the specific endpoint: ${endpoint}`
    }, { status: 307 });

  } catch (error) {
    console.error('Conversion routing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 