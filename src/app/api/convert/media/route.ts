import { NextRequest } from 'next/server';
import { convertMedia } from '@/lib/converters/media';
import { parseFormData } from '@/lib/utils/upload-handler';
import { settings } from '@/config/settings';
import { ratelimit, getClientIp } from '@/lib/utils/rate-limit';
import { ProgressTracker } from '@/lib/utils/progress-tracker';
import { handleError } from '@/lib/utils/error-handler';
import { 
  ValidationError, 
  RateLimitError, 
  FileSizeError,
  FileTypeError,
  ConversionError 
} from '@/lib/errors/custom-errors';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const ip = getClientIp(req);
    const { success: rateLimitSuccess } = await ratelimit.limit(ip);
    
    if (!rateLimitSuccess) {
      throw new RateLimitError();
    }

    const jobId = nanoid();
    const progress = new ProgressTracker(jobId);

    await progress.updateProgress({
      progress: 0,
      status: 'pending',
      message: 'Starting media conversion...'
    });

    const result = await parseFormData(req);
    
    if (!result.success) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: result.error
      });
      throw new ValidationError(result.error);
    }

    const { buffer, fileType, targetFormat, originalName } = result;

    if (buffer.length > settings.maxFileSize.media) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: 'Media file too large'
      });
      throw new FileSizeError('Media file exceeds maximum size limit');
    }

    if (!settings.supportedFormats.media.input.includes(fileType)) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: 'Unsupported format'
      });
      throw new FileTypeError('Unsupported media format');
    }

    const resolution = req.nextUrl.searchParams.get('resolution');

    await progress.updateProgress({
      progress: 40,
      status: 'processing',
      message: 'Converting media...'
    });

    const conversion = await convertMedia(buffer, fileType, targetFormat, {
      resolution: resolution || undefined,
    });

    if (!conversion.success) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: conversion.error || 'Conversion failed'
      });
      throw new ConversionError(conversion.error || 'Failed to convert media');
    }

    await progress.updateProgress({
      progress: 100,
      status: 'completed',
      message: 'Media conversion complete'
    });

    return new Response(conversion.data, {
      headers: {
        'Content-Type': conversion.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${originalName.replace(
          new RegExp(fileType + '$'), 
          targetFormat
        )}"`,
        'X-Job-ID': jobId
      },
    });

  } catch (error) {
    return handleError(error);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 