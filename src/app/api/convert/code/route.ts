import { codeConverter } from '@/lib/converters/code';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetFormat = formData.get('targetFormat') as string;
    const sourceFormat = file.name.split('.').pop() || '';

    if (!file || !targetFormat) {
      return new Response('Missing file or target format', { status: 400 });
    }

    const convertedFile = await codeConverter(file, sourceFormat, targetFormat);
    
    return new Response(convertedFile, {
      headers: {
        'Content-Type': convertedFile.type,
      },
    });
  } catch (error) {
    console.error('Code conversion error:', error);
    return new Response(
      error instanceof Error ? error.message : 'Conversion failed', 
      { status: 500 }
    );
  }
}
