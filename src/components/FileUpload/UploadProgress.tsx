'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadProgressProps {
  isUploading: boolean;
  fileName?: string;
  progress?: number;
  onCancel?: () => void;
  error?: string;
}

export function UploadProgress({
  isUploading,
  fileName,
  progress = 0,
  onCancel,
  error
}: UploadProgressProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isUploading) {
      setIsVisible(true);
    } else {
      // Delay hiding to show completion state briefly
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUploading]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-80 max-w-md">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : progress === 100 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Upload className="h-5 w-5 text-blue-500 animate-pulse" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {error ? 'Upload Failed' : progress === 100 ? 'Upload Complete' : 'Uploading...'}
              </p>
              {onCancel && isUploading && progress < 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {fileName && (
              <p className="text-xs text-gray-500 truncate mb-2">
                {fileName}
              </p>
            )}

            {error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : (
              <div className="space-y-1">
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-gray-500">
                  {progress === 100 ? 'File uploaded successfully' : `${Math.round(progress)}% complete`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 