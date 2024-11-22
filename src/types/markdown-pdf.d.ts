declare module 'markdown-pdf' {
  interface MarkdownPdfOptions {
    cssPath?: string;
    paperFormat?: 'A3' | 'A4' | 'A5' | 'Legal' | 'Letter' | 'Tabloid';
    paperOrientation?: 'portrait' | 'landscape';
    paperBorder?: string;
    renderDelay?: number;
    runningsPath?: string;
    remarkable?: {
      html: boolean;
      breaks: boolean;
      plugins?: any[];
      syntax?: any[];
    };
  }

  interface MarkdownPdf {
    (input: Buffer | string, options?: MarkdownPdfOptions): Promise<Buffer>;
    (input: Buffer | string, callback: (err: Error | null, output: Buffer) => void): void;
    (input: Buffer | string, options: MarkdownPdfOptions, callback: (err: Error | null, output: Buffer) => void): void;
  }

  const markdownpdf: MarkdownPdf;
  export = markdownpdf;
} 