import { ConversionStats } from '@/types/stats';
import { getGlobalStats, trackConversion } from './stats-service';

export const getInitialStats = async (): Promise<ConversionStats> => {
  try {
    return await getGlobalStats();
  } catch (error) {
    console.error('Failed to get initial stats:', error);
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
      popularConversions: []
    };
  }
};

export async function updateConversionStats(
  type: string,
  inputFormat: string,
  outputFormat: string,
  fileSize: number,
  success: boolean,
  duration: number
) {
  try {
    await trackConversion(
      type,
      inputFormat,
      outputFormat,
      fileSize,
      success,
      duration
    );
    return await getGlobalStats();
  } catch (error) {
    console.error('Failed to update stats:', error);
    return null;
  }
} 