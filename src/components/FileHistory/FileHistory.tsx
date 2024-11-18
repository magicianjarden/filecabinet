'use client';

import { Button } from "@/components/ui/button";
import { FileIcon, ImageIcon, VideoIcon, Download, ArrowRight } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { ConversionRecord } from '@/types';

interface FileHistoryProps {
  records: ConversionRecord[];
}

export function FileHistory({ records }: FileHistoryProps) {
  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex items-center justify-between p-3 bg-green-50 
            border-2 border-green-200 rounded-lg group hover:bg-green-100 
            transition-colors"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {record.type === 'document' && (
                <FileIcon className="w-5 h-5 text-green-600" />
              )}
              {record.type === 'image' && (
                <ImageIcon className="w-5 h-5 text-green-600" />
              )}
              {record.type === 'media' && (
                <VideoIcon className="w-5 h-5 text-green-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {record.originalName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(record.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <div className="flex items-center">
              <span className="text-xs font-medium text-slate-600 uppercase">
                {record.originalFormat}
              </span>
              <ArrowRight className="w-4 h-4 mx-1 text-slate-400" />
              <span className="text-xs font-medium text-green-600 uppercase">
                {record.convertedFormat}
              </span>
            </div>
            
            <a
              href={record.downloadUrl}
              download={record.convertedName}
              className="p-2 text-green-600 hover:text-green-700 
                hover:bg-green-200 rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
} 