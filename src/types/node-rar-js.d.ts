declare module 'node-rar-js' {
  export class RAR {
    constructor(filePath?: string);
    extract(destination: string): Promise<void>;
    create(outputPath: string, files: string[], options?: {
      compression?: number;
    }): Promise<void>;
  }
}

