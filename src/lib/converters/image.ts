import gm from 'gm';
import { promisify } from 'util';
import { settings } from '@/config/settings';
import { ConversionResult, ConversionOptions, ConversionError } from './types';
import { getMimeType } from '../utils/mime-types';

export async function convertImage(
  input: Buffer,
  inputFormat: string,
  outputFormat: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  return new Promise((resolve) => {
    const image = gm(input);

    // Apply conversion options
    if (options.quality) {
      image.quality(options.quality);
    }
    if (options.resolution) {
      const [width, height] = options.resolution.split('x');
      image.resize(parseInt(width), parseInt(height));
    }

    // Convert the image
    image.toBuffer(outputFormat.replace('.', ''), (err: Error | null, buffer: Buffer) => {
      if (err) {
        console.error('Image conversion error:', err);
        resolve({
          success: false,
          error: err.message || 'Failed to convert image'
        });
        return;
      }

      resolve({
        success: true,
        data: buffer,
        mimeType: getMimeType(outputFormat)
      });
    });
  });
} 