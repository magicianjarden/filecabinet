export interface ConversionRecord {
  fileName: string;
  fileSize: number;
  inputFormat: string;
  outputFormat: string;
  timestamp: number;
  status: 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
}

export interface ConversionStats {
  totalConversions: number;
  todayConversions: number;
  totalStorage: number;
  successfulConversions: number;
} 