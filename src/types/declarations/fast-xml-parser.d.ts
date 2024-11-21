declare module 'fast-xml-parser' {
  export class XMLParser {
    constructor(options?: {
      ignoreAttributes?: boolean;
      attributeNamePrefix?: string;
      // Add other options as needed
    });
    parse(xml: string): any;
  }

  export class XMLBuilder {
    constructor(options?: {
      ignoreAttributes?: boolean;
      attributeNamePrefix?: string;
      // Add other options as needed
    });
    build(obj: any): string;
  }
} 