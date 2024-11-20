'use client';

import { useState, useEffect } from 'react';
import { FileDropzone } from './FileDropzone';
import { ConversionOptions } from './ConversionOptions';
import { ProgressBar } from './ProgressBar';
import { FileHistory } from '../FileHistory/FileHistory';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConversionRecord, ConversionStats } from '@/types';
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from '@/lib/constants';
import { getInitialStats, updateStats } from '@/lib/utils/stats';
import { Stats } from '@/components/Stats/Stats';
import { trackConversion } from '@/lib/utils/stats-service';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { getGlobalStats } from '@/lib/utils/stats-service';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [stats, setStats] = useState<ConversionStats>(getInitialStats());

  const fetchAndUpdateStats = async () => {
    try {
      const globalStats = await getGlobalStats();
      setStats(globalStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Fetch initial stats
    fetchAndUpdateStats();

    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(fetchAndUpdateStats, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleStatsUpdate = async (
    file: File,
    success: boolean,
    conversionTime?: number
  ) => {
    try {
      await trackConversion(
        'unknown',
        'unknown',
        file.type,
        file.size,
        success,
        conversionTime || 0
      );
      const globalStats = await getGlobalStats();
      setStats(globalStats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const handleConversion = async (file: File) => {
    const startTime = Date.now();
    try {
      // Your existing conversion logic here
      
      const endTime = Date.now();
      const conversionTime = (endTime - startTime) / 1000;
      await handleStatsUpdate(file, true, conversionTime);
    } catch (error) {
      await handleStatsUpdate(file, false);
      console.error('Conversion failed:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Your existing form submission logic here
    // When you have the file, call handleConversion(file)
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <Card className="relative border-2 border-green-600 bg-white overflow-hidden">
        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight text-gradient">
                Convert Files
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              quickly and securely - no account required
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FileDropzone
                file={file}
                onFileSelect={setFile}
                accept={Object.values(SUPPORTED_FORMATS).flat().join(',')}
                maxSize={MAX_FILE_SIZE}
              />

              {file && (
                <>
                  <Separator className="my-6 bg-gradient-to-r from-rose-500/20 to-transparent" />
                  <ConversionOptions
                    currentFormat={file.name.split('.').pop()?.toLowerCase() || ''}
                    targetFormat={targetFormat}
                    onFormatChange={setTargetFormat}
                    file={file}
                  />
                </>
              )}

              {progress > 0 && (
                <>
                  <Separator className="my-6 bg-gradient-to-r from-rose-500/20 to-transparent" />
                  <ProgressBar 
                    progress={progress}
                    status={status}
                    error={error}
                  />
                </>
              )}

              <Button
                type="submit"
                disabled={!file || !targetFormat || status === 'processing'}
                className="w-full"
              >
                {status === 'processing' ? 'Converting...' : 'Convert File'}
              </Button>
            </form>
          </CardContent>
        </div>
      </Card>

      {history.length > 0 && (
        <Card className="border-2 border-green-600 bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Conversion History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileHistory records={history} />
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-100">
          <div className="space-y-2 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-10">
              <div className="flex-1 space-y-1 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Global Statistics
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Sitewide
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Overall platform performance and conversion metrics
                </p>
              </div>
              
              <Link
                href="/stats"
                className="group flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-green-100 bg-white hover:bg-green-50 transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start"
              >
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  View Analytics
                </span>
                <span className="text-green-600 transition-transform group-hover:translate-x-1 duration-200">
                  →
                </span>
              </Link>
            </div>
          </div>
          <Stats
            totalConversions={stats.totalConversions}
            totalSize={stats.totalSize}
            averageTime={stats.averageTime}
            conversionRate={stats.conversionRate}
          />
        </div>
      )}
    </div>
  );
}