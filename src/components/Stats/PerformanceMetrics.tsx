'use client';

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, AlertTriangle } from 'lucide-react';
import { ConversionStats } from '@/types/stats';

interface PerformanceMetricsProps {
  stats: ConversionStats;
}

export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
  const hourlyData = Object.entries(stats.hourlyActivity)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      conversions: count,
      avgTime: stats.averageTime
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // Find peak hour safely
  const peakHour = hourlyData.length > 0 
    ? hourlyData.reduce((a, b) => 
        a.conversions > b.conversions ? a : b
      ).hour
    : 'No data';

  // If no data, provide default chart data
  const chartData = hourlyData.length > 0 
    ? hourlyData 
    : [{ hour: 'No data', conversions: 0, avgTime: 0 }];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-200 bg-white/50 hover:bg-white/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Zap className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.successRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200 bg-white/50 hover:bg-white/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                Average Time
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {stats.averageTime.toFixed(2)}s
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200 bg-white/50 hover:bg-white/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                Error Rate
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {(100 - stats.successRate).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Hourly Performance</h3>
          <Badge variant="secondary">
            Peak: {peakHour}
          </Badge>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="hour" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="#16a34a" 
                strokeWidth={2}
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="avgTime" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
} 