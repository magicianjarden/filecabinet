'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversionTrends } from "@/components/Stats/ConversionTrends";
import { FormatAnalytics } from "@/components/Stats/FormatAnalytics";
import { SizeAnalytics } from "@/components/Stats/SizeAnalytics";
import { PerformanceMetrics } from "@/components/Stats/PerformanceMetrics";
import { Loader2 } from "lucide-react";
import { getGlobalStats } from '@/lib/utils/stats-service';
import { ConversionStats } from '@/types/stats';

export default function StatsPage() {
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getGlobalStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <Card className="p-4 sm:p-6 text-center text-slate-600">
          No statistics available
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4 sm:space-y-6 max-w-7xl">
      <Card className="p-4 sm:p-6 border-2 border-green-600/20 bg-white">
        <div className="space-y-2 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Conversion Analytics
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Detailed insights into file conversion performance and usage patterns
          </p>
        </div>

        <Tabs defaultValue="trends" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-full sm:w-auto min-w-max sm:min-w-0 bg-slate-100 p-1 rounded-lg">
              <TabsTrigger 
                value="trends"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 data-[state=active]:bg-white"
              >
                Trends
              </TabsTrigger>
              <TabsTrigger 
                value="formats"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 data-[state=active]:bg-white"
              >
                Formats
              </TabsTrigger>
              <TabsTrigger 
                value="sizes"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 data-[state=active]:bg-white"
              >
                File Sizes
              </TabsTrigger>
              <TabsTrigger 
                value="performance"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 data-[state=active]:bg-white"
              >
                Performance
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trends">
            <ConversionTrends stats={stats} />
          </TabsContent>

          <TabsContent value="formats">
            <FormatAnalytics stats={stats} />
          </TabsContent>

          <TabsContent value="sizes">
            <SizeAnalytics stats={stats} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMetrics stats={stats} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 