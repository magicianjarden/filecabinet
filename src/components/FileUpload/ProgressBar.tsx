'use client';

import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error: string | null;
}

export function ProgressBar({ progress, status, error }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <Progress 
        value={progress} 
        className="h-2 border border-green-200"
        indicatorClassName="bg-gradient-to-r from-green-600 to-green-500"
      />
      <div className="flex justify-between text-sm">
        <span className={cn(
          "font-medium",
          status === 'completed' && "text-green-600",
          status === 'failed' && "text-red-600",
          status === 'processing' && "text-green-600"
        )}>
          {status === 'completed' && 'Conversion complete'}
          {status === 'failed' && error}
          {status === 'processing' && 'Converting...'}
        </span>
        <span className="text-slate-500">{progress}%</span>
      </div>
    </div>
  );
} 