import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';
import { Converter } from '@/types';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const mediaConverter: Converter = {
  name: 'Media Converter',
  description: 'Convert between media formats',
  inputFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'mp3', 'wav', 'ogg'],
  outputFormats: ['mp4', 'webm', 'mp3', 'wav'],
  
  async convert(
    input: Buffer,
    inputFormat: string,
    outputFormat: string,
    options = {}
  ): Promise<Buffer> {
    try {
      // Create temporary files
      const inputPath = join(tmpdir(), `input.${inputFormat}`);
      const outputPath = join(tmpdir(), `output.${outputFormat}`);

      // Write input buffer to temporary file
      await writeFile(inputPath, input);

      // Build FFmpeg command
      const isAudioOnly = ['mp3', 'wav', 'ogg'].includes(outputFormat);
      const args = [
        '-i', inputPath,
        ...(isAudioOnly ? ['-vn'] : []),
        outputPath
      ];

      // Execute FFmpeg
      await new Promise<void>((resolve, reject) => {
        const process = spawn(ffmpeg.path, args);
        
        process.stderr.on('data', (data) => {
          console.log(`FFmpeg: ${data}`);
        });

        process.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });

        process.on('error', (err) => {
          reject(err);
        });
      });

      // Read the output file
      const result = await promisify(require('fs').readFile)(outputPath);

      // Clean up temporary files
      await Promise.all([
        unlink(inputPath),
        unlink(outputPath)
      ]);

      return result;
    } catch (error) {
      console.error('Media conversion error:', error);
      throw new Error('Failed to convert media file');
    }
  }
}; 