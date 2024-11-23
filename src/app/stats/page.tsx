'use client';

import { useEffect, useState } from 'react';
import { ConversionStats } from '@/types/stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Clock, 
  FileType, 
  HardDrive, 
  BarChart3, 
  BarChart2 
} from "lucide-react";
import { ConversionChart } from '@/components/Stats/ConversionChart';
import { SizeAnalytics } from '@/components/Stats/SizeAnalytics';
import { FormatAnalytics } from '@/components/Stats/FormatAnalytics';
import { PerformanceMetrics } from '@/components/Stats/PerformanceMetrics';
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Badge } from "@/components/ui/badge";

export default function StatsPage() {
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <BreadcrumbNav 
        items={[
          {
            title: "Analytics",
            icon: <BarChart2 className="h-4 w-4" />,
          }
        ]}
      />
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <Badge 
            variant="secondary" 
            className="bg-slate-100 text-slate-600 relative -top-1 text-xs px-2 py-0.5"
          >
            Sitewide
          </Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversions
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalConversions.toLocaleString() ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.todayConversions ?? 0} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.successRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.successfulConversions ?? 0} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.averageTime.toFixed(2)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Per conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Size
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(stats?.totalSize ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Processed data
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Conversion Times</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ConversionChart 
                  conversionTimes={stats?.conversionTimes ?? []}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Popular Formats</CardTitle>
                <CardDescription>
                  Most used conversion formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {stats?.popularConversions.map((conversion, index) => (
                    <div key={index} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {conversion.from.toUpperCase()} → {conversion.to.toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {conversion.count} conversions
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {((conversion.count / (stats?.totalConversions || 1)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <SizeAnalytics 
              bySize={stats?.bySize ?? {}}
              totalSize={stats?.totalSize ?? 0}
              isLoading={isLoading}
            />
            <FormatAnalytics 
              popularConversions={stats?.popularConversions ?? []}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <PerformanceMetrics 
            averageTime={stats?.averageTime ?? 0}
            successRate={stats?.successRate ?? 0}
            conversionTimes={stats?.conversionTimes ?? []}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
} 