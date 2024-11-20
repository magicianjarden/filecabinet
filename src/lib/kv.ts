import { kv } from '@vercel/kv'

export const statsKV = {
  // Track each conversion
  async trackConversion(input: string, output: string, sizeReduction: number) {
    const timestamp = Date.now()
    await kv.lpush('conversions', {
      timestamp,
      input,
      output,
      sizeReduction
    })
  },

  // Track format popularity
  async incrementFormat(format: string) {
    await kv.hincrby('format_counts', format, 1)
  },

  // Track size analytics
  async trackSize(originalSize: number, newSize: number) {
    const reduction = ((originalSize - newSize) / originalSize) * 100
    await kv.lpush('sizes', {
      timestamp: Date.now(),
      originalSize,
      newSize,
      reduction
    })
  },

  // Get stats for the dashboard
  async getStats() {
    const [conversions, formatCounts, sizes] = await Promise.all([
      kv.lrange('conversions', 0, 100),  // Last 100 conversions
      kv.hgetall('format_counts'),       // Format popularity
      kv.lrange('sizes', 0, 100)         // Last 100 size reductions
    ])

    return {
      conversions,
      formatCounts,
      sizes
    }
  }
} 