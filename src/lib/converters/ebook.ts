import { Converter } from '@/types';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { settings } from '@/config/settings';

const execFileAsync = promisify(execFile);

export const ebookConverter: Converter = {
  name: 'Ebook Converter',
  description: 'Convert between ebook formats (EPUB, MOBI, AZW3, PDF)',
  inputFormats: [...settings.supportedFormats.ebooks.input],
  outputFormats: [...settings.supportedFormats.ebooks.output],

  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const inputPath = join(tmpdir(), `input.${inputFormat}`);
      const outputPath = join(tmpdir(), `output.${outputFormat}`);
      writeFileSync(inputPath, input);
      try {
        await execFileAsync('ebook-convert', [inputPath, outputPath]);
      } catch (e) {
        throw new Error('ebook-convert (Calibre) is not available on this server.');
      }
      const result = readFileSync(outputPath);
      unlinkSync(inputPath);
      unlinkSync(outputPath);
      return result;
    } catch (error) {
      console.error('Ebook conversion error:', error);
      throw new Error('Failed to convert ebook');
    }
  }
}; 