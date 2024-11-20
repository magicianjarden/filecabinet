'use client';

import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConversionStats } from '@/types/stats';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "../ui/skeleton";

interface PerformanceMetricsProps {
  averageTime: number;
  successRate: number;
  conversionTimes: number[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 mb-1">{label}</p>
        <div className="space-y-1 text-xs">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-slate-600">
              {entry.name}: <span className="font-medium text-slate-900">
                {entry.value.toFixed(2)}s
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function PerformanceMetrics({ 
  averageTime, 
  successRate, 
  conversionTimes, 
  isLoading 
}: PerformanceMetricsProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px]" />;
  }

  const recentConversions = conversionTimes.slice(-100);

  const performanceData = recentConversions.map((time, index) => ({
    name: `Conversion ${index + 1}`,
    time
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
    >
      <Card className="p-3 sm:p-6 border border-slate-200">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6"
        >
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
            Conversion Times
          </h3>
          <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
            Avg: {averageTime.toFixed(2)}s
          </Badge>
        </motion.div>

        <div className="h-[200px] sm:h-[300px] -mx-3 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={10}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={10}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="time" 
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                animationBegin={0}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Performance Metrics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-3 sm:p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base mb-4">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-lg bg-slate-50"
            >
              <p className="text-sm text-slate-600">Average Time</p>
              <p className="text-2xl font-bold text-slate-900">
                {averageTime.toFixed(2)}s
              </p>
            </motion.div>
            {/* Add more performance metrics as needed */}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
} 