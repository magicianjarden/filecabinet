'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Clock } from "lucide-react"
import { Skeleton } from "../ui/skeleton"

interface ConversionChartProps {
  conversionTimes: number[];
  isLoading?: boolean;
}

export function ConversionChart({ conversionTimes, isLoading }: ConversionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Conversion Times
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const averageTime = conversionTimes.length > 0
    ? conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length
    : 0;

  const max = Math.max(...conversionTimes, 1);
  const min = Math.min(...conversionTimes, 0);
  const range = max - min;

  const getHeight = (value: number) => {
    return ((value - min) / range) * 100;
  };

  return (
    <div className="w-full h-[120px] sm:h-[150px] md:h-[200px] flex items-end gap-1 sm:gap-2 px-2">
      {conversionTimes.map((time, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className="group flex-1 flex flex-col items-center gap-1 sm:gap-2 relative"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-8 sm:-top-6 opacity-0 group-hover:opacity-100 touch-none sm:touch-auto transition-opacity bg-slate-900/95 backdrop-blur-sm text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded pointer-events-none z-10 shadow-lg"
          >
            {time.toFixed(1)}s
          </motion.div>
          <motion.div 
            className="w-full bg-green-600/20 hover:bg-green-600/30 transition-colors rounded-t cursor-pointer"
            style={{ height: `${getHeight(time)}%` }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="w-full bg-green-600 h-0.5 sm:h-1 rounded-full transform -translate-y-1/2"
              style={{ opacity: getHeight(time) / 100 }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            />
          </motion.div>
          <motion.span 
            className="text-[10px] sm:text-xs text-slate-600 absolute -bottom-4 sm:-bottom-6"
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