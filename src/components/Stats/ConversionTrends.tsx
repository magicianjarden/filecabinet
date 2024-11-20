'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ConversionTrendsProps {
  hourlyActivity: Record<string, number>;
  totalConversions: number;
  conversionRate: number;
  isLoading?: boolean;
}

export function ConversionTrends({ 
  hourlyActivity, 
  totalConversions, 
  conversionRate,
  isLoading 
}: ConversionTrendsProps) {
  const hasData = Object.keys(hourlyActivity || {}).length > 0;

  if (!hasData || isLoading) {
    return <Skeleton className="h-[300px]" />;
  }

  // Process data for the chart
  const chartData = Object.entries(hourlyActivity)
    .slice(-24)
    .map(([hour, count]) => ({
      hour,
      conversions: count
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalConversions.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
} 