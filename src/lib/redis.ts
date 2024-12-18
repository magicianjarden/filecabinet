import { Redis } from '@upstash/redis'
import { ConversionStats } from '@/types'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function updateStats(format: string, size: number, time: number) {
  try {
    console.log('Updating stats:', { format, size, time })
    
    const defaultStats: ConversionStats = {
      totalConversions: 0,
      todayConversions: 0,
      totalStorage: 0,
      successfulConversions: 0,
      failedConversions: 0,
      averageTime: 0,
      conversionRate: 100,
      conversionTimes: [],
      byFormat: {},
      bySize: {},
      hourlyActivity: {},
      successRate: 100,
      lastUpdated: new Date().toISOString(),
      popularConversions: []
    }

    const currentStats = await redis.get<ConversionStats>('conversion_stats') || defaultStats
    console.log('Current stats:', currentStats)

    // Update stats
    currentStats.totalConversions += 1
    currentStats.totalStorage += size
    currentStats.conversionTimes.push(time)
    if (currentStats.conversionTimes.length > 50) {
      currentStats.conversionTimes.shift()
    }
    currentStats.averageTime = currentStats.conversionTimes.reduce((a, b) => a + b, 0) / currentStats.conversionTimes.length
    currentStats.byFormat[format] = (currentStats.byFormat[format] || 0) + 1
    
    const sizeCategory = categorizeSize(size)
    currentStats.bySize[sizeCategory] = (currentStats.bySize[sizeCategory] || 0) + 1
    
    currentStats.lastUpdated = new Date().toISOString()

    // Save to Redis
    const saved = await redis.set('conversion_stats', currentStats)
    console.log('Saved stats:', saved)
    
    return currentStats
  } catch (error) {
    console.error('Failed to update stats:', error)
    return null
  }
}

function categorizeSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb < 1) return '<1MB'
  if (mb < 5) return '1-5MB'
  if (mb < 10) return '5-10MB'
  if (mb < 50) return '10-50MB'
  return '>50MB'
}

export async function incrementStats(format: string) {
  try {
    // Increment total conversions
    await redis.incr('stats:total')
    
    // Increment format-specific count
    await redis.incr(`stats:format:${format}`)
    
    // Update last conversion timestamp
    await redis.set('stats:lastConversion', new Date().toISOString())
    
    return true
  } catch (error) {
    console.error('Failed to update stats:', error)
    return false
  }
}

export async function getStats(): Promise<ConversionStats | null> {
  try {
    const stats = await redis.get<ConversionStats>('conversion_stats')
    if (!stats) {
      return {
        totalConversions: 0,
        todayConversions: 0,
        totalStorage: 0,
        successfulConversions: 0,
        failedConversions: 0,
        averageTime: 0,
        conversionRate: 100,
        conversionTimes: [],
        byFormat: {},
        bySize: {},
        hourlyActivity: {},
        successRate: 100,
        lastUpdated: new Date().toISOString(),
        popularConversions: []
      }
    }
    return stats
  } catch (error) {
    console.error('Failed to get stats:', error)
    return null
  }
}

// Add this function to test Redis connection
export async function testRedisConnection() {
  try {
    const testKey = 'test_connection'
    await redis.set(testKey, 'working')
    const value = await redis.get(testKey)
    await redis.del(testKey)
    return value === 'working'
  } catch (error) {
    console.error('Redis connection error:', error)
    return false
  }
} 