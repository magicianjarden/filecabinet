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
  allPages?: boolean;
} 