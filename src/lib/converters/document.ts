import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import mammoth from 'mammoth';
import markdownpdf from 'markdown-pdf';
import { promisify } from 'util';
import { Converter } from '@/types';
import { fromPath } from 'pdf2pic';
import PDFParser from 'pdf2json';
import convertMdToHtml from 'convert-md-to-html';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import os from 'os';

type PDFParserOutput = {
  Pages: Array<{
    Texts: Array<{ 
      R: Array<{ T: string }> 
    }>;
  }>;
};

export const documentConverter: Converter = {
  name: 'Document Converter',
  description: 'Convert between document formats',
  inputFormats: ['docx', 'txt', 'md', 'pdf', 'html'],
  outputFormats: ['pdf', 'txt', 'html', 'png', 'json'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      if (inputFormat === 'pdf') {
        if (outputFormat === 'png') {
          const tempPath = join(os.tmpdir(), 'temp.pdf');
          const outputPath = join(os.tmpdir(), 'output.png');
          writeFileSync(tempPath, input);
          
          const options = {
            density: 100,
            saveFilename: "output",
            savePath: os.tmpdir(),
            format: "png",
            width: 800
          };
          
          const convert = fromPath(tempPath, options);
          await convert(1);
          
          // Read the generated PNG file
          const pngBuffer = readFileSync(outputPath);
          
          // Cleanup temp files
          unlinkSync(tempPath);
          unlinkSync(outputPath);
          
          return pngBuffer;
        }
        
        if (outputFormat === 'json') {
          return new Promise<Buffer>((resolve, reject) => {
            const pdfParser = new PDFParser();
            
            pdfParser.on("pdfParser_dataReady", (pdfData: PDFParserOutput) => {
              try {
                const jsonString = JSON.stringify(pdfData);
                if (typeof jsonString !== 'string') {
                  throw new Error('Failed to stringify PDF data');
                }
                resolve(Buffer.from(jsonString, 'utf-8'));
              } catch (err) {
                reject(new Error('Failed to process PDF data'));
              }
            });
            
            pdfParser.on("pdfParser_dataError", (errMsg: { parserError: Error }) => {
              reject(new Error(`PDF parsing failed: ${errMsg.parserError.message}`));
            });
            
            pdfParser.parseBuffer(input);
          });
        }
      }

      // Handle Markdown conversions
      if (inputFormat === 'md') {
        if (outputFormat === 'html') {
          const html = convertMdToHtml(input.toString());
          return Buffer.from(html);
        }
      }

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
        if (outputFormat === 'txt') {
          return Buffer.from(input); // Markdown is already text
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