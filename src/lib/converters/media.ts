import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Converter } from '@/types';

let ffmpegInstance: FFmpeg | null = null;

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    console.log('Using existing FFmpeg instance');
    return ffmpegInstance;
  }

  console.log('Creating new FFmpeg instance');
  const ffmpeg = new FFmpeg();
  
  try {
    console.log('Loading FFmpeg...');
    await ffmpeg.load({
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm'
    });
    
    console.log('FFmpeg loaded successfully');
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg loading error:', error);
    throw new Error(`Failed to load FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const mediaConverter: Converter = {
  name: 'Media Converter',
  description: 'Convert between audio and video formats',
  inputFormats: ['mp4', 'mov', 'avi', 'mp3', 'wav', 'ogg'],
  outputFormats: ['mp4', 'mp3', 'wav'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    console.log('Starting media conversion:', {
      inputSize: input.length,
      inputFormat,
      outputFormat
    });

    try {
      const ffmpeg = await loadFFmpeg();
      console.log('FFmpeg instance ready');

      const inputFileName = `input.${inputFormat}`;
      const outputFileName = `output.${outputFormat}`;

      // Write input file
      console.log('Writing input file...');
      const blob = new Blob([input]);
      await ffmpeg.writeFile(inputFileName, await fetchFile(blob));
      console.log('Input file written successfully');

      // Determine if this is audio or video
      const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(inputFormat.toLowerCase());
      console.log('File type:', isAudio ? 'audio' : 'video');

      // Set conversion command
      const conversionCommand = isAudio ? [
        '-i', inputFileName,
        '-c:a', 'aac',
        '-b:a', '192k',
        outputFileName
      ] : [
        '-i', inputFileName,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '23',
        outputFileName
      ];

      console.log('Running FFmpeg command:', conversionCommand.join(' '));
      await ffmpeg.exec(conversionCommand);
      console.log('FFmpeg command completed');

      // Read the result
      console.log('Reading output file...');
      const data = await ffmpeg.readFile(outputFileName);
      console.log('Output file read successfully, size:', data.length);

      // Clean up
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
      console.log('Cleanup completed');

      return Buffer.from(data as Uint8Array);
    } catch (error) {
      console.error('Media conversion error:', error);
      throw new Error(`Media conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}; 