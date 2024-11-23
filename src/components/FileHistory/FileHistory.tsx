'use client';

import { formatFileSize } from '@/lib/utils';
import { Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConversionRecord } from '@/types';
import { Badge } from "@/components/ui/badge";

interface FileHistoryProps {
  records: ConversionRecord[];
  onDownload: (record: ConversionRecord) => void;
}

export function FileHistory({ records, onDownload }: FileHistoryProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-slate-50/50">
            <TableHead className="w-[300px]">File Name</TableHead>
            <TableHead className="w-[200px]">Conversion</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow 
              key={`${record.fileName}-${record.timestamp}`}
              className="hover:bg-slate-50/50 group"
            >
              <TableCell className="font-medium">
                {record.fileName}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2 text-sm">
                  <Badge variant="secondary" className="uppercase">
                    {record.fileName.split('.').pop()}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="uppercase">
                    {record.targetFormat}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatFileSize(record.fileSize)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(record.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(record)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download className="h-4 w-4 text-green-600" />
                  <span className="sr-only">Download</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {records.length === 0 && (
        <div className="text-center py-6 text-sm text-muted-foreground">
          No conversion history yet
        </div>
      )}
    </div>
  );
} 