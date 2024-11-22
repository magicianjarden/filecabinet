import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import '@ffmpeg/core-mt';
import { Converter } from '@/types';

let ffmpegInstance: FFmpeg | null = null;

async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();
  
  try {
    await ffmpeg.load({
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm'
    });
    
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg loading error:', error);
    throw new Error('Failed to load FFmpeg');
  }
}

const getConversionCommand = (
  inputFileName: string, 
  outputFileName: string, 
  inputFormat: string, 
  outputFormat: string
): string[] => {
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(inputFormat.toLowerCase());
  
  if (isAudio) {
    switch (outputFormat) {
      case 'mp3':
        return ['-i', inputFileName, '-c:a', 'libmp3lame', '-b:a', '192k', outputFileName];
      case 'wav':
        return ['-i', inputFileName, '-c:a', 'pcm_s16le', outputFileName];
      case 'ogg':
        return ['-i', inputFileName, '-c:a', 'libvorbis', '-q:a', '4', outputFileName];
      default:
        throw new Error(`Unsupported audio output format: ${outputFormat}`);
    }
  }

  // Video conversion
  switch (outputFormat) {
    case 'mp4':
      return ['-i', inputFileName, '-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', outputFileName];
    case 'webm':
      return ['-i', inputFileName, '-c:v', 'libvpx', '-c:a', 'libvorbis', outputFileName];
    default:
      throw new Error(`Unsupported video output format: ${outputFormat}`);
  }
};

export const mediaConverter: Converter = {
  name: 'Media Converter',
  description: 'Convert between audio and video formats',
  inputFormats: ['mp4', 'mov', 'avi', 'webm', 'mkv', 'mp3', 'wav', 'ogg'],
  outputFormats: ['mp4', 'webm', 'mp3', 'wav', 'ogg'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const ffmpeg = await loadFFmpeg();
      const inputFileName = `input.${inputFormat}`;
      const outputFileName = `output.${outputFormat}`;

      await ffmpeg.writeFile(inputFileName, await fetchFile(new Blob([input])));
      
      const command = getConversionCommand(inputFileName, outputFileName, inputFormat, outputFormat);
      await ffmpeg.exec(command);

      const data = await ffmpeg.readFile(outputFileName);
      
      // Cleanup
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

      return Buffer.from(data as Uint8Array);
    } catch (error) {
      console.error('Media conversion error:', error);
      throw new Error('Failed to convert media file');
    }
  }
}; 