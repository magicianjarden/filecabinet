import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface ConversionStats {
  totalConversions: number
  totalSize: number
  conversionTimes: number[]
  averageTime: number
  conversionRate: number
  byFormat: Record<string, number>
  bySize: Record<string, number>
  lastUpdated: string
}

export async function updateStats(format: string, size: number, time: number) {
  try {
    console.log('Updating stats:', { format, size, time })
    
    const currentStats = await redis.get<ConversionStats>('conversion_stats')
    console.log('Current stats:', currentStats)

    const stats = currentStats || {
      totalConversions: 0,
      totalSize: 0,
      conversionTimes: [],
      averageTime: 0,
      conversionRate: 100,
      byFormat: {},
      bySize: {},
      lastUpdated: new Date().toISOString()
    }

    // Update stats
    stats.totalConversions += 1
    stats.totalSize += size
    stats.conversionTimes.push(time)
    if (stats.conversionTimes.length > 50) {
      stats.conversionTimes.shift()
    }
    stats.averageTime = stats.conversionTimes.reduce((a, b) => a + b, 0) / stats.conversionTimes.length
    stats.byFormat[format] = (stats.byFormat[format] || 0) + 1
    
    const sizeCategory = categorizeSize(size)
    stats.bySize[sizeCategory] = (stats.bySize[sizeCategory] || 0) + 1
    
    stats.lastUpdated = new Date().toISOString()

    // Save to Redis
    const saved = await redis.set('conversion_stats', stats)
    console.log('Saved stats:', saved)
    
    return stats
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
        totalSize: 0,
        conversionTimes: [],
        averageTime: 0,
        conversionRate: 100,
        byFormat: {},
        bySize: {},
        lastUpdated: new Date().toISOString()
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