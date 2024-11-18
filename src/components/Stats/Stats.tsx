'use client';

import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, ArrowDown, FileIcon, Clock, Zap, HardDrive, Info } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/format';
import { ConversionChart } from './ConversionChart';
import { cn } from "@/lib/utils";

interface StatsProps {
  totalConversions: number;
  totalSize: number;
  averageTime: number;
  conversionRate: number;
  conversionTimes: number[];
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  description,
  trend,
  className
}: {
  icon: any;
  title: string;
  value: string;
  subtitle: string;
  description: string;
  trend?: { value: string; direction: 'up' | 'down' };
  className?: string;
}) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200",
      "hover:shadow-lg hover:-translate-y-0.5",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/50 to-transparent" />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 p-6">
        {/* Left Section: Icon and Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 bg-green-50 rounded-xl border-2 border-green-100 flex-shrink-0">
            <Icon className="w-6 h-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-slate-600 truncate">
              {title}
            </h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {value}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Trend and Info */}
        <div className="flex items-center gap-4 ml-auto">
          {trend && (
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full",
              trend.direction === 'up' 
                ? 'text-green-700 bg-green-100' 
                : 'text-red-700 bg-red-100'
            )}>
              {trend.direction === 'up' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="p-2 hover:bg-green-50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2" 
                  type="button"
                  aria-label={`More information about ${title}`}
                >
                  <Info className="w-5 h-5 text-green-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                className="max-w-[300px] p-4 bg-slate-900 text-slate-50"
              >
                <div className="space-y-2">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-slate-300">{description}</p>
                  {trend && (
                    <p className="text-xs text-slate-400 mt-1">
                      {trend.direction === 'up' ? 'Increased' : 'Decreased'} by {trend.value} compared to last period
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
}

export function Stats({ 
  totalConversions, 
  totalSize, 
  averageTime, 
  conversionRate,
  conversionTimes 
}: StatsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <StatCard
          icon={FileIcon}
          title="Total Conversions"
          value={totalConversions.toLocaleString()}
          subtitle="All time"
          description="Total number of files successfully converted through the system. This includes all file types and formats."
          trend={{ value: '12% increase', direction: 'up' }}
        />
        
        <StatCard
          icon={HardDrive}
          title="Total Size"
          value={formatFileSize(totalSize)}
          subtitle="Processed data"
          description="Cumulative size of all files that have been processed. This helps track system usage and performance."
        />
        
        <StatCard
          icon={Clock}
          title="Average Time"
          value={`${averageTime.toFixed(1)}s`}
          subtitle="Per conversion"
          description="Average time taken to complete a single file conversion. Lower times indicate better performance."
          trend={{ value: '5% faster', direction: 'up' }}
        />
        
        <StatCard
          icon={Zap}
          title="Success Rate"
          value={`${conversionRate}%`}
          subtitle="Conversion success"
          description="Percentage of file conversions that completed successfully without errors or interruptions."
        />
      </div>

      {conversionTimes.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Conversion Time Trend
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Performance over time
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="p-2 hover:bg-green-50 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2" 
                    type="button"
                    aria-label="More information about Conversion Times"
                  >
                    <Info className="w-4 h-4 text-green-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="left" 
                  className="max-w-[300px] p-4 bg-slate-900 text-slate-50"
                >
                  <div className="space-y-2">
                    <p className="font-medium">Conversion Times</p>
                    <p className="text-sm text-slate-300">
                      Historical view of how long each conversion took to complete. 
                      This helps identify performance trends over time.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <ConversionChart conversionTimes={conversionTimes} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 