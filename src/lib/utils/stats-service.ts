import { kv } from '@vercel/kv';
import { ConversionStats } from '@/types/stats';

const STATS_KEY = 'conversion_stats';

interface ConversionUpdate {
  success: boolean;
  size: number;
  time: number;
  format: string;
}

export async function updateGlobalStats(newConversion: ConversionUpdate): Promise<void> {
  try {
    const currentStats = await getGlobalStats();
    const hour = new Date().getHours().toString();

    // Prepare the updated stats
    const updatedStats: ConversionStats = {
      ...currentStats,
      totalConversions: currentStats.totalConversions + 1,
      successfulConversions: currentStats.successfulConversions + (newConversion.success ? 1 : 0),
      failedConversions: currentStats.failedConversions + (newConversion.success ? 0 : 1),
      totalSize: currentStats.totalSize + newConversion.size,
      averageTime: (currentStats.averageTime * currentStats.totalConversions + newConversion.time) / (currentStats.totalConversions + 1),
      byFormat: {
        ...currentStats.byFormat,
        [newConversion.format]: (currentStats.byFormat[newConversion.format] || 0) + 1
      },
      hourlyActivity: {
        ...currentStats.hourlyActivity,
        [hour]: (currentStats.hourlyActivity[hour] || 0) + 1
      },
      successRate: ((currentStats.successfulConversions + (newConversion.success ? 1 : 0)) / (currentStats.totalConversions + 1)) * 100,
      lastUpdated: new Date().toISOString()
    };

    // Update stats atomically
    await kv.set(STATS_KEY, JSON.stringify(updatedStats));

  } catch (error) {
    console.error('Error updating stats:', error);
    throw error;
  }
}

export async function getGlobalStats(): Promise<ConversionStats> {
  try {
    const stats = await kv.get<string>(STATS_KEY);
    if (stats) {
      return JSON.parse(stats) as ConversionStats;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }

  return createEmptyStats();
}

function createEmptyStats(): ConversionStats {
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
    lastUpdated: new Date().toISOString()
  };
}

// Helper function to calculate size buckets
function getSizeBucket(size: number): string {
  const MB = 1024 * 1024;
  if (size < MB) return '< 1MB';
  if (size < 5 * MB) return '1-5MB';
  if (size < 10 * MB) return '5-10MB';
  if (size < 50 * MB) return '10-50MB';
  return '> 50MB';
}

// Update size stats
function updateSizeStats(currentSizeStats: Record<string, number>, newSize: number): Record<string, number> {
  const bucket = getSizeBucket(newSize);
  return {
    ...currentSizeStats,
    [bucket]: (currentSizeStats[bucket] || 0) + 1
  };
} 