import { NextRequest } from 'next/server';
import { settings } from '@/config/settings';

interface UploadSuccess {
  success: true;
  buffer: Buffer;
  originalName: string;
  fileType: string;
  targetFormat: string;
  mimeType: string;
}

interface UploadError {
  success: false;
  error: string;
}

export type UploadResult = UploadSuccess | UploadError;

export async function parseFormData(req: NextRequest): Promise<UploadResult> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const targetFormat = formData.get('targetFormat') as string | null;

    if (!file || !targetFormat) {
      return {
        success: false,
        error: 'Missing file or target format'
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.name.split('.').pop();

    if (!fileType) {
      return {
        success: false,
        error: 'Invalid file format'
      };
    }

    return {
      success: true,
      buffer,
      originalName: file.name,
      fileType: `.${fileType.toLowerCase()}`,
      targetFormat: `.${targetFormat.toLowerCase()}`,
      mimeType: file.type || 'application/octet-stream'
    };
  } catch (error) {
    console.error('Upload handling error:', error);
    return {
      success: false,
      error: 'Failed to process upload'
    };
  }
} 