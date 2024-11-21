import { ConversionStats } from '@/types';

export function getInitialStats(): ConversionStats {
  return {
    totalConversions: 0,
    todayConversions: 0,
    totalStorage: 0,
    successfulConversions: 0,
    failedConversions: 0,
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

export function updateStats(stats: ConversionStats): void {
  try {
    localStorage.setItem('conversion_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
}

export async function updateConversionStats(fileSize: number) {
  try {
    const response = await fetch('/api/stats/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileSize }),
    });

    if (!response.ok) throw new Error('Failed to update stats');
    return await response.json();
  } catch (error) {
    console.error('Failed to update stats:', error);
    return null;
  }
} 