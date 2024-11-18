import { exec } from 'child_process';
import { promisify } from 'util';
import { settings } from '@/config/settings';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { ConversionResult } from './types';
import { getMimeType } from '../utils/mime-types';

const execAsync = promisify(exec);

export async function convertDocument(
  input: Buffer,
  inputFormat: string,
  outputFormat: string,
): Promise<ConversionResult> {
  try {
    // Create temporary files
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'conversion-'));
    const inputPath = path.join(tempDir, `input${inputFormat}`);
    const outputPath = path.join(tempDir, `output${outputFormat}`);

    // Write input buffer to temp file
    await fs.writeFile(inputPath, input);

    // Convert using pandoc
    await execAsync(
      `pandoc "${inputPath}" -o "${outputPath}" --pdf-engine=xelatex`,
      { timeout: settings.conversionTimeouts.documents }
    );

    // Read the output file
    const outputBuffer = await fs.readFile(outputPath);

    // Cleanup temp files
    await fs.rm(tempDir, { recursive: true, force: true });

    return {
      success: true,
      data: outputBuffer,
      mimeType: getMimeType(outputFormat)
    };
  } catch (error) {
    console.error('Document conversion error:', error);
    return {
      success: false,
      error: 'Failed to convert document'
    };
  }
} 