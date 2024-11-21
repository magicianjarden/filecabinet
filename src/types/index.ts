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
    category?: string;
    error?: string;
  }
  
export interface ConversionStats {
  totalConversions: number;
  todayConversions: number;
  totalStorage: number;
  successfulConversions: number;
  failedConversions: number;
  averageTime: number;
  conversionRate: number;
  conversionTimes: number[];
  byFormat: Record<string, number>;
  bySize: Record<string, number>;
  hourlyActivity: Record<string, number>;
  successRate: number;
  lastUpdated: string;
  popularConversions: Array<{
    from: string;
    to: string;
    count: number;
  }>;
}
  