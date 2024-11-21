declare module '@ffmpeg/ffmpeg' {
  export class FFmpeg {
    load(options?: {
      coreURL?: string;
      wasmURL?: string;
    }): Promise<void>;
    
    writeFile(name: string, data: Uint8Array): Promise<void>;
    readFile(name: string): Promise<Uint8Array>;
    deleteFile(name: string): Promise<void>;
    exec(args: string[]): Promise<void>;
  }
}

declare module '@ffmpeg/util' {
  export function fetchFile(file: Blob): Promise<Uint8Array>;
} 