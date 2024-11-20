'use client';

import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { 
  Activity,
  Clock,
  HardDrive,
  CheckCircle,
  BarChart,
  BarChart3
} from "lucide-react";
import { formatFileSize } from '@/lib/utils/format';
import { ConversionChart } from './ConversionChart';
import { Progress } from "@/components/ui/progress"

interface StatsProps {
  totalConversions: number;
  totalSize: number;
  averageTime: number;
  conversionRate: number;
  conversionTimes: number[];
  popularConversions: {
    from: string;
    to: string;
    count: number;
  }[];
  bySize: Record<string, number>;
}

export function Stats({ 
  totalConversions, 
  totalSize, 
  averageTime, 
  conversionRate,
  conversionTimes,
  popularConversions,
  bySize
}: StatsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="rounded-lg p-2 bg-blue-100/50">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Conversions</h3>
                <motion.p 
                  className="text-2xl font-semibold text-slate-900"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {totalConversions.toLocaleString()}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="rounded-lg p-2 bg-green-100/50">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Average Time</h3>
                <motion.p 
                  className="text-2xl font-semibold text-slate-900"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {averageTime.toFixed(2)}s
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="rounded-lg p-2 bg-purple-100/50">
                <HardDrive className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Total Size</h3>
                <motion.p 
                  className="text-2xl font-semibold text-slate-900"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {formatFileSize(totalSize)}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="rounded-lg p-2 bg-yellow-100/50">
                <CheckCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-600">Success Rate</h3>
                <motion.p 
                  className="text-2xl font-semibold text-slate-900"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {conversionRate.toFixed(1)}%
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <Card className="p-6 border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">Popular Conversions</h3>
        </div>
        <div className="space-y-4">
          {popularConversions.slice(0, 5).map((conversion, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {conversion.from.toUpperCase()} → {conversion.to.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {conversion.count.toLocaleString()} conversions
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">File Size Distribution</h3>
        </div>
        <div className="space-y-6">
          {Object.entries(bySize)
            .sort((a, b) => {
              const sizes = ['< 1MB', '1-5MB', '5-10MB', '10-50MB', '> 50MB'];
              return sizes.indexOf(a[0]) - sizes.indexOf(b[0]);
            })
            .map(([size, count], index) => {
              const total = Object.values(bySize).reduce((sum, c) => sum + c, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{size}</span>
                    <span className="text-muted-foreground">
                      {count.toLocaleString()} files ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
          })}
        </div>
      </Card>

      {/* Conversion Chart */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-slate-600 mb-4">Conversion Times</h3>
        <ConversionChart conversionTimes={conversionTimes} />
      </Card>
    </div>
  );
} 