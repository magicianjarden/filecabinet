import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export const codeConverter = async (
  file: File,
  fromFormat: string,
  toFormat: string
): Promise<Blob> => {
  const text = await file.text();
  let data: any;

  // Parse input
  switch (fromFormat.toLowerCase()) {
    case 'json':
      data = JSON.parse(text);
      break;
    case 'yaml':
    case 'yml':
      throw new Error('YAML conversion not supported yet');
    case 'xml':
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
      });
      data = parser.parse(text);
      break;
    default:
      throw new Error(`Unsupported input format: ${fromFormat}`);
  }

  // Convert to output format
  let result: string;
  switch (toFormat.toLowerCase()) {
    case 'json':
      result = JSON.stringify(data, null, 2);
      break;
    case 'yaml':
    case 'yml':
      throw new Error('YAML conversion not supported yet');
    case 'xml':
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
      });
      result = builder.build(data);
      break;
    default:
      throw new Error(`Unsupported output format: ${toFormat}`);
  }

  return new Blob([result], { 
    type: toFormat === 'json' ? 'application/json' : 'application/xml' 
  });
}; 