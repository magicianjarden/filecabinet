'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileDropzone } from './FileDropzone';
import { ConversionOptions } from './ConversionOptions';
import { FileHistory } from '../FileHistory/FileHistory';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ConversionRecord } from '@/types';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { X, ArrowRight, FileText, Clock, HardDrive, BarChart } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { kv } from '@vercel/kv';
import { ConversionStats } from '@/types';
import { getFileCategory } from '@/lib/utils';
import Link from 'next/link';
import { getMimeType } from '@/lib/utils/mime-types';
import { ProgressBar } from './ProgressBar';
import { ConversionStatus } from "@/types";
import { useStats } from '@/hooks/useStats';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

interface FileWithStatus {
  file: File;
  targetFormat: string;
  status: 'pending' | 'ready' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface ConversionProgress {
  [fileName: string]: {
    progress: number;
    status: ConversionStatus;
    error: string | null;
  }
}

const getUniqueFormats = (formatMapping: Record<string, string[]>) => {
  const formats = new Set<string>();
  
  // Add all source formats
  Object.keys(formatMapping).forEach(format => formats.add(format));
  
  // Add all target formats
  Object.values(formatMapping).flat().forEach(format => formats.add(format));
  
  return Array.from(formats);
};

export function FileUpload() {
  const [fileQueue, setFileQueue] = useState<FileWithStatus[]>([]);
  const [sessionHistory, setSessionHistory] = useState<ConversionRecord[]>([]);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress>({});
  const [stats, setStats] = useState<ConversionStats>({
    totalConversions: 0,
    todayConversions: 0,
    totalStorage: 0,
    successfulConversions: 0,
    failedConversions: 0,
    averageTime: 0,
    conversionRate: 0,
    conversionTimes: [],
    byFormat: {},
    bySize: {},
    hourlyActivity: {},
    successRate: 0,
    lastUpdated: new Date().toISOString(),
    popularConversions: []
  });
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { incrementConversions } = useStats();

  // Fetch both stats and history on mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch stats with error handling
        const response = await fetch('/api/stats');
        if (!response.ok) {
          console.warn('Stats not available:', await response.text());
          // Initialize with empty stats instead of throwing
          setStats({
            totalConversions: 0,
            todayConversions: 0,
            totalStorage: 0,
            successfulConversions: 0,
            failedConversions: 0,
            averageTime: 0,
            conversionRate: 0,
            conversionTimes: [],
            byFormat: {},
            bySize: {},
            hourlyActivity: {},
            successRate: 0,
            lastUpdated: new Date().toISOString(),
            popularConversions: []
          });
        } else {
          const statsData = await response.json();
          setStats(statsData);
        }

        // Fetch history with error handling
        const historyResponse = await fetch('/api/conversions/history');
        if (!historyResponse.ok) {
          console.warn('History not available:', await historyResponse.text());
          setSessionHistory([]);
        } else {
          const historyData = await historyResponse.json();
          setSessionHistory(historyData);
        }
      } catch (error) {
        console.warn('Failed to fetch initial data:', error);
      }
    }
    fetchInitialData();
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    const newFileQueue = newFiles.map(file => ({
      file,
      targetFormat: '',
      status: 'pending' as const,
    }));
    setFileQueue(prev => [...prev, ...newFileQueue]);
  };

  const handleFormatChange = (fileName: string, format: string) => {
    setFileQueue(prev => prev.map(item => 
      item.file.name === fileName 
        ? { ...item, targetFormat: format, status: 'ready' }
        : item
    ));
  };

  const getFileCategory = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mime = getMimeType(ext);
    
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/') || mime.startsWith('audio/')) return 'media';
    if (mime.startsWith('application/pdf') || mime.startsWith('application/msword') || mime === 'text/plain') return 'document';
    if (mime.startsWith('application/zip') || mime.startsWith('application/x-')) return 'archive';
    return 'document'; // default fallback
  };

  const handleConvert = async () => {
    const readyFiles = fileQueue.filter(item => item.status === 'ready');
    const pendingFiles = fileQueue.filter(item => item.status === 'pending');
    setFileQueue(pendingFiles);

    for (const item of readyFiles) {
      const startTime = Date.now();
      
      // Add to session history immediately with 'processing' status
      const initialRecord: ConversionRecord = {
        fileName: item.file.name,
        fileSize: item.file.size,
        targetFormat: item.targetFormat,
        status: 'processing',
        timestamp: new Date().toISOString()
      };
      
      setSessionHistory(prev => [initialRecord, ...prev]);

      try {
        // Add file back to queue with processing status
        setFileQueue(prev => [...prev, { ...item, status: 'processing' }]);
        
        // Initialize progress
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 0,
            status: 'processing',
            error: null
          }
        }));

        // Create FFmpeg instance
        const ffmpeg = new FFmpeg();
        
        // Load FFmpeg
        await ffmpeg.load({
          coreURL: '/ffmpeg/ffmpeg-core.js',
          wasmURL: '/ffmpeg/ffmpeg-core.wasm',
        });

        // Update progress to 30%
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            ...prev[item.file.name],
            progress: 30
          }
        }));

        // Write input file
        const inputFileName = `input.${item.file.name.split('.').pop()}`;
        const outputFileName = `output.${item.targetFormat}`;
        await ffmpeg.writeFile(inputFileName, await fetchFile(item.file));

        // Update progress to 50%
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            ...prev[item.file.name],
            progress: 50
          }
        }));

        // Run conversion
        await ffmpeg.exec(['-i', inputFileName, outputFileName]);

        // Update progress to 70%
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            ...prev[item.file.name],
            progress: 70
          }
        }));

        // Read the output file
        const data = await ffmpeg.readFile(outputFileName);
        const uint8Array = data as Uint8Array;
        const blob = new Blob([uint8Array], { type: `audio/${item.targetFormat}` });
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.file.name.split('.')[0]}.${item.targetFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Clean up
        await ffmpeg.deleteFile(inputFileName);
        await ffmpeg.deleteFile(outputFileName);

        // Update progress to complete
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 100,
            status: 'completed',
            error: null
          }
        }));

        // Update file queue status
        setFileQueue(prev => prev.map(f => 
          f.file.name === item.file.name 
            ? { ...f, status: 'completed' }
            : f
        ));

        await incrementConversions();

        // Update the existing record instead of creating a new one
        setSessionHistory(prev => prev.map(record => 
          record.fileName === item.file.name 
            ? {
                ...record,
                status: 'completed',
                downloadUrl: url
              }
            : record
        ));

      } catch (err) {
        console.error('Conversion error:', err);
        
        // Update progress with error
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 0,
            status: 'failed',
            error: err instanceof Error ? err.message : 'Failed to convert file'
          }
        }));

        // Update file queue status
        setFileQueue(prev => prev.map(f => 
          f.file.name === item.file.name 
            ? { ...f, status: 'failed', error: err instanceof Error ? err.message : 'Failed to convert file' }
            : f
        ));

        // Update the existing record with error status
        setSessionHistory(prev => prev.map(record => 
          record.fileName === item.file.name 
            ? {
                ...record,
                status: 'failed',
                error: err instanceof Error ? err.message : 'Failed to convert file'
              }
            : record
        ));
      }
    }
  };

  const updateStats = async (fileSize: number) => {
    try {
      // Update stats via API instead of direct KV access
      const response = await fetch('/api/stats/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileSize }),
      });

      if (!response.ok) throw new Error('Failed to update stats');
      
      const newStats = await response.json();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  const updateProgress = useCallback((
    fileName: string, 
    updates: Partial<{
      progress: number;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      error: string | null;
    }>
  ) => {
    setConversionProgress(prev => ({
      ...prev,
      [fileName]: {
        ...prev[fileName],
        ...updates
      }
    }));
  }, []);

  const getFileProgress = (fileName: string) => {
    return conversionProgress[fileName]?.progress || 0;
  };

  const getFileStatus = (fileName: string): ConversionStatus => {
    return conversionProgress[fileName]?.status || 'idle';
  };

  const getFileError = (fileName: string) => {
    return conversionProgress[fileName]?.error || null;
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <Card className="border-2 border-green-600/20 hover:border-green-600/40 transition-colors bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Convert Files
          </CardTitle>
          <p className="text-sm text-slate-600">
            quickly and securely - no account required
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <FileDropzone
              files={fileQueue.map(f => f.file)}
              onFilesSelect={handleFilesSelected}
              accept={Object.values(SUPPORTED_FORMATS).flat().join(',')}
              maxSize={MAX_FILE_SIZE}
              multiple={true}
            />

            {fileQueue.length > 0 && (
              <>
                <Separator className="my-6 bg-gradient-to-r from-green-600/20 to-transparent" />
                
                {Object.entries(
                  fileQueue.reduce((acc, item) => {
                    const category = getFileCategory(item.file.name);
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(item);
                    return acc;
                  }, {} as Record<string, typeof fileQueue>)
                ).map(([category, files]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-slate-900">
                          {category}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {files.length}
                        </Badge>
                      </div>
                      
                      {/* More subtle batch action */}
                      {files.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const commonFormat = files
                              .filter(f => f.targetFormat)
                              .reduce((acc, curr) => {
                                acc[curr.targetFormat] = (acc[curr.targetFormat] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>);

                            const bestFormat = Object.entries(commonFormat)
                              .sort(([,a], [,b]) => b - a)[0]?.[0];

                            if (bestFormat) {
                              setFileQueue(prev => prev.map(item => 
                                files.includes(item) && !item.targetFormat
                                  ? { ...item, targetFormat: bestFormat, status: 'ready' }
                                  : item
                              ));
                            }
                          }}
                          className="text-xs text-slate-500 hover:text-slate-900"
                        >
                          Match formats
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {files.map(({ file, targetFormat, status, error }) => (
                        <div 
                          key={file.name} 
                          className={cn(
                            "flex flex-col gap-4 p-3 rounded-lg border transition-colors group",
                            status === 'pending' && "bg-white/50 border-slate-200",
                            status === 'ready' && "bg-green-50/50 border-green-200",
                            status === 'processing' && "bg-blue-50/50 border-blue-200",
                            status === 'failed' && "bg-red-50/50 border-red-200"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate">{file.name}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setFileQueue(prev => prev.filter(item => item.file.name !== file.name));
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity -my-2 h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remove file</span>
                                </Button>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-slate-500">
                                  {(file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                                {error && (
                                  <p className="text-xs text-red-500">{error}</p>
                                )}
                              </div>
                            </div>
                            <ConversionOptions
                              currentFormat={file.name.split('.').pop()?.toLowerCase() || ''}
                              targetFormat={targetFormat}
                              onFormatChange={(format) => handleFormatChange(file.name, format)}
                              file={file}
                            />
                          </div>

                          {(status === 'processing' || status === 'completed' || status === 'failed') && (
                            <ProgressBar
                              progress={getFileProgress(file.name)}
                              status={getFileStatus(file.name)}
                              error={getFileError(file.name)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {fileQueue.filter(f => f.status === 'ready').length} ready
                    </Badge>
                    {fileQueue.filter(f => f.status === 'pending').length > 0 && (
                      <Badge variant="outline" className="text-xs text-orange-500 border-orange-200 bg-orange-50">
                        {fileQueue.filter(f => f.status === 'pending').length} pending
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFileQueue([])}
                      className="text-xs text-slate-500 hover:text-red-600"
                    >
                      Clear Queue
                    </Button>
                  </div>
                  <Button
                    onClick={handleConvert}
                    disabled={!fileQueue.some(f => f.status === 'ready')}
                    className={cn(
                      "bg-green-600 hover:bg-green-700 text-white",
                      "disabled:bg-slate-200 disabled:text-slate-500"
                    )}
                  >
                    Convert {fileQueue.filter(f => f.status === 'ready').length} Files
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-green-600/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionHistory.length}</div>
            <p className="text-xs text-muted-foreground">
              +{sessionHistory.filter(h => 
                new Date(h.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
              ).length} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-600/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Ready</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fileQueue.filter(f => f.status === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {fileQueue.length} in queue
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-600/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Saved</CardTitle>
            <HardDrive className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(sessionHistory.reduce((acc, curr) => acc + curr.fileSize, 0) / (1024 * 1024)).toFixed(1)}MB
            </div>
            <p className="text-xs text-muted-foreground">
              across all conversions
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-600/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionHistory.length > 0 
                ? Math.round((sessionHistory.filter(h => h.status === 'completed').length / sessionHistory.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {sessionHistory.filter(h => h.status === 'completed').length} successful
            </p>
          </CardContent>
        </Card>
      </div>

      <Link 
        href="/stats" 
        className="col-span-full flex justify-end mt-4"
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-700 transition-colors gap-2 text-sm font-normal"
        >
          <BarChart className="h-4 w-4" />
          View Statistics
        </Button>
      </Link>

      {sessionHistory.length > 0 && (
        <Card className="border border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Recent Conversions
              </CardTitle>
              <Badge 
                variant="secondary" 
                className="bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {sessionHistory.length} {sessionHistory.length === 1 ? 'file' : 'files'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Your conversion history for this session
            </p>
          </CardHeader>
          <CardContent>
            <FileHistory 
              records={sessionHistory}
              onDownload={(record) => {
                const a = document.createElement('a');
                a.href = record.downloadUrl || '';
                a.download = `${record.fileName.split('.')[0]}.${record.targetFormat}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}