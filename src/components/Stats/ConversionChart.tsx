'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversionChartProps {
  conversionTimes: number[];
  isLoading?: boolean;
}

export function ConversionChart({ conversionTimes, isLoading }: ConversionChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  const max = Math.max(...conversionTimes, 1);
  const min = Math.min(...conversionTimes, 0);
  const range = max - min;

  const getHeight = (value: number) => {
    return ((value - min) / range) * 100;
  };

  return (
    <div className="w-full h-[200px] flex items-end gap-2">
      {conversionTimes.map((time, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="group flex-1 flex flex-col items-center gap-2 relative"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-card text-card-foreground text-xs px-2 py-1 rounded pointer-events-none z-10 shadow-lg"
          >
            {time.toFixed(1)}s
          </motion.div>
          <motion.div 
            className="w-full bg-primary/20 hover:bg-primary/30 transition-colors rounded-t cursor-pointer"
            style={{ height: `${getHeight(time)}%` }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="w-full bg-primary h-1 rounded-full transform -translate-y-1/2"
              style={{ opacity: getHeight(time) / 100 }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            />
          </motion.div>
          <motion.span 
            className="text-xs text-muted-foreground absolute -bottom-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.2 }}
          >
            {index + 1}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
} 