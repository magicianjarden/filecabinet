import { Converter } from '@/types';
import { promisify } from 'util';
import { execFile } from 'child_process';
import { tmpdir } from 'os';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { settings } from '@/config/settings';

const execFileAsync = promisify(execFile);

export const spreadsheetConverter: Converter = {
  name: 'Spreadsheet Converter',
  description: 'Convert between spreadsheet formats (XLS, XLSX, CSV)',
  inputFormats: [...settings.supportedFormats.spreadsheets.input],
  outputFormats: [...settings.supportedFormats.spreadsheets.output],

  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const inputPath = join(tmpdir(), `input.${inputFormat}`);
      const outputPath = join(tmpdir(), `output.${outputFormat}`);
      writeFileSync(inputPath, input);
      try {
        await execFileAsync('unoconv', ['-f', outputFormat, '-o', outputPath, inputPath]);
      } catch (e) {
        // Try soffice as fallback
        await execFileAsync('soffice', ['--headless', '--convert-to', outputFormat, '--outdir', tmpdir(), inputPath]);
      }
      const result = readFileSync(outputPath);
      unlinkSync(inputPath);
      unlinkSync(outputPath);
      return result;
    } catch (error) {
      console.error('Spreadsheet conversion error:', error);
      throw new Error('Failed to convert spreadsheet');
    }
  }
}; 