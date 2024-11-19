export interface ConversionRecord {
    id: string;
    originalName: string;
    convertedName: string;
    originalFormat: string;
    convertedFormat: string;
    timestamp: Date;
    downloadUrl: string;
    type: 'document' | 'image' | 'media';
  }
  
export interface ConversionStats {
    totalConversions: number;
    totalSize: number;
    averageTime: number;
    conversionRate: number;
    conversionTimes: number[];
  }
  