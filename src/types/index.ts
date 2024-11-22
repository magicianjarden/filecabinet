// Export any other types you have
export interface ConversionRecord {
    fileName: string;
    fileSize: number;
    targetFormat: string;
    status: 'completed' | 'failed';
    timestamp: string;
    downloadUrl?: string;
    error?: string;
  }
  
export interface ConversionStats {
  totalConversions: number;
  todayConversions: number;
  totalStorage: number;
  successfulConversions: number;
  failedConversions: number;
  averageTime: number;
  conversionRate: number;
  conversionTimes: number[];
  byFormat: Record<string, number>;
  bySize: Record<string, number>;
  hourlyActivity: Record<string, number>;
  successRate: number;
  lastUpdated: string;
  popularConversions: Array<{
    from: string;
    to: string;
    count: number;
  }>;
}
  
// Consolidating all converter-related types
export interface Converter {
  name: string;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
  convert(input: Buffer, inputFormat: string, outputFormat: string, options?: ConversionOptions): Promise<Buffer>;
}

export interface ConversionOptions {
  quality?: number;
  resolution?: string;
  compress?: boolean;
}

// API response types
export interface ConversionResponse {
  url: string;
  expiresAt: Date;
}

export interface ProgressResponse {
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

// From formats.ts
export type ArchiveInputFormat = 'zip';
export type ArchiveOutputFormat = 'zip';

export type CodeInputFormat = 'json' | 'yaml' | 'yml' | 'xml' | 'csv';
export type CodeOutputFormat = 'json' | 'yaml' | 'xml' | 'csv';

export type DocumentInputFormat = 'pdf' | 'docx' | 'txt' | 'rtf' | 'md';
export type DocumentOutputFormat = 'pdf' | 'docx' | 'txt';

export type ImageInputFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp';
export type ImageOutputFormat = 'jpg' | 'png' | 'webp';

export type MediaInputFormat = 'mp4' | 'mov' | 'avi' | 'mp3' | 'wav';
export type MediaOutputFormat = 'mp4' | 'mp3';

export type FileCategory = 
  | 'documents'
  | 'images'
  | 'media'
  | 'archives'
  | 'presentations'
  | 'spreadsheets'
  | 'ebooks'
  | 'code';

export interface FormatConfig {
  input: string[];
  output: string[];
}

export interface SupportedFormats {
  archives: FormatConfig;
  code: FormatConfig;
  documents: FormatConfig;
  images: FormatConfig;
  media: FormatConfig;
}
  
export type ConversionStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  
export interface ConversionProgress {
  [fileName: string]: {
    progress: number;
    status: ConversionStatus;
    error: string | null;
  }
}
  