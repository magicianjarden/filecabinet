'use client';

import { useEffect, useState } from 'react';
import { getGlobalStats } from "@/lib/utils/stats-service";
import { ConversionStats } from "@/types/stats";
import { getInitialStats } from "@/lib/utils/stats";
import { Skeleton } from "@/components/ui/skeleton";
import { SizeAnalytics } from "@/components/Stats/SizeAnalytics";
import { FormatAnalytics } from "@/components/Stats/FormatAnalytics";
import { PerformanceMetrics } from "@/components/Stats/PerformanceMetrics";
import { ConversionTrends } from "@/components/Stats/ConversionTrends";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StatsPage() {
  const [stats, setStats] = useState<ConversionStats>(getInitialStats());
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setIsRefreshing(true);
      const data = await getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Conversion Statistics</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conversion Statistics</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
        </p>
      </div>
      
      <div className="grid gap-8">
        <ConversionTrends 
          hourlyActivity={stats.hourlyActivity}
          totalConversions={stats.totalConversions}
          conversionRate={stats.successRate}
          isLoading={isRefreshing}
        />
        
        <FormatAnalytics 
          popularConversions={stats.popularConversions}
          isLoading={isRefreshing}
        />
        
        <SizeAnalytics 
          bySize={stats.bySize}
          totalSize={stats.totalSize}
          isLoading={isRefreshing}
        />
        
        <PerformanceMetrics 
          averageTime={stats.averageTime}
          successRate={stats.successRate}
          conversionTimes={stats.conversionTimes}
          isLoading={isRefreshing}
        />
      </div>
    </div>
  );
} 