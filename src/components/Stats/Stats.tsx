'use client';

import { Card } from "@/components/ui/card";
import { FileIcon, Clock, Zap, HardDrive } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/format';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Conversions */}
      <Card className="p-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">
              Total Conversions
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {totalConversions.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Total Size */}
      <Card className="p-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <HardDrive className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">
              Total Size
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {formatFileSize(totalSize)}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Average Time */}
      <Card className="p-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">
              Average Time
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {`${averageTime.toFixed(1)}s`}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Success Rate */}
      <Card className="p-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <Zap className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">
              Success Rate
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {`${conversionRate}%`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 