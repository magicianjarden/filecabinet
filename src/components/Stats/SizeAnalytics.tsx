'use client';

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { HardDrive, ArrowUp, ArrowDown } from 'lucide-react';
import { ConversionStats } from '@/types/stats';
import { formatFileSize } from '@/lib/utils/format';

interface SizeAnalyticsProps {
  stats: ConversionStats;
}

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

export function SizeAnalytics({ stats }: SizeAnalyticsProps) {
  const sizeData = Object.entries(stats.bySize)
    .map(([range, count]) => ({
      name: range,
      value: count,
      percentage: (count / stats.totalConversions) * 100
    }))
    .sort((a, b) => b.value - a.value);

  const averageSize = stats.totalSize / stats.totalConversions;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-200 bg-white/50 hover:bg-white/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <HardDrive className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Processed</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200 bg-white/50 hover:bg-white/80 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ArrowDown className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Average Size</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatFileSize(averageSize)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Size Distribution</h3>
          <Badge variant="secondary">
            Average: {formatFileSize(averageSize)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sizeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#16a34a"
                  label={({ name, percentage }) => 
                    `${name} (${percentage.toFixed(1)}%)`
                  }
                >
                  {sizeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
} 