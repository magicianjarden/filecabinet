import sharp from 'sharp';
import { Converter } from '@/types';

export const imageConverter: Converter = {
  name: 'Image Converter',
  description: 'Convert between image formats',
  inputFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'tiff'],
  outputFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const image = sharp(input);
      
      switch (outputFormat) {
        case 'jpg':
        case 'jpeg':
          return await image.jpeg({ quality: 85 }).toBuffer();
        case 'png':
          return await image.png({ compressionLevel: 9 }).toBuffer();
        case 'webp':
          return await image.webp({ quality: 85 }).toBuffer();
        case 'avif':
          return await image.avif({ quality: 85 }).toBuffer();
        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error('Failed to convert image');
    }
  }
}; 