'use client';

import { useEffect, useState } from 'react';
import { ConversionStats } from '@/types/stats';
import { ConversionChart } from '@/components/Stats/ConversionChart';
import { ConversionTrends } from '@/components/Stats/ConversionTrends';
import { FormatAnalytics } from '@/components/Stats/FormatAnalytics';
import { PerformanceMetrics } from '@/components/Stats/PerformanceMetrics';
import { SizeAnalytics } from '@/components/Stats/SizeAnalytics';

export default function StatsPage() {
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched stats:', data); // Debug log
        setStats(data);
      } catch (error: unknown) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="p-4 text-red-600">Error loading stats: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Conversion Statistics</h1>
      
      <div className="grid gap-6">
        <ConversionChart 
          conversionTimes={stats?.conversionTimes || []}
          isLoading={isLoading}
        />

        <ConversionTrends 
          hourlyActivity={stats?.hourlyActivity || {}}
          totalConversions={stats?.totalConversions || 0}
          conversionRate={stats?.conversionRate || 0}
          isLoading={isLoading}
        />

        <FormatAnalytics 
          popularConversions={stats?.popularConversions || []}
          isLoading={isLoading}
        />

        <PerformanceMetrics 
          averageTime={stats?.averageTime || 0}
          successRate={stats?.successRate || 0}
          conversionTimes={stats?.conversionTimes || []}
          isLoading={isLoading}
        />

        <SizeAnalytics 
          bySize={stats?.bySize || {}}
          totalSize={stats?.totalSize || 0}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 