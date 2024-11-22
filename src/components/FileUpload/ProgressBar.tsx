'use client';

import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils"
import { ConversionStatus } from "@/types"

interface ProgressBarProps {
  progress: number;
  status: ConversionStatus;
  error: string | null;
}

export function ProgressBar({ progress, status, error }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          {status === 'processing' && 'Converting...'}
          {status === 'completed' && 'Conversion complete!'}
          {status === 'failed' && 'Conversion failed'}
          {status === 'pending' && 'Waiting...'}
          {status === 'idle' && 'Ready'}
        </span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className={cn({
        'bg-green-500': status === 'completed',
        'bg-red-500': status === 'failed',
        'bg-blue-500': status === 'processing',
        'bg-gray-500': status === 'pending',
      })} />
      {error && (
        <div className="text-red-500 text-sm">
          <XCircle className="inline-block mr-1" /> {error}
        </div>
      )}
      {status === 'completed' && (
        <div className="text-green-500 text-sm">
          <CheckCircle2 className="inline-block mr-1" /> Completed
        </div>
      )}
      {status === 'processing' && (
        <div className="text-blue-500 text-sm">
          <Loader2 className="inline-block mr-1 animate-spin" /> Processing
        </div>
      )}
    </div>
  );
}