import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching stats from KV...');

    const [
      totalConversions,
      successfulConversions,
      failedConversions,
      totalSize,
      conversionTimes,
      formats,
      sizes,
      hourly
    ] = await Promise.all([
      kv.get('stats:total_conversions'),
      kv.get('stats:successful_conversions'),
      kv.get('stats:failed_conversions'),
      kv.get('stats:total_size'),
      kv.lrange('stats:conversion_times', 0, 99),
      kv.hgetall('stats:formats'),
      kv.hgetall('stats:sizes'),
      kv.hgetall('stats:hourly')
    ]);

    console.log('Raw KV data:', {
      totalConversions,
      successfulConversions,
      failedConversions,
      totalSize,
      conversionTimes: conversionTimes?.length,
      formats,
      sizes,
      hourly
    });

    // Convert times to numbers and calculate average
    const times = (conversionTimes || []).map(Number).filter(t => !isNaN(t));
    const averageTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0;

    // Calculate success rate
    const total = Number(totalConversions) || 0;
    const successful = Number(successfulConversions) || 0;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    // Process format data
    const popularConversions = Object.entries(formats || {})
      .map(([format, count]) => {
        const [from, to] = format.split('-to-');
        return { from, to, count: Number(count) };
      })
      .sort((a, b) => b.count - a.count);

    const stats = {
      totalConversions: total,
      successfulConversions: successful,
      failedConversions: Number(failedConversions) || 0,
      totalSize: Number(totalSize) || 0,
      averageTime,
      successRate,
      conversionTimes: times,
      byFormat: formats || {},
      bySize: sizes || {},
      hourlyActivity: hourly || {},
      popularConversions,
      lastUpdated: new Date().toISOString()
    };

    console.log('Processed stats:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Updating stats with data:', data);

    const hour = new Date().getHours();
    const formatKey = `${data.fromFormat}-to-${data.toFormat}`;
    const sizeCategory = getSizeCategory(data.fileSize);

    // Test KV connection
    console.log('Testing KV connection...');
    const testResult = await kv.set('test-connection', 'ok');
    console.log('KV connection test result:', testResult);

    // Perform all updates atomically
    await Promise.all([
      // Increment total conversions
      kv.incr('stats:total_conversions'),
      
      // Update success/failure counts
      kv.incr(`stats:${data.success ? 'successful' : 'failed'}_conversions`),
      
      // Add conversion time if available
      data.conversionTime && kv.lpush('stats:conversion_times', data.conversionTime.toString()),
      
      // Update format stats
      kv.hincrby('stats:formats', formatKey, 1),
      
      // Update size distribution
      kv.hincrby('stats:sizes', sizeCategory, 1),
      
      // Update hourly activity
      kv.hincrby('stats:hourly', hour.toString(), 1),
      
      // Update total size processed
      kv.incrby('stats:total_size', data.fileSize),
    ]);

    console.log('Stats updated successfully');

    // Fetch and return updated stats
    const updatedStats = await GET();
    return updatedStats;

  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}

// Helper function to categorize file sizes
function getSizeCategory(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return '< 1MB';
  if (mb < 5) return '1-5MB';
  if (mb < 10) return '5-10MB';
  if (mb < 50) return '10-50MB';
  return '> 50MB';
} 