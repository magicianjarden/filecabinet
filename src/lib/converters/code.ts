import { Converter } from '@/types/converters';
import { settings } from '@/config/settings';
import yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import Papa from 'papaparse';

export const codeConverter: Converter = {
  name: 'Code Converter',
  description: 'Convert between code formats',
  inputFormats: settings.supportedFormats.code.input,
  outputFormats: settings.supportedFormats.code.output,
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      // Convert input buffer to string
      const inputString = input.toString('utf-8');
      let data: any;

      // Parse input
      switch (inputFormat) {
        case 'json':
          data = JSON.parse(inputString);
          break;
        case 'yaml':
        case 'yml':
          data = yaml.load(inputString);
          break;
        case 'xml':
          const parser = new XMLParser();
          data = parser.parse(inputString);
          break;
        case 'csv':
          data = Papa.parse(inputString, { header: true }).data;
          break;
        default:
          throw new Error(`Unsupported input format: ${inputFormat}`);
      }

      // Convert to output format
      let result: string;
      switch (outputFormat) {
        case 'json':
          result = JSON.stringify(data, null, 2);
          break;
        case 'yaml':
          result = yaml.dump(data);
          break;
        case 'xml':
          const builder = new XMLBuilder({
            format: true,
            ignoreAttributes: false
          });
          result = builder.build(data);
          break;
        case 'csv':
          result = Papa.unparse(data);
          break;
        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }

      return Buffer.from(result, 'utf-8');
    } catch (error) {
      console.error('Code conversion error:', error);
      throw new Error('Failed to convert code');
    }
  }
}; 