export interface Converter {
  name: string;
  description: string;
  inputFormats: string[];
  outputFormats: string[];
  convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer>;
} 