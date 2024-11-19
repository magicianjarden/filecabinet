export interface ConversionStats {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  totalSize: number;
  averageTime: number;
  conversionRate: number;
  conversionTimes: number[];
  byFormat: Record<string, number>;
  bySize: Record<string, number>;
  lastUpdated: string;
} 