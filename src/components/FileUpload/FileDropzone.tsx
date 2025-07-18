'use client';

import { useRef, useState, useCallback } from 'react';
import { formatFileSize } from '@/lib/utils/format';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useDropzone } from 'react-dropzone';
import { getMimeType } from '@/lib/utils/mime-types';

interface FileDropzoneProps {
  files: File[];
  onFilesSelect: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
}

export function FileDropzone({ 
  files, 
  onFilesSelect, 
  accept, 
  maxSize = 1 * 1024 * 1024 * 1024, 
  multiple = true 
}: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelect(acceptedFiles);
  }, [onFilesSelect]);

  const acceptTypes = accept ? 
    accept.split(',').reduce((acc, curr) => ({
      ...acc,
      [getMimeType(curr)]: []
    }), {}) : 
    undefined;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptTypes,
    maxSize,
    multiple
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center hover:border-green-500 transition-colors",
        isDragActive ? "border-green-500 bg-green-50" : "border-slate-200"
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          <Upload className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <p className="text-sm font-medium">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {multiple ? 'Upload multiple files' : 'Upload a file'} up to {formatFileSize(maxSize || 1 * 1024 * 1024 * 1024)}
          </p>
        </div>
        {files.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {files.length} {files.length === 1 ? 'file' : 'files'} selected
          </div>
        )}
      </div>
    </div>
  );
} 