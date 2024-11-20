import AdmZip from 'adm-zip';
import { Converter } from '@/types/converters';

export const archiveConverter: Converter = {
  name: 'Archive Converter',
  description: 'Optimize and manage ZIP archives',
  inputFormats: ['zip'],
  outputFormats: ['zip'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      if (inputFormat === 'zip' && outputFormat === 'zip') {
        const zip = new AdmZip(input);
        
        // Add some useful metadata
        zip.addZipComment(`Optimized by FileCabinet - ${new Date().toISOString()}`);
        
        // Generate buffer without options (AdmZip will use defaults)
        return zip.toBuffer();
      }

      throw new Error(`Unsupported conversion: ${inputFormat} to ${outputFormat}`);
    } catch (error) {
      console.error('Archive conversion error:', error);
      throw new Error('Failed to convert archive file');
    }
  }
};