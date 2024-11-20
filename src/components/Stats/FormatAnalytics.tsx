'use client';

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConversionStats } from '@/types/stats';
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';

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

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 mb-1">{data.format}</p>
        <div className="space-y-1 text-xs">
          <p className="text-slate-600">
            Conversions: <span className="font-medium text-slate-900">{data.count.toLocaleString()}</span>
          </p>
          <p className="text-slate-600">
            Success Rate: <span className="font-medium text-slate-900">{data.rate.toFixed(1)}%</span>
          </p>
          <p className="text-slate-600">
            Avg. Time: <span className="font-medium text-slate-900">{data.avgTime.toFixed(2)}s</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
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

      <Card className="p-3 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Popular Conversions</h3>
          <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
            {stats.totalConversions.toLocaleString()} Total
          </Badge>
        </div>
        
        <div className="h-[200px] sm:h-[300px] -mx-3 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatData.slice(0, 6)} margin={{ left: -20, right: 0, bottom: 0, top: 10 }}>
              <XAxis 
                dataKey="format" 
                stroke="#94a3b8"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
                tickMargin={5}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={10}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  padding: '8px'
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
                animationBegin={0}
                animationDuration={1500}
              />
              <Tooltip content={<CustomBarTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-3 sm:p-6 border border-slate-200 overflow-hidden">
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base mb-4">Format Details</h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Format</TableHead>
                <TableHead className="text-xs sm:text-sm">Count</TableHead>
                <TableHead className="text-xs sm:text-sm">Success Rate</TableHead>
                <TableHead className="text-xs sm:text-sm">Avg. Time</TableHead>
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
        </div>
      </Card>
    </motion.div>
  );
} 