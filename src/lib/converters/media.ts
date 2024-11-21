import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

class MediaConverter {
  async convert(buffer: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    const inputPath = join(tmpdir(), `input.${inputFormat}`);
    const outputPath = join(tmpdir(), `output.${outputFormat}`);

    try {
      // Write input buffer to temporary file
      await writeFile(inputPath, buffer);

      // Convert using ffmpeg
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .toFormat(outputFormat)
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      // Read the output file
      const result = await readFile(outputPath);

      // Clean up temporary files
      await Promise.all([
        unlink(inputPath).catch(() => {}),
        unlink(outputPath).catch(() => {})
      ]);

      return result;
    } catch (error) {
      // Clean up on error
      await Promise.all([
        unlink(inputPath).catch(() => {}),
        unlink(outputPath).catch(() => {})
      ]);
      throw error;
    }
  }
}

export const mediaConverter = new MediaConverter(); 