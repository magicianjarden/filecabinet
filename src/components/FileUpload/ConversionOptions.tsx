'use client';

import { Card } from "@/components/ui/card";
import { FileIcon, Clock, HardDrive } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/format';
import { cn } from "@/lib/utils";

interface ConversionOptionsProps {
  currentFormat: string;
  targetFormat: string;
  onFormatChange: (format: string) => void;
  file: File;
}

const FORMAT_OPTIONS = {
  // Document formats
  pdf: ['docx', 'txt', 'rtf'],
  docx: ['pdf', 'txt', 'rtf'],
  txt: ['pdf', 'docx', 'rtf'],
  rtf: ['pdf', 'docx', 'txt'],
  
  // Image formats
  jpg: ['png', 'webp', 'gif'],
  jpeg: ['png', 'webp', 'gif'],
  png: ['jpg', 'webp', 'gif'],
  webp: ['jpg', 'png', 'gif'],
  gif: ['jpg', 'png', 'webp'],
  
  // Media formats
  mp4: ['webm', 'mov', 'avi'],
  webm: ['mp4', 'mov', 'avi'],
  mov: ['mp4', 'webm', 'avi'],
  avi: ['mp4', 'webm', 'mov'],
  mp3: ['wav', 'ogg', 'aac'],
  wav: ['mp3', 'ogg', 'aac'],
  ogg: ['mp3', 'wav', 'aac'],
  aac: ['mp3', 'wav', 'ogg'],
  
  // Archive formats
  rar: ['zip'],
  '7z': ['zip'],
  tar: ['zip'],
  gz: ['zip'],
  zip: ['zip'],
} as const;

export function ConversionOptions({
  currentFormat,
  targetFormat,
  onFormatChange,
  file
}: ConversionOptionsProps) {
  const availableFormats = FORMAT_OPTIONS[currentFormat.toLowerCase() as keyof typeof FORMAT_OPTIONS] || [];
  const lastModified = new Date(file.lastModified).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-5 relative z-20">
      {/* Current File Info Card */}
      <Card className="p-3 sm:p-4 border-2 border-green-600 bg-white 
        shadow-[4px_4px_0px_0px_rgb(22,163,74)] overflow-hidden
        relative after:absolute after:inset-0 after:bg-gradient-to-r 
        after:from-green-500/10 after:to-transparent">
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          {/* File Icon and Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg border-2 border-green-200">
                <FileIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate text-slate-600" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1 
                  text-gradient">
                  {currentFormat}
                </p>
              </div>
            </div>
          </div>

          {/* File Details */}
          <div className="flex gap-3">
            {/* Size */}
            <div className="flex-1 sm:flex-initial p-2.5 bg-green-50 rounded-lg 
              border-2 border-green-200">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-green-600" />
                <p className="text-xs text-slate-600">Size</p>
              </div>
              <p className="text-sm font-semibold mt-0.5 text-slate-700">
                {formatFileSize(file.size)}
              </p>
            </div>

            {/* Last Modified */}
            <div className="flex-1 sm:flex-initial p-2.5 bg-green-50 rounded-lg 
              border-2 border-green-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <p className="text-xs text-slate-600">Modified</p>
              </div>
              <p className="text-sm font-semibold mt-0.5 text-slate-700">
                {lastModified}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Format Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
            Convert To
          </p>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-green-500/20 to-transparent"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {availableFormats.map((format) => (
            <button
              key={format}
              onClick={() => onFormatChange(format)}
              type="button"
              className={cn(
                "py-2.5 px-3 border-2 rounded-lg font-bold uppercase tracking-wider",
                "transition-all duration-200",
                "hover:shadow-[4px_4px_0px_0px_rgb(22,163,74)]",
                "active:shadow-[2px_2px_0px_0px_rgb(22,163,74)]",
                "active:translate-x-[2px] active:translate-y-[2px]",
                targetFormat === format
                  ? "bg-green-600 border-green-600 text-white shadow-none translate-x-[4px] translate-y-[4px]"
                  : "border-green-600 text-green-600 hover:bg-green-50"
              )}
            >
              <span className="text-base sm:text-lg">{format}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Info */}
      {targetFormat && (
        <div className="p-3 border-2 border-green-200 rounded-lg bg-green-50">
          <p className="text-xs sm:text-sm text-green-700">
            Converting <span className="font-semibold">{file.name}</span> from{' '}
            <span className="font-semibold uppercase">{currentFormat}</span> to{' '}
            <span className="font-semibold uppercase">{targetFormat}</span>
          </p>
        </div>
      )}
    </div>
  );
} 