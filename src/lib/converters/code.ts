import { Converter } from '@/types';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import YAML from 'yaml';
import TOML from '@iarna/toml';
import { transform } from '@swc/core';
import * as sass from 'sass';
import less from 'less';
import { settings } from '@/config/settings';

export const codeConverter: Converter = {
  name: 'Code Converter',
  description: 'Convert between code formats',
  inputFormats: [...settings.supportedFormats.code.input],
  outputFormats: [...settings.supportedFormats.code.output],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      const text = input.toString();
      let data: any;

      // Handle TypeScript/JavaScript conversions
      if (['ts', 'tsx', 'jsx'].includes(inputFormat) && outputFormat === 'js') {
        const result = await transform(text, {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: inputFormat === 'tsx' || inputFormat === 'jsx',
              decorators: true,
            },
            target: 'es2022',
            transform: {
              react: {
                runtime: 'automatic'
              }
            }
          },
        });
        return Buffer.from(result.code);
      }

      // Handle CSS preprocessors
      if (['scss', 'less'].includes(inputFormat) && outputFormat === 'css') {
        if (inputFormat === 'scss') {
          const result = sass.compileString(text);
          return Buffer.from(result.css);
        }
        if (inputFormat === 'less') {
          const result = await less.render(text);
          return Buffer.from(result.css);
        }
      }

      // Existing data format conversions
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
        case 'yaml':
          data = YAML.parse(text);
          break;
        case 'toml':
          data = TOML.parse(text);
          break;
        default:
          throw new Error(`Unsupported input format: ${inputFormat}`);
      }

      // Convert to output format
      switch (outputFormat.toLowerCase()) {
        case 'json':
          return Buffer.from(JSON.stringify(data, null, 2));
        case 'xml':
          const builder = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
          });
          return Buffer.from(builder.build(data));
        case 'yaml':
          return Buffer.from(YAML.stringify(data));
        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }
    } catch (error) {
      console.error('Code conversion error:', error);
      throw new Error('Failed to convert code format');
    }
  }
}; 