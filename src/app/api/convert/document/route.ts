import { NextRequest, NextResponse } from 'next/server';
import { convertDocument } from '@/lib/converters/document';
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
import { updateStats } from '@/lib/redis'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check rate limit
    const ip = getClientIp(req);
    const { success: rateLimitSuccess } = await ratelimit.limit(ip);
    
    if (!rateLimitSuccess) {
      throw new RateLimitError();
    }

    // Generate unique job ID
    const jobId = nanoid();
    const progress = new ProgressTracker(jobId);

    // Initialize progress
    await progress.updateProgress({
      progress: 0,
      status: 'pending',
      message: 'Starting conversion...'
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

    // Validate file size
    if (buffer.length > settings.maxFileSize.documents) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: 'File too large'
      });
      throw new FileSizeError('File exceeds maximum size limit');
    }

    // Validate formats
    if (!settings.supportedFormats.documents.input.includes(fileType)) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: 'Unsupported format'
      });
      throw new FileTypeError('Unsupported file format');
    }

    // Update progress
    await progress.updateProgress({
      progress: 40,
      status: 'processing',
      message: 'Converting file...'
    });

    const conversion = await convertDocument(buffer, fileType, targetFormat);

    if (!conversion.success) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: conversion.error || 'Conversion failed'
      });
      throw new ConversionError(conversion.error || 'Failed to convert document');
    }

    // Update stats after successful conversion
    const conversionTime = (Date.now() - startTime) / 1000
    await updateStats(targetFormat, buffer.length, conversionTime)

    // Update progress
    await progress.updateProgress({
      progress: 100,
      status: 'completed',
      message: 'Conversion complete'
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