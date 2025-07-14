'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { settings } from '@/config/settings';

interface ConversionOptionsProps {
  currentFormat: string;
  targetFormat: string;
  onFormatChange: (format: string) => void;
  file: File;
}

export function ConversionOptions({ 
  currentFormat, 
  targetFormat, 
  onFormatChange 
}: ConversionOptionsProps) {
  // Find the category that contains the currentFormat as input
  const category = Object.values(settings.supportedFormats).find(cfg => cfg.input.includes(currentFormat.toLowerCase()));
  // Only show output formats that are actually implemented for this input
  const options = category ? category.output.filter(outputFmt => outputFmt !== currentFormat.toLowerCase()) : [];

  return (
    <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-2">
      {options.length > 0 ? (
        options.map((format) => (
          <Button
            key={format}
            variant={targetFormat === format ? "default" : "outline"}
            size="sm"
            onClick={() => onFormatChange(format)}
            className={cn(
              "text-xs font-medium shrink-0",
              targetFormat === format && "bg-green-600 hover:bg-green-700",
            )}
          >
            {format.toUpperCase()}
          </Button>
        ))
      ) : (
        <p>No conversion options available for this file format.</p>
      )}
    </div>
  );
} 