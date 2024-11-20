'use client';

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConversionStats } from '@/types/stats';
import { BarChart3 } from "lucide-react";
import Link from "next/link";

interface FormatAnalyticsProps {
  stats: ConversionStats;
}

interface FormatData {
  format: string;
  count: number;
  percentage: number;
  rate: number;
  avgTime: number;
}

export function FormatAnalytics({ stats }: FormatAnalyticsProps) {
  const formatData: FormatData[] = Object.entries(stats.byFormat)
    .map(([format, count]) => ({
      format,
      count,
      percentage: (count / stats.totalConversions) * 100,
      rate: (count / stats.totalConversions) * stats.successRate,
      avgTime: stats.averageTime
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Global Statistics</h2>
            <Badge variant="secondary">Sitewide</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Overall platform performance and conversion metrics
          </p>
        </div>

        <Link
          href="/stats"
          className="group flex items-center gap-3 px-4 py-2 rounded-lg border border-green-100 bg-white/50 hover:bg-green-50 transition-colors"
        >
          <BarChart3 className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <h3 className="text-sm font-medium text-green-600">
              View Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Real-time insights
            </p>
          </div>
          <span className="text-green-600 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      <Card className="p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Popular Conversions</h3>
          <Badge variant="secondary">
            {stats.totalConversions.toLocaleString()} Total
          </Badge>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatData.slice(0, 10)}>
              <XAxis 
                dataKey="format" 
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
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
              <Bar 
                dataKey="count" 
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">Format Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Format</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Avg. Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formatData.map((format) => (
              <TableRow key={format.format}>
                <TableCell className="font-medium">{format.format}</TableCell>
                <TableCell>{format.count.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          format.rate >= 90 ? 'bg-green-500' :
                          format.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${format.rate}%` }}
                      />
                    </div>
                    <span className="text-sm">{format.rate}%</span>
                  </div>
                </TableCell>
                <TableCell>{format.avgTime}s</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 