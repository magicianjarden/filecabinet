import JSZip from 'jszip';
import { Converter } from '@/types';
import { settings } from '@/config/settings';

export const archiveConverter: Converter = {
  name: 'Archive Converter',
  description: 'Converts between archive formats (ZIP, TAR)',
  inputFormats: [...settings.supportedFormats.archives.input],
  outputFormats: [...settings.supportedFormats.archives.output],
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const zip = new JSZip();
      if (inputFormat === 'zip') {
        await zip.loadAsync(input);
        // Convert to tar is not supported in Edge runtime
        throw new Error('Converting from ZIP to TAR is not supported');
      } else if (inputFormat === 'tar') {
        // Convert to zip
        throw new Error('Converting from TAR to ZIP is not supported');
      }
      
      const result = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });
      
      return result;
    } catch (error) {
      console.error('Archive conversion error:', error);
      throw error;
    }
  }
};