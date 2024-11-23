'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp } from "lucide-react";

interface PerformanceMetricsProps {
  averageTime: number;
  successRate: number;
  conversionTimes: number[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium mb-1">{label}</p>
        <div className="space-y-1 text-xs">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = conversionTimes.map((time, index) => ({
    id: index + 1,
    time
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle>Conversion Time Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis 
                  dataKey="id" 
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
        </CardContent>
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