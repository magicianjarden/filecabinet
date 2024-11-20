import sharp from 'sharp';
import { Converter } from '@/types/converters';
import { settings } from '@/config/settings';

export const imageConverter: Converter = {
  name: 'Image Converter',
  description: 'Convert between image formats',
  inputFormats: settings.supportedFormats.images.input,
  outputFormats: settings.supportedFormats.images.output,
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const image = sharp(input);
      
      // Convert to the target format
      switch (outputFormat) {
        case 'jpg':
        case 'jpeg':
          return await image.jpeg({ quality: 85 }).toBuffer();
        case 'png':
          return await image.png({ quality: 85 }).toBuffer();
        case 'webp':
          return await image.webp({ quality: 85 }).toBuffer();
        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error('Failed to convert image');
    }
  }
}; 