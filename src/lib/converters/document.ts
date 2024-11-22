import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import mammoth from 'mammoth';
import markdownpdf from 'markdown-pdf';
import { promisify } from 'util';
import { Converter } from '@/types';

const markdownToPdfAsync = promisify(markdownpdf) as (input: Buffer | string) => Promise<Buffer>;

export const documentConverter: Converter = {
  name: 'Document Converter',
  description: 'Convert between document formats',
  inputFormats: ['docx', 'txt', 'md'],
  outputFormats: ['pdf', 'txt'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      // DOCX conversions
      if (inputFormat === 'docx') {
        if (outputFormat === 'pdf') {
          const { value: html } = await mammoth.convertToHtml({ buffer: input });
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          page.drawText(html.replace(/<[^>]*>/g, ''), {
            x: 50,
            y: page.getHeight() - 50,
            font,
            size: 12,
            color: rgb(0, 0, 0),
          });
          return Buffer.from(await pdfDoc.save());
        }
        if (outputFormat === 'txt') {
          const { value: text } = await mammoth.extractRawText({ buffer: input });
          return Buffer.from(text);
        }
      }

      // Markdown conversions
      if (inputFormat === 'md') {
        if (outputFormat === 'pdf') {
          return await markdownToPdfAsync(input);
        }
        if (outputFormat === 'txt') {
          return input; // Markdown is already text
        }
      }

      // TXT conversions
      if (inputFormat === 'txt') {
        if (outputFormat === 'pdf') {
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          page.drawText(input.toString(), {
            x: 50,
            y: page.getHeight() - 50,
            font,
            size: 12,
            color: rgb(0, 0, 0),
          });
          return Buffer.from(await pdfDoc.save());
        }
      }

      throw new Error(`Unsupported conversion: ${inputFormat} to ${outputFormat}`);
    } catch (error) {
      console.error('Document conversion error:', error);
      throw new Error('Failed to convert document');
    }
  }
}; 