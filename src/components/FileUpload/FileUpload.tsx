'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { formatFileSize, getFileExtension } from '@/lib/utils/conversion';
import { setTempFile } from '@/lib/utils/utils';
import { useRouter } from 'next/navigation';

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

const getFileProgress = (fileName: string, conversionProgress: ConversionProgress): number => {
  return conversionProgress[fileName]?.progress || 0;
};

const getFileStatus = (fileName: string, conversionProgress: ConversionProgress): ConversionStatus => {
  return conversionProgress[fileName]?.status || 'pending';
};

const getFileError = (fileName: string, conversionProgress: ConversionProgress): string | null => {
  return conversionProgress[fileName]?.error || null;
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
  const router = useRouter();

  // Add a ref to track URLs that need cleanup
  const objectUrls = useRef<string[]>([]);

  // Add cleanup function using useEffect
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      objectUrls.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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

  const handleFormatChange = useCallback((format: string, index: number) => {
    setFileQueue(prev => prev.map((item, i) => 
      i === index ? { ...item, targetFormat: format } : item
    ));
  }, []);

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
    const filesToConvert = fileQueue.filter(item => 
      item.targetFormat && 
      item.targetFormat !== item.file.name.split('.').pop()
    );

    for (const item of filesToConvert) {
      try {
        // Update status to processing
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 0,
            status: 'processing',
            error: null
          }
        }));

        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('inputFormat', item.file.name.split('.').pop() || '');
        formData.append('outputFormat', item.targetFormat);

        const category = getFileCategory(item.file.name);
        const response = await fetch(`/api/convert/${category}`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Conversion failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Create conversion record
        const conversionRecord: ConversionRecord = {
          fileName: item.file.name,
          fileSize: item.file.size,
          timestamp: new Date().toISOString(),
          status: 'completed',
          targetFormat: item.targetFormat,
          downloadUrl: url
        };

        // Update session history
        setSessionHistory(prev => [conversionRecord, ...prev]);

        // Update conversion progress
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 100,
            status: 'completed',
            error: null
          }
        }));

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.file.name.split('.')[0]}.${item.targetFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Update stats
        await incrementConversions();

      } catch (error) {
        console.error('Conversion error:', error);
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 0,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Conversion failed'
          }
        }));
      }
    }

    // Remove converted files from queue
    setFileQueue(prev => prev.filter(item => 
      !filesToConvert.some(f => f.file.name === item.file.name)
    ));
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

  // Add clear history function
  const clearHistory = useCallback(() => {
    // Cleanup existing URLs
    sessionHistory.forEach(record => {
      if (record.downloadUrl) {
        URL.revokeObjectURL(record.downloadUrl);
      }
    });
    objectUrls.current = []; // Reset tracked URLs
    setSessionHistory([]); // Clear history state
  }, [sessionHistory]);

  // Add the removeFile function
  const removeFile = useCallback((index: number) => {
    setFileQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear queue function
  const clearQueue = useCallback(() => {
    setFileQueue([]);
    setConversionProgress({});
  }, []);

  // Check if files can be converted
  const canConvert = useMemo(() => {
    return fileQueue.some(item => 
      item.status === 'ready' && 
      item.targetFormat !== '' && 
      item.targetFormat !== item.file.name.split('.').pop()?.toLowerCase()
    );
  }, [fileQueue]);

  // Convert all files function
  const convertAll = useCallback(async () => {
    const filesToConvert = fileQueue.filter(item => 
      item.status === 'ready' && 
      item.targetFormat !== '' && 
      item.targetFormat !== item.file.name.split('.').pop()?.toLowerCase()
    );

    for (const item of filesToConvert) {
      try {
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 0,
            status: 'processing',
            error: null
          }
        }));

        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('inputFormat', item.file.name.split('.').pop() || '');
        formData.append('outputFormat', item.targetFormat);

        const response = await fetch('/api/convert/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Conversion failed');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 100,
            status: 'completed',
            error: null
          }
        }));

        // Trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.file.name.split('.')[0]}.${item.targetFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

      } catch (error) {
        setConversionProgress(prev => ({
          ...prev,
          [item.file.name]: {
            progress: 0,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Conversion failed'
          }
        }));
      }
    }
  }, [fileQueue]);

  const handleShare = async (record: ConversionRecord) => {
    if (!record.downloadUrl) return;
    try {
      const res = await fetch(record.downloadUrl);
      const blob = await res.blob();
      // Guess MIME type from file extension, fallback to application/octet-stream
      const ext = record.targetFormat || record.fileName.split('.').pop() || '';
      let mime = getMimeType(ext);
      if (!mime || mime === 'application/octet-stream') {
        // Try to use blob.type if available
        mime = blob.type || 'application/octet-stream';
      }
      // Ensure file name has the correct extension
      let baseName = record.fileName.replace(/\.[^.]+$/, '');
      if (!baseName) baseName = 'file';
      const fileName = `${baseName}.${ext}`;
      const file = new File([blob], fileName, { type: mime });
      setTempFile(file);
      router.push('/share');
    } catch (err) {
      console.error('Failed to prepare file for sharing:', err);
      alert('Failed to prepare file for sharing.');
    }
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
                      {files.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex flex-col bg-slate-50 p-4 rounded-lg">
                            {/* File Info Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-slate-600 shrink-0" />
                                  <span className="text-sm font-medium truncate">
                                    {item.file.name}
                                  </span>
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                                  </Badge>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFileQueue(prev => prev.filter((_, i) => i !== index));
                                }}
                                className="shrink-0 h-8 w-8 p-0 self-end sm:self-center"
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove file</span>
                              </Button>
                            </div>

                            {/* Conversion Options Section - Back to being below */}
                            <div className="mt-3 overflow-x-auto">
                              <ConversionOptions
                                currentFormat={item.file.name.split('.').pop() || ''}
                                targetFormat={item.targetFormat}
                                onFormatChange={(format) => handleFormatChange(format, index)}
                                file={item.file}
                              />
                            </div>

                            {/* Progress Section */}
                            {(item.status === 'processing' || item.status === 'completed' || item.status === 'failed') && (
                              <div className="mt-3">
                                <ProgressBar
                                  progress={getFileProgress(item.file.name, conversionProgress)}
                                  status={getFileStatus(item.file.name, conversionProgress)}
                                  error={getFileError(item.file.name, conversionProgress)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFileQueue([]);
                      setConversionProgress({});
                    }}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Clear Queue
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConvert}
                    disabled={!fileQueue.some(item => 
                      item.targetFormat && 
                      item.targetFormat !== item.file.name.split('.').pop()
                    )}
                    className="w-full sm:w-auto order-1 sm:order-2 bg-green-600 hover:bg-green-700"
                  >
                    Convert {fileQueue.length} {fileQueue.length === 1 ? 'File' : 'Files'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-green-600/20">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-sm font-medium">
                Total Conversions
              </CardTitle>
              <Badge 
                variant="secondary" 
                className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 h-4 w-fit"
              >
                Session
              </Badge>
            </div>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionHistory.length}
            </div>
            <p className="text-xs text-muted-foreground">
              +{sessionHistory.filter(h => 
                new Date(h.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
              ).length} today
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-600/20">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-sm font-medium">
                Files Ready
              </CardTitle>
              <Badge 
                variant="secondary" 
                className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 h-4 w-fit"
              >
                Session
              </Badge>
            </div>
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
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-sm font-medium">
                Storage Saved
              </CardTitle>
              <Badge 
                variant="secondary" 
                className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 h-4 w-fit"
              >
                Session
              </Badge>
            </div>
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
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <Badge 
                variant="secondary" 
                className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0 h-4 w-fit"
              >
                Session
              </Badge>
            </div>
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
              onShare={handleShare}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}