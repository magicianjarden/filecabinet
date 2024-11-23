'use client';

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FORMAT_MAPPING } from "@/lib/constants/formats";

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
  const options = FORMAT_MAPPING[currentFormat.toLowerCase()] || [];

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