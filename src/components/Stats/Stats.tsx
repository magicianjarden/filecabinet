'use client';

import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { 
  Activity,
  Clock,
  HardDrive,
  CheckCircle
} from "lucide-react";
import { formatFileSize } from '@/lib/utils/format';
import { useState } from 'react';

interface StatsProps {
  totalConversions: number;
  totalSize: number;
  averageTime: number;
  conversionRate: number;
}

export function Stats({ 
  totalConversions, 
  totalSize, 
  averageTime, 
  conversionRate,
}: StatsProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        <p>Failed to load stats: {error}</p>
      </div>
    );
  }

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
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4"
    >
      <motion.div variants={item}>
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-start gap-2 p-3 sm:p-4">
            <div className="rounded-lg p-2 bg-blue-100/50">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Total Conversions</h3>
              <motion.p 
                className="text-xl sm:text-2xl font-semibold text-slate-900"
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
          <div className="flex flex-col sm:flex-row items-start gap-2 p-3 sm:p-4">
            <div className="rounded-lg p-2 bg-green-100/50">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Average Time</h3>
              <motion.p 
                className="text-xl sm:text-2xl font-semibold text-slate-900"
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
          <div className="flex flex-col sm:flex-row items-start gap-2 p-3 sm:p-4">
            <div className="rounded-lg p-2 bg-purple-100/50">
              <HardDrive className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Total Size</h3>
              <motion.p 
                className="text-xl sm:text-2xl font-semibold text-slate-900"
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
          <div className="flex flex-col sm:flex-row items-start gap-2 p-3 sm:p-4">
            <div className="rounded-lg p-2 bg-yellow-100/50">
              <CheckCircle className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600">Success Rate</h3>
              <motion.p 
                className="text-xl sm:text-2xl font-semibold text-slate-900"
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
  );
} 