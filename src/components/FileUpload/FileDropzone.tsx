'use client';

import { useRef, useState } from 'react';
import { formatFileSize } from '@/lib/utils/format';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept: string;
  maxSize: number;
}

export function FileDropzone({ file, onFileSelect, accept, maxSize }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${formatFileSize(maxSize)}`);
      return;
    }
    onFileSelect(file);
  };

  return (
    <Card
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-200 z-20",
        "border-2 border-dashed p-8 text-center min-h-[200px] flex items-center justify-center",
        "hover:scale-[0.99] active:scale-[0.97]",
        isDragActive 
          ? "border-green-600 bg-green-50 border-solid" 
          : "border-green-300 hover:border-green-600 hover:bg-green-50",
        file ? "bg-white" : ""
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
      
      {file ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-green-50 rounded-xl border-2 border-green-200">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{file.name}</p>
            <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            variant="outline"
            className="mt-2"
          >
            <X className="w-4 h-4 mr-2" />
            Remove file
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-rose-50 rounded-xl">
              <Upload className="w-12 h-12 text-rose-500" />
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              or click to select from your computer
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
} 