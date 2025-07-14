import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import mammoth from 'mammoth';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';
import { promisify } from 'util';
import { Converter } from '@/types';
import { fromPath } from 'pdf2pic';
import PDFParser from 'pdf2json';
import convertMdToHtml from 'convert-md-to-html';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { execFile } from 'child_process';
const execFileAsync = promisify(execFile);

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
  inputFormats: ['docx', 'txt', 'md', 'pdf', 'html', 'doc', 'rtf', 'odt', 'pages'],
  outputFormats: ['pdf', 'txt', 'html', 'png', 'json', 'docx', 'doc', 'rtf', 'odt'],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      // Markdown to HTML
      if (inputFormat === 'md' && outputFormat === 'html') {
        const md = new MarkdownIt();
        const html = md.render(input.toString());
        return Buffer.from(html);
      }

      // Markdown to PDF (md -> html -> pdf)
      if (inputFormat === 'md' && outputFormat === 'pdf') {
        const md = new MarkdownIt();
        const html = md.render(input.toString());
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();
        return Buffer.from(pdfBuffer);
      }

      // HTML to PDF using Puppeteer
      if (inputFormat === 'html' && outputFormat === 'pdf') {
        const html = input.toString();
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();
        return Buffer.from(pdfBuffer);
      }

      // DOCX to PDF using LibreOffice CLI
      if (inputFormat === 'docx' && outputFormat === 'pdf') {
        const tmp = require('tmp');
        const fs = require('fs');
        const path = require('path');
        const inputTmp = tmp.tmpNameSync({ postfix: `.docx` });
        const outputDir = tmp.dirSync().name;
        fs.writeFileSync(inputTmp, input);
        const outputFile = path.join(outputDir, `converted.pdf`);
        try {
          await execFileAsync('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', outputDir, inputTmp]);
        } catch (e) {
          throw new Error('LibreOffice (soffice) is not available on this server.');
        }
        const result = fs.readFileSync(outputFile);
        fs.unlinkSync(inputTmp);
        fs.unlinkSync(outputFile);
        return result;
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

      // New: Use LibreOffice/unoconv for DOC, RTF, ODT, PAGES conversions
      const officeFormats = ['doc', 'rtf', 'odt', 'pages'];
      if (officeFormats.includes(inputFormat) && ['pdf', 'txt', 'docx', 'doc', 'rtf', 'odt'].includes(outputFormat)) {
        // Write input to temp file
        const tmp = require('tmp');
        const fs = require('fs');
        const path = require('path');
        const inputTmp = tmp.tmpNameSync({ postfix: `.${inputFormat}` });
        const outputDir = tmp.dirSync().name;
        fs.writeFileSync(inputTmp, input);
        // Use unoconv or soffice (LibreOffice)
        let outputFile = path.join(outputDir, `converted.${outputFormat}`);
        try {
          await execFileAsync('unoconv', ['-f', outputFormat, '-o', outputFile, inputTmp]);
        } catch (e) {
          // Try soffice as fallback
          await execFileAsync('soffice', ['--headless', '--convert-to', outputFormat, '--outdir', outputDir, inputTmp]);
        }
        const result = fs.readFileSync(outputFile);
        fs.unlinkSync(inputTmp);
        fs.unlinkSync(outputFile);
        return result;
      }

      throw new Error(`Unsupported conversion: ${inputFormat} to ${outputFormat}`);
    } catch (error) {
      console.error('Document conversion error:', error);
      throw new Error('Failed to convert document');
    }
  }
}; 