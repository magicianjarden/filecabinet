import yaml from 'js-yaml';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import Papa from 'papaparse';

import type { CodeInputFormat, CodeOutputFormat } from '@/types/formats';

export async function convertCode(
  buffer: Buffer,
  sourceFormat: CodeInputFormat,
  targetFormat: CodeOutputFormat
): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  try {
    const content = buffer.toString('utf-8');
    let result: string;

    switch(`${sourceFormat}-${targetFormat}`) {
      case 'json-yaml':
        result = yaml.dump(JSON.parse(content));
        break;
      
      case 'yaml-json':
        result = JSON.stringify(yaml.load(content), null, 2);
        break;
      
      case 'xml-json':
        const parser = new XMLParser();
        result = JSON.stringify(parser.parse(content), null, 2);
        break;
      
      case 'json-xml':
        const builder = new XMLBuilder();
        result = builder.build(JSON.parse(content));
        break;
      
      case 'csv-json':
        result = JSON.stringify(
          Papa.parse(content, { header: true }).data,
          null,
          2
        );
        break;
      
      case 'json-csv':
        result = Papa.unparse(JSON.parse(content));
        break;
      
      default:
        return { success: false, error: 'Unsupported conversion' };
    }

    return {
      success: true,
      data: Buffer.from(result)
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    };
  }
} 