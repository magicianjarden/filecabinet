declare module 'fast-xml-parser' {
  export class XMLParser {
    constructor(options?: any);
    parse(xml: string): any;
  }

  export class XMLBuilder {
    constructor(options?: any);
    build(obj: any): string;
  }
} 