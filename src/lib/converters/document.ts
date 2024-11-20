import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { Converter } from '@/types/converters';
import { settings } from '@/config/settings';

const execAsync = promisify(exec);

export const documentConverter: Converter = {
  name: 'Document Converter',
  description: 'Convert between document formats',
  inputFormats: settings.supportedFormats.documents.input,
  outputFormats: settings.supportedFormats.documents.output,
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const tempDir = join(tmpdir(), `doc-convert-${Date.now()}`);
      const inputPath = join(tempDir, `input.${inputFormat}`);
      const outputPath = join(tempDir, `output.${outputFormat}`);

      await writeFile(inputPath, input);

      await execAsync(
        `pandoc "${inputPath}" -o "${outputPath}" --pdf-engine=xelatex`,
        { timeout: settings.conversionTimeouts.documents }
      );

      return await readFile(outputPath);
    } catch (error) {
      console.error('Document conversion error:', error);
      throw new Error('Failed to convert document');
    }
  }
}; 