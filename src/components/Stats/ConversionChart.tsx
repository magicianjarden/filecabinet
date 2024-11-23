'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ConversionChartProps {
  conversionTimes: number[];
  isLoading?: boolean;
}

export function ConversionChart({ conversionTimes, isLoading }: ConversionChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const data = conversionTimes.map((time, index) => ({
    id: index + 1,
    time: time
  }));

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between text-sm text-muted-foreground">
        <div>Conversion Time (seconds)</div>
        <div>Last {conversionTimes.length} conversions</div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e2e8f0" 
          />
          <XAxis 
            dataKey="id" 
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ 
              value: 'Conversion Number', 
              position: 'insideBottom', 
              offset: -5,
              fontSize: 12,
              fill: '#64748b'
            }}
          />
          <YAxis 
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ 
              value: 'Time (seconds)', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10,
              fontSize: 12,
              fill: '#64748b'
            }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-2 border rounded-lg shadow-lg">
                    <p className="text-sm font-medium">Conversion #{payload[0]?.payload?.id}</p>
                    <p className="text-sm text-muted-foreground">{`${typeof payload[0]?.value === 'number' ? payload[0].value.toFixed(2) : payload[0]?.value}s`}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="time" 
            stroke="#22c55e" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTime)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 