export interface ConversionStats {
  totalConversions: number;
  todayConversions: number;
  totalSize: number;
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