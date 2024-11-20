import { kv } from '@vercel/kv';
import { ConversionStats } from '@/types/stats';

function getSizeBucket(size: number): string {
  const MB = 1024 * 1024;
  if (size < MB) return '< 1MB';
  if (size < 5 * MB) return '1-5MB';
  if (size < 10 * MB) return '5-10MB';
  if (size < 50 * MB) return '10-50MB';
  return '> 50MB';
}

export async function trackConversion(
  type: string,
  inputFormat: string,
  outputFormat: string,
  fileSize: number,
  success = true,
  duration = 0
) {
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
}

export async function getGlobalStats(): Promise<ConversionStats> {
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

  const totalConversions = totals?.conversions || 0;
  const successfulConversions = totals?.successful || 0;
  const totalSize = totals?.total_size || 0;

  return {
    totalConversions,
    successfulConversions,
    failedConversions: totalConversions - successfulConversions,
    totalSize,
    averageTime: durations?.length 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0,
    conversionRate: totalConversions > 0 
      ? (successfulConversions / totalConversions) * 100 
      : 0,
    conversionTimes: durations || [],
    byFormat: formats || {},
    bySize: sizes || {},
    hourlyActivity: hourly || {},
    successRate: totalConversions > 0 
      ? (successfulConversions / totalConversions) * 100 
      : 0,
    lastUpdated: new Date().toISOString(),
  };
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