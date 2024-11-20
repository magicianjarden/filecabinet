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
      <div className="flex justify-between text-sm">
        <span>
          {status === 'processing' && 'Converting...'}
          {status === 'completed' && 'Conversion complete!'}
          {status === 'failed' && 'Conversion failed'}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-200 ${
            status === 'failed' 
              ? 'bg-red-500' 
              : status === 'completed'
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 