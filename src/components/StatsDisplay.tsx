'use client'

import { useEffect, useState } from 'react'
import { getStats } from '@/lib/redis'
import type { ConversionStats } from '@/lib/types'

export function StatsDisplay() {
  const [stats, setStats] = useState<ConversionStats | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStats()
      setStats(data)
    }
    
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 border rounded-lg">
        <h3 className="font-bold">Total Conversions</h3>
        <p className="text-2xl">{stats.totalConversions}</p>
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-bold">Popular Formats</h3>
        {Object.entries(stats.byFormat)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([format, count]) => (
            <div key={format} className="flex justify-between">
              <span>{format}</span>
              <span>{count.toString()}</span>
            </div>
          ))}
      </div>
      <div className="p-4 border rounded-lg">
        <h3 className="font-bold">By Size</h3>
        {Object.entries(stats.bySize)
          .map(([size, count]) => (
            <div key={size} className="flex justify-between">
              <span>{size}</span>
              <span>{count.toString()}</span>
            </div>
          ))}
      </div>
    </div>
  )
} 