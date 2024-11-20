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
import { ConversionChart } from './ConversionChart';

interface StatsProps {
  totalConversions: number;
  totalSize: number;
  averageTime: number;
  conversionRate: number;
  conversionTimes: number[];
}

export function Stats({ 
  totalConversions, 
  totalSize, 
  averageTime, 
  conversionRate,
  conversionTimes 
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
    <div className="space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item}>
          <Card className="p-6 border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <motion.h2 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {totalConversions.toLocaleString()}
                </motion.h2>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Time</p>
                <motion.h2 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {averageTime.toFixed(2)}s
                </motion.h2>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <motion.h2 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {formatFileSize(totalSize)}
                </motion.h2>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-6 border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <motion.h2 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {conversionRate.toFixed(1)}%
                </motion.h2>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Conversion Chart */}
      <Card className="p-6 border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Conversion Times</h3>
        <ConversionChart conversionTimes={conversionTimes} />
      </Card>
    </div>
  );
} 