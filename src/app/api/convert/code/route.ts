import { NextRequest } from 'next/server';
import { convertCode } from '@/lib/converters/code';
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
import type { CodeInputFormat, CodeOutputFormat } from '@/types/formats';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const ip = getClientIp(request)
    const { success: rateLimitSuccess } = await ratelimit.limit(ip)
    
    if (!rateLimitSuccess) {
      throw new RateLimitError()
    }

    const jobId = nanoid()
    const progress = new ProgressTracker(jobId)

    await progress.updateProgress({
      progress: 0,
      status: 'pending',
      message: 'Starting code format conversion...'
    })

    const result = await parseFormData(request)
    
    if (!result.success) {
      throw new ValidationError(result.error)
    }

    const { buffer, fileType, targetFormat, originalName } = result

    // Type assertion
    const sourceFormat = fileType as CodeInputFormat;
    const outputFormat = targetFormat as CodeOutputFormat;

    // Validate formats
    if (!settings.supportedFormats.code.input.includes(sourceFormat)) {
      throw new FileTypeError('Unsupported code format');
    }

    if (!settings.supportedFormats.code.output.includes(outputFormat)) {
      throw new FileTypeError('Unsupported target format');
    }

    if (buffer.length > settings.maxFileSize.code) {
      throw new FileSizeError('File exceeds maximum size limit')
    }

    const conversion = await convertCode(buffer, sourceFormat, outputFormat)

    if (!conversion.success) {
      throw new ConversionError(conversion.error || 'Failed to convert format')
    }

    const conversionTime = (Date.now() - startTime) / 1000
    await updateStats(targetFormat, buffer.length, conversionTime)

    await progress.updateProgress({
      progress: 100,
      status: 'completed',
      message: 'Code format conversion complete'
    })

    return new Response(conversion.data, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${originalName.replace(
          new RegExp(fileType + '$'), 
          targetFormat
        )}"`,
        'X-Job-ID': jobId
      },
    })

  } catch (error) {
    return handleError(error)
  }
}
