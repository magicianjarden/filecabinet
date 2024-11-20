export type TimeRange = '24h' | '7d' | '30d' | 'all';

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
  hourlyActivity: Record<string, number>;
  successRate: number;
  lastUpdated: string;
}

export interface ConversionRecord {
  id: string;
  sourceFormat: string;
  targetFormat: string;
  fileSize: number;
  conversionTime: number;
  success: boolean;
  timestamp: number;
}

export interface FormatStats {
  format: string;
  count: number;
  successRate: number;
  averageTime: number;
}

export interface SizeStats {
  size: string;
  count: number;
  percentage: number;
}

export interface HourlyStats {
  hour: string;
  conversions: number;
  averageTime: number;
} 