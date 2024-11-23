import sharp from 'sharp';
import { Converter } from '@/types';

export interface ImageConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  compress?: boolean;
}

export const imageConverter: Converter = {
  name: 'Image Converter',
  description: 'Convert between image formats',
  inputFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'tiff'],
  outputFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  
  async convert(
    input: Buffer, 
    inputFormat: string, 
    outputFormat: string, 
    options: ImageConversionOptions = {}
  ): Promise<Buffer> {
    try {
      let image = sharp(input);

      // Apply resizing if dimensions are provided
      if (options.width || options.height) {
        image = image.resize(options.width, options.height, {
          fit: options.fit || 'contain',
          withoutEnlargement: true
        });
      }
      
      // Convert based on format with quality options
      const quality = options.quality || 85;
      const compress = options.compress ?? true;

      switch (outputFormat) {
        case 'jpg':
        case 'jpeg':
          return await image.jpeg({ 
            quality,
            mozjpeg: compress 
          }).toBuffer();
          
        case 'png':
          return await image.png({ 
            compressionLevel: compress ? 9 : 6,
            palette: compress
          }).toBuffer();
          
        case 'webp':
          return await image.webp({ 
            quality,
            effort: compress ? 6 : 4
          }).toBuffer();
          
        case 'avif':
          return await image.avif({ 
            quality,
            effort: compress ? 6 : 4
          }).toBuffer();
        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error('Failed to convert image');
    }
  }
}; 