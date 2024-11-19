import { NextRequest } from 'next/server';
import { convertArchive } from '@/lib/converters/archive';
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
import type { ArchiveInputFormat, ArchiveOutputFormat } from '@/types/formats';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120 // Longer duration for archives

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
      message: 'Starting archive conversion...'
    })

    const result = await parseFormData(request)
    
    if (!result.success) {
      await progress.updateProgress({
        progress: 0,
        status: 'failed',
        message: result.error
      })
      throw new ValidationError(result.error)
    }

    const { buffer, fileType, targetFormat, originalName } = result

    // Type assertion
    const sourceFormat = fileType as ArchiveInputFormat;
    const outputFormat = targetFormat as ArchiveOutputFormat;

    // Specific validation for archive formats
    if (!settings.supportedFormats.archives.input.includes(sourceFormat)) {
      throw new FileTypeError('Unsupported archive format')
    }

    if (!settings.supportedFormats.archives.output.includes(outputFormat)) {
      throw new FileTypeError('Unsupported target format')
    }

    if (buffer.length > settings.maxFileSize.archives) {
      throw new FileSizeError('Archive exceeds maximum size limit')
    }

    const conversion = await convertArchive(buffer, sourceFormat, outputFormat)

    if (!conversion.success) {
      throw new ConversionError(conversion.error || 'Failed to convert archive')
    }

    const conversionTime = (Date.now() - startTime) / 1000
    await updateStats(targetFormat, buffer.length, conversionTime)

    await progress.updateProgress({
      progress: 100,
      status: 'completed',
      message: 'Archive conversion complete'
    })
  } catch (error) {
    handleError(error)
  }
} 