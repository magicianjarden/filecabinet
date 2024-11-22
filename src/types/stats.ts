export interface ConversionStats {
  id: string;
  timestamp: string;
  inputFormat: string;
  outputFormat: string;
  fileSize: number;
  conversionTime: number;
  success: boolean;
}

export interface DailyStats {
  date: string;
  conversions: number;
  avgTime: number;
  successRate: number;
}

export interface StatsResponse {
  totalConversions: number;
  successRate: number;
  averageTime: number;
  dailyStats: DailyStats[];
  recentConversions: ConversionStats[];
} 