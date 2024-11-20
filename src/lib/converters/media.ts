import { Converter } from '@/types/converters';
import { settings } from '@/config/settings';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

export const mediaConverter: Converter = {
  name: 'Media Converter',
  description: 'Convert between media formats',
  inputFormats: settings.supportedFormats.media.input,
  outputFormats: settings.supportedFormats.media.output,
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, 'application/wasm')
      });

      const inputFileName = `input.${inputFormat}`;
      const outputFileName = `output.${outputFormat}`;
      await ffmpeg.writeFile(inputFileName, new Uint8Array(input));

      // Enhanced conversion options based on format
      let ffmpegArgs: string[] = ['-i', inputFileName];

      // Audio formats
      if (['mp3', 'wav', 'aac', 'ogg', 'm4a', 'flac'].includes(outputFormat)) {
        switch (outputFormat) {
          case 'mp3':
            ffmpegArgs.push(
              '-c:a', 'libmp3lame',
              '-q:a', '2', // High quality
              '-metadata', 'encoded_by=FileCabinet'
            );
            break;
          case 'wav':
            ffmpegArgs.push(
              '-c:a', 'pcm_s16le', // CD quality
              '-ar', '44100'       // Standard sample rate
            );
            break;
          case 'aac':
            ffmpegArgs.push(
              '-c:a', 'aac',
              '-b:a', '192k'       // High quality bitrate
            );
            break;
          case 'ogg':
            ffmpegArgs.push(
              '-c:a', 'libvorbis',
              '-q:a', '6'          // High quality
            );
            break;
          case 'm4a':
            ffmpegArgs.push(
              '-c:a', 'aac',
              '-b:a', '256k',      // Very high quality
              '-movflags', '+faststart'
            );
            break;
          case 'flac':
            ffmpegArgs.push(
              '-c:a', 'flac',
              '-compression_level', '8' // Maximum compression
            );
            break;
        }
      }
      // Video formats
      else if (['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(outputFormat)) {
        switch (outputFormat) {
          case 'mp4':
            ffmpegArgs.push(
              '-c:v', 'libx264',
              '-preset', 'medium',
              '-crf', '23',        // Good quality/size balance
              '-c:a', 'aac',
              '-b:a', '192k',
              '-movflags', '+faststart'
            );
            break;
          case 'webm':
            ffmpegArgs.push(
              '-c:v', 'libvpx-vp9',
              '-crf', '30',
              '-b:v', '0',
              '-c:a', 'libopus',
              '-b:a', '128k'
            );
            break;
          case 'mkv':
            ffmpegArgs.push(
              '-c:v', 'libx264',
              '-preset', 'medium',
              '-crf', '23',
              '-c:a', 'aac',
              '-b:a', '192k'
            );
            break;
          case 'mov':
            ffmpegArgs.push(
              '-c:v', 'libx264',
              '-preset', 'medium',
              '-crf', '23',
              '-c:a', 'aac',
              '-b:a', '192k',
              '-movflags', '+faststart'
            );
            break;
          case 'avi':
            ffmpegArgs.push(
              '-c:v', 'libx264',
              '-c:a', 'mp3',
              '-q:a', '3',
              '-preset', 'medium'
            );
            break;
        }
      }

      ffmpegArgs.push(outputFileName);
      await ffmpeg.exec(ffmpegArgs);

      const data = await ffmpeg.readFile(outputFileName);
      await ffmpeg.terminate();

      return Buffer.from(data as Uint8Array);

    } catch (error) {
      console.error('Media conversion error:', error);
      throw new Error('Failed to convert media file');
    }
  }
} 