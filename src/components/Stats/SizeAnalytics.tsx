'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { HardDrive, ArrowUp, ArrowDown } from 'lucide-react';
import { ConversionStats } from '@/types/stats';
import { formatFileSize } from '@/lib/utils/format';

// Define color constants
const COLORS = ['#16a34a', '#2563eb', '#9333ea', '#c026d3', '#e11d48', '#ea580c'];

interface SizeAnalyticsProps {
  stats: ConversionStats;
}

interface SizeDataItem {
  name: string;
  value: number;
  percentage: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 mb-1">{data.name}</p>
        <div className="space-y-1 text-xs">
          <p className="text-slate-600">
            Count: <span className="font-medium text-slate-900">{data.value.toLocaleString()}</span>
          </p>
          <p className="text-slate-600">
            Percentage: <span className="font-medium text-slate-900">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function SizeAnalytics({ stats }: SizeAnalyticsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sizeData: SizeDataItem[] = Object.entries(stats.bySize)
    .map(([range, count]) => ({
      name: range,
      value: count,
      percentage: (count / stats.totalConversions) * 100
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-3 sm:p-4 border border-slate-200 bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-md">
            {/* ... card content ... */}
          </Card>
        </motion.div>
        {/* ... other cards with similar animations ... */}
      </div>

      {/* Pie Chart Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-3 sm:p-6 border border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-[250px] sm:h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sizeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill="#16a34a"
                    label={({ name, percentage }) => 
                      `${name} (${percentage.toFixed(1)}%)`
                    }
                    labelLine={{ strokeWidth: 1 }}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {sizeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
              {sizeData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                    hoveredIndex === index ? 'bg-slate-50' : ''
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs sm:text-sm text-slate-600">{item.name}</span>
                  <span className="text-xs sm:text-sm font-medium ml-auto">
                    {item.percentage.toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
} 