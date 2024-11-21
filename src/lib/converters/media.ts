import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { join } from 'path';

class MediaConverter {
  private ffmpeg: FFmpeg | null = null;

  private async loadFFmpeg() {
    if (this.ffmpeg) return this.ffmpeg;

    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        'text/javascript',
      ),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    });

    this.ffmpeg = ffmpeg;
    return ffmpeg;
  }

  async convert(buffer: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      console.log(`Starting conversion from ${inputFormat} to ${outputFormat}`);
      
      const ffmpeg = await this.loadFFmpeg();
      
      // Write input file
      const inputFileName = `input.${inputFormat}`;
      const outputFileName = `output.${outputFormat}`;
      
      // Convert Buffer to Blob
      const blob = new Blob([buffer], { type: getMimeType(inputFormat) });
      await ffmpeg.writeFile(inputFileName, await fetchFile(blob));
      
      // Run FFmpeg command
      await ffmpeg.exec([
        '-i', inputFileName,
        '-c:v', 'copy',  // Try to copy video codec if possible
        '-c:a', 'aac',   // Convert audio to AAC
        outputFileName
      ]);
      
      // Read the result
      const data = await ffmpeg.readFile(outputFileName);
      
      // Clean up
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      
      // Convert Uint8Array to Buffer
      return Buffer.from(data as Uint8Array);
    } catch (error) {
      console.error('Media conversion error:', error);
      throw new Error(`Media conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Helper function to get MIME type
function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    // Video formats
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mkv': 'video/x-matroska',
    'm4v': 'video/x-m4v',
    
    // Audio formats
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
  };

  return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
}

export const mediaConverter = new MediaConverter(); 