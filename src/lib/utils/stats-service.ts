import { kv } from '@vercel/kv';
import { ConversionStats } from '@/types/stats';

const getDefaultStats = (): ConversionStats => ({
  totalConversions: 0,
  todayConversions: 0,
  totalSize: 0,
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
});

function getSizeBucket(size: number): string {
  const MB = 1024 * 1024;
  if (size < MB) return '< 1MB';
  if (size < 5 * MB) return '1-5MB';
  if (size < 10 * MB) return '5-10MB';
  if (size < 50 * MB) return '10-50MB';
  return '> 50MB';
}

function formatConversionPairs(formats: Record<string, number>): Array<{ from: string; to: string; count: number }> {
  return Object.entries(formats)
    .map(([key, count]) => {
      const [from, to] = key.split('_to_');
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count);
}

export async function trackConversion(
  type: string,
  inputFormat: string,
  outputFormat: string,
  fileSize: number,
  success = true,
  duration = 0
) {
  try {
    // Check if KV is available
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('Vercel KV not configured, skipping stats tracking');
      return;
    }

    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    
    await Promise.all([
      // Increment total conversions
      kv.hincrby('stats:totals', 'conversions', 1),
      kv.hincrby('stats:totals', success ? 'successful' : 'failed', 1),
      kv.hincrby('stats:totals', 'total_size', fileSize),
      
      // Track format combinations
      kv.hincrby(`stats:formats:${type}`, `${inputFormat}_to_${outputFormat}`, 1),
      
      // Store conversion event
      kv.lpush('stats:recent', {
        timestamp,
        type,
        inputFormat,
        outputFormat,
        fileSize,
        duration,
        success
      }),
      
      // Update daily and hourly stats
      kv.hincrby(`stats:daily:${date}`, type, 1),
      kv.hincrby('stats:hourly', hour.toString(), 1),
      
      // Track size distribution
      kv.hincrby('stats:sizes', getSizeBucket(fileSize), 1),
      
      // Track duration
      kv.lpush('stats:durations', duration)
    ]);
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
}

// Add a connection check utility
async function checkKvConnection() {
  try {
    await kv.set('connection-test', 'ok');
    const test = await kv.get('connection-test');
    return test === 'ok';
  } catch (error) {
    console.error('KV Connection Error:', error);
    return false;
  }
}

export async function getGlobalStats(): Promise<ConversionStats> {
  try {
    // Check connection first
    const isConnected = await checkKvConnection();
    if (!isConnected) {
      console.warn('KV connection failed, using default stats');
      return getDefaultStats();
    }

    const [
      totals,
      formats,
      sizes,
      hourly,
      durations
    ] = await Promise.all([
      kv.hgetall('stats:totals') as Promise<Record<string, number>>,
      kv.hgetall('stats:formats') as Promise<Record<string, number>>,
      kv.hgetall('stats:sizes') as Promise<Record<string, number>>,
      kv.hgetall('stats:hourly') as Promise<Record<string, number>>,
      kv.lrange('stats:durations', 0, 1000) as Promise<number[]>
    ]);

    const today = new Date().toISOString().split('T')[0];
    const todayStats = await kv.hget(`stats:daily:${today}`, 'total') as number || 0;

    return {
      totalConversions: totals?.conversions || 0,
      todayConversions: todayStats,
      totalSize: totals?.total_size || 0,
      successfulConversions: totals?.successful || 0,
      failedConversions: (totals?.conversions || 0) - (totals?.successful || 0),
      averageTime: durations?.length 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0,
      conversionRate: totals?.conversions > 0 
        ? (totals.successful / totals.conversions) * 100 
        : 0,
      conversionTimes: durations || [],
      byFormat: formats || {},
      bySize: sizes || {},
      hourlyActivity: hourly || {},
      successRate: totals?.conversions > 0 
        ? (totals.successful / totals.conversions) * 100 
        : 0,
      lastUpdated: new Date().toISOString(),
      popularConversions: formatConversionPairs(formats || {}),
    };
  } catch (error) {
    console.error('Stats Error:', error);
    return getDefaultStats();
  }
}

export async function updateGlobalStats(data: {
  success: boolean;
  size: number;
  time: number;
  format: string;
}): Promise<void> {
  await trackConversion(
    'unknown',  // type
    'unknown',  // inputFormat
    data.format, // outputFormat
    data.size,   // fileSize
    data.success, // success
    data.time    // duration
  );
}