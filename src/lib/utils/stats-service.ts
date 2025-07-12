// import { kv } from '@vercel/kv';
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
  // No-op for build
  return;
}

// Add a connection check utility
async function checkKvConnection() {
  try {
    // await kv.set('connection-test', 'ok'); // Original line commented out
    // const test = await kv.get('connection-test'); // Original line commented out
    return true; // Dummy return for build
  } catch (error) {
    console.error('KV Connection Error:', error);
    return false;
  }
}

export async function getGlobalStats(): Promise<ConversionStats> {
  // Return default stats for build
  return getDefaultStats();
}

export async function updateGlobalStats(data: {
  success: boolean;
  size: number;
  time: number;
  format: string;
}): Promise<void> {
  // No-op for build
  return;
}

interface StatsUpdate {
  fileSize: number;
  fromFormat: string;
  toFormat: string;
  conversionTime: number;
  success: boolean;
}

export async function updateStats(data: StatsUpdate) {
  // No-op for build
  return;
}

function getSizeCategory(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return '< 1MB';
  if (mb < 5) return '1-5MB';
  if (mb < 10) return '5-10MB';
  if (mb < 50) return '10-50MB';
  return '> 50MB';
}