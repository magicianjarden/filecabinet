import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { settings } from '@/config/settings';
import { ConversionResult, ConversionOptions, ConversionError } from './types';
import { getMimeType } from '../utils/mime-types';

export async function convertMedia(
  input: Buffer,
  inputFormat: string,
  outputFormat: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  return new Promise((resolve) => {
    const inputStream = Readable.from(input);
    const chunks: Buffer[] = [];

    const command = ffmpeg(inputStream)
      .toFormat(outputFormat.replace('.', ''));

    // Handle completion
    command.on('end', () => {
      resolve({
        success: true,
        data: Buffer.concat(chunks),
        mimeType: getMimeType(outputFormat)
      });
    });

    // Handle errors
    command.on('error', (err: ConversionError) => {
      console.error('Media conversion error:', err);
      resolve({
        success: false,
        error: err.message || 'Failed to convert media file'
      });
    });

    // Apply conversion options
    if (options.resolution) {
      command.size(options.resolution);
    }

    // Handle data chunks
    const stream = command.pipe();
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Start the conversion
    command.run();
  });
} 