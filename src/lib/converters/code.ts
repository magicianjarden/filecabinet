import { Converter } from '@/types';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export const codeConverter: Converter = {
  name: 'Code Converter',
  description: 'Convert between code formats',
  inputFormats: ['json', 'xml'],
  outputFormats: ['json', 'xml'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const text = input.toString();
      let data: any;

      // Parse input
      switch (inputFormat.toLowerCase()) {
        case 'json':
          data = JSON.parse(text);
          break;
        case 'xml':
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
          });
          data = parser.parse(text);
          break;
        default:
          throw new Error(`Unsupported input format: ${inputFormat}`);
      }

      // Convert to output format
      let result: string;
      switch (outputFormat.toLowerCase()) {
        case 'json':
          result = JSON.stringify(data, null, 2);
          break;
        case 'xml':
          const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
          });
          result = builder.build(data);
          break;
        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }

      return Buffer.from(result);
    } catch (error) {
      console.error('Code conversion error:', error);
      throw new Error('Failed to convert code format');
    }
  }
}; 