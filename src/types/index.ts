export * from './stats';
// Export any other types you have
export interface ConversionRecord {
    id: string;
    fileName: string;
    originalFormat: string;
    targetFormat: string;
    fileSize: number;
    timestamp: string;
    downloadUrl: string;
    status: 'completed' | 'failed';
  }
  