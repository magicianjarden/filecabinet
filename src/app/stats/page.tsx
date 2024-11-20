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
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 text-center text-slate-600">
          No statistics available
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <Card className="p-6 border-2 border-green-600/20 bg-white">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Conversion Analytics
          </h1>
          <p className="text-slate-600">
            Detailed insights into file conversion performance and usage patterns
          </p>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="formats">Formats</TabsTrigger>
            <TabsTrigger value="sizes">File Sizes</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

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