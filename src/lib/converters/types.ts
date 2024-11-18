export interface ConversionResult {
  success: boolean;
  data?: Buffer;
  error?: string;
  mimeType?: string;
}

export interface ConversionOptions {
  quality?: number;
  resolution?: string;
  compress?: boolean;
}

export type ConversionError = Error & {
  code?: number;
  message: string;
} 