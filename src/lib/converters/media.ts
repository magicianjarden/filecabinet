import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

class MediaConverter {
  private ffmpeg: FFmpeg | null = null;

  private async loadFFmpeg() {
    if (this.ffmpeg) return this.ffmpeg;

    const ffmpeg = new FFmpeg();
    
    // Load FFmpeg
    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
    });

    this.ffmpeg = ffmpeg;
    return ffmpeg;
  }

  async convert(buffer: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      console.log(`MediaConverter: Starting conversion from ${inputFormat} to ${outputFormat}`);
      
      const ffmpeg = await this.loadFFmpeg();
      console.log('MediaConverter: FFmpeg loaded');
      
      // Write input file
      const inputFileName = `input.${inputFormat}`;
      const outputFileName = `output.${outputFormat}`;
      
      // Convert Buffer to Blob
      const blob = new Blob([buffer]);
      await ffmpeg.writeFile(inputFileName, await fetchFile(blob));
      console.log('MediaConverter: Input file written');

      // Determine if this is audio or video
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(inputFormat.toLowerCase());
      
      // Set conversion options based on type
      const conversionCommand = isAudio ? [
        '-i', inputFileName,
        '-c:a', 'aac',  // Use AAC for audio
        outputFileName
      ] : [
        '-i', inputFileName,
        '-c:v', 'libx264',  // Use H.264 for video
        '-c:a', 'aac',      // Use AAC for audio
        '-preset', 'fast',   // Faster encoding
        outputFileName
      ];

      console.log('MediaConverter: Starting FFmpeg conversion');
      await ffmpeg.exec(conversionCommand);
      console.log('MediaConverter: FFmpeg conversion completed');
      
      // Read the result
      const data = await ffmpeg.readFile(outputFileName);
      console.log('MediaConverter: Output file read');
      
      // Clean up
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      console.log('MediaConverter: Cleanup completed');
      
      // Convert Uint8Array to Buffer
      return Buffer.from(data as Uint8Array);
    } catch (error) {
      console.error('MediaConverter error:', error);
      throw error;
    }
  }
}

export const mediaConverter = new MediaConverter(); 