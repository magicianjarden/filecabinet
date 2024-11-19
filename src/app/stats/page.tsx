import { getStats } from '@/lib/redis'
import { Stats } from '@/components/Stats/Stats'

export default async function StatsPage() {
  const stats = await getStats()
  
  if (!stats) return <div>Loading stats...</div>

  return (
    <Stats 
      totalConversions={stats.totalConversions}
      totalSize={stats.totalSize}
      averageTime={stats.averageTime}
      conversionRate={stats.conversionRate}
      conversionTimes={stats.conversionTimes}
    />
  )
} 