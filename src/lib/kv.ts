// import { kv } from '@vercel/kv'

export const statsKV = {
  // Track each conversion
  async trackConversion(input: string, output: string, sizeReduction: number) {
    // No-op for build
    return;
  },

  // Track format popularity
  async incrementFormat(format: string) {
    // No-op for build
    return;
  },

  // Track size analytics
  async trackSize(originalSize: number, newSize: number) {
    // No-op for build
    return;
  },

  // Get stats for the dashboard
  async getStats() {
    // Return dummy stats for build
    return {
      conversions: [],
      formatCounts: {},
      sizes: []
    };
  }
} 