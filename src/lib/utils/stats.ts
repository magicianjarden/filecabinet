interface ConversionStats {
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

const STATS_KEY = 'conversion_stats';

export function getInitialStats(): ConversionStats {
  if (typeof window === 'undefined') {
    return createEmptyStats();
  }

  try {
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
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
    conversionRate: 100,
    conversionTimes: [],
    byFormat: {},
    bySize: {},
    lastUpdated: new Date().toISOString()
  };
}

export function updateStats(
  fileSize: number, 
  conversionTime: number,
  sourceFormat: string,
  targetFormat: string,
  success: boolean
): ConversionStats {
  const currentStats = getInitialStats();
  
  const newStats: ConversionStats = {
    ...currentStats,
    totalConversions: currentStats.totalConversions + 1,
    successfulConversions: currentStats.successfulConversions + (success ? 1 : 0),
    failedConversions: currentStats.failedConversions + (success ? 0 : 1),
    totalSize: currentStats.totalSize + fileSize,
    conversionTimes: [...currentStats.conversionTimes, conversionTime],
    lastUpdated: new Date().toISOString()
  };

  // Update format stats
  const formatKey = `${sourceFormat}-to-${targetFormat}`;
  newStats.byFormat = {
    ...currentStats.byFormat,
    [formatKey]: (currentStats.byFormat[formatKey] || 0) + 1
  };

  // Update size category
  const sizeCategory = getSizeCategory(fileSize);
  newStats.bySize = {
    ...currentStats.bySize,
    [sizeCategory]: (currentStats.bySize[sizeCategory] || 0) + 1
  };

  // Calculate averages
  newStats.averageTime = newStats.conversionTimes.reduce((a: number, b: number) => a + b, 0) / newStats.conversionTimes.length;
  newStats.conversionRate = (newStats.successfulConversions / newStats.totalConversions) * 100;

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
  }

  return newStats;
}

function getSizeCategory(size: number): string {
  const MB = 1024 * 1024;
  if (size < MB) return '<1MB';
  if (size < 10 * MB) return '1-10MB';
  if (size < 50 * MB) return '10-50MB';
  if (size < 100 * MB) return '50-100MB';
  return '>100MB';
} 