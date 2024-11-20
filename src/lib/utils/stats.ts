import { ConversionStats } from '@/types/stats';

export function getInitialStats(): ConversionStats {
  return {
    totalConversions: 0,
    successfulConversions: 0,
    failedConversions: 0,
    totalSize: 0,
    averageTime: 0,
    conversionRate: 0,
    conversionTimes: [],
    byFormat: {},
    bySize: {},
    hourlyActivity: {},
    successRate: 0,
    lastUpdated: new Date().toISOString(),
    popularConversions: [],
  };
}

export function updateStats(stats: ConversionStats): void {
  try {
    localStorage.setItem('conversion_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
} 