export * from './stats';
// Export any other types you have
export interface ConversionRecord {
    fileName: string;
    fileSize: number;
    originalFormat: string;
    targetFormat: string;
    timestamp: string;
    status: 'completed' | 'failed';
    downloadUrl?: string;
    error?: string;
  }
  