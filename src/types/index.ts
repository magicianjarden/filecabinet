export * from './stats';
// Export any other types you have
export interface ConversionRecord {
    id: string;
    originalName: string;
    convertedName: string;
    originalFormat: string;
    convertedFormat: string;
    timestamp: Date;
    downloadUrl: string;
    type: string;
  }
  