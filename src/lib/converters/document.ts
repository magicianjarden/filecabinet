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
import { settings } from '@/config/settings';
import { createCanvas, registerFont } from 'canvas';
import JSZip from 'jszip';
import type { ConversionOptions } from './types';
import hljs from 'highlight.js';
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
  inputFormats: [...settings.supportedFormats.documents.input],
  outputFormats: [...settings.supportedFormats.documents.output],
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string, options?: ConversionOptions): Promise<Buffer> {
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

      // TXT to PNG conversion
      if (inputFormat === 'txt' && outputFormat === 'png') {
        const text = input.toString();
        // Estimate canvas size based on text length
        const lines = text.split('\n');
        const fontSize = 20;
        const lineHeight = fontSize * 1.5;
        const width = Math.max(...lines.map((line: string) => line.length)) * fontSize * 0.6 + 40;
        const height = lines.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        // Background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        // Text
        ctx.fillStyle = '#222';
        ctx.font = `${fontSize}px sans-serif`;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, 20, 30 + i * lineHeight);
        });
        return canvas.toBuffer('image/png');
      }

      // PDF to PNG conversion (multi-page support, returns zip if options.allPages)
      if (inputFormat === 'pdf' && outputFormat === 'png') {
        const { fromBuffer } = require('pdf2pic');
        const converter = fromBuffer(input, {
          density: 150,
          format: 'png',
          width: 1024,
          height: 1448,
          savePath: null
        });
        // If options.allPages, convert all pages and zip them
        if (options && options.allPages) {
          const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
          const pdf = await pdfjsLib.getDocument({ data: input }).promise;
          const numPages = pdf.numPages;
          const zip = new JSZip();
          for (let i = 1; i <= numPages; i++) {
            const result = await converter(i, true);
            zip.file(`page${i}.png`, result.buffer);
          }
          return await zip.generateAsync({ type: 'nodebuffer' });
        }
        // Default: first page only
        const result = await converter(1, true);
        return result.buffer;
      }

      // DOCX to PNG conversion (MVP: extract text, render as PNG)
      if (inputFormat === 'docx' && outputFormat === 'png') {
        const { value: text } = await mammoth.extractRawText({ buffer: input });
        const lines = text.split('\n');
        const fontSize = 20;
        const lineHeight = fontSize * 1.5;
        const width = Math.max(...lines.map((line: string) => line.length)) * fontSize * 0.6 + 40;
        const height = lines.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#222';
        ctx.font = `${fontSize}px sans-serif`;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, 20, 30 + i * lineHeight);
        });
        return canvas.toBuffer('image/png');
      }

      // Markdown to PNG conversion
      if (inputFormat === 'md' && outputFormat === 'png') {
        const md = new MarkdownIt();
        const html = md.render(input.toString());
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(`<body style='margin:0;padding:0;'>${html}</body>`, { waitUntil: 'networkidle0' });
        const pngBuffer = await page.screenshot({ type: 'png', fullPage: true });
        await browser.close();
        return pngBuffer;
      }

      // HTML to PNG conversion
      if (inputFormat === 'html' && outputFormat === 'png') {
        const html = input.toString();
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(`<body style='margin:0;padding:0;'>${html}</body>`, { waitUntil: 'networkidle0' });
        const pngBuffer = await page.screenshot({ type: 'png', fullPage: true });
        await browser.close();
        return pngBuffer;
      }
      // HTML to JPG conversion
      if (inputFormat === 'html' && outputFormat === 'jpg') {
        const html = input.toString();
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(`<body style='margin:0;padding:0;'>${html}</body>`, { waitUntil: 'networkidle0' });
        const jpgBuffer = await page.screenshot({ type: 'jpeg', fullPage: true });
        await browser.close();
        return jpgBuffer;
      }

      // TXT to JPG conversion
      if (inputFormat === 'txt' && outputFormat === 'jpg') {
        const text = input.toString();
        const lines = text.split('\n');
        const fontSize = 20;
        const lineHeight = fontSize * 1.5;
        const width = Math.max(...lines.map((line: string) => line.length)) * fontSize * 0.6 + 40;
        const height = lines.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#222';
        ctx.font = `${fontSize}px sans-serif`;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, 20, 30 + i * lineHeight);
        });
        return canvas.toBuffer('image/jpeg');
      }

      // PDF to JPG conversion (multi-page support, returns zip if options.allPages)
      if (inputFormat === 'pdf' && outputFormat === 'jpg') {
        const { fromBuffer } = require('pdf2pic');
        const converter = fromBuffer(input, {
          density: 150,
          format: 'jpg',
          width: 1024,
          height: 1448,
          savePath: null
        });
        if (options && options.allPages) {
          const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
          const pdf = await pdfjsLib.getDocument({ data: input }).promise;
          const numPages = pdf.numPages;
          const zip = new JSZip();
          for (let i = 1; i <= numPages; i++) {
            const result = await converter(i, true);
            zip.file(`page${i}.jpg`, result.buffer);
          }
          return await zip.generateAsync({ type: 'nodebuffer' });
        }
        const result = await converter(1, true);
        return result.buffer;
      }

      // DOCX to JPG conversion (MVP: extract text, render as JPG)
      if (inputFormat === 'docx' && outputFormat === 'jpg') {
        const { value: text } = await mammoth.extractRawText({ buffer: input });
        const lines = text.split('\n');
        const fontSize = 20;
        const lineHeight = fontSize * 1.5;
        const width = Math.max(...lines.map((line: string) => line.length)) * fontSize * 0.6 + 40;
        const height = lines.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#222';
        ctx.font = `${fontSize}px sans-serif`;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, 20, 30 + i * lineHeight);
        });
        return canvas.toBuffer('image/jpeg');
      }

      // RTF, ODT, PAGES to JPG conversion (MVP: extract text, render as JPG)
      if ((inputFormat === 'rtf' || inputFormat === 'odt' || inputFormat === 'pages') && outputFormat === 'jpg') {
        const tmp = require('tmp');
        const fs = require('fs');
        const path = require('path');
        const inputTmp = tmp.tmpNameSync({ postfix: `.${inputFormat}` });
        const outputDir = tmp.dirSync().name;
        fs.writeFileSync(inputTmp, input);
        const outputFile = path.join(outputDir, `converted.txt`);
        try {
          await execFileAsync('unoconv', ['-f', 'txt', '-o', outputFile, inputTmp]);
        } catch (e) {
          await execFileAsync('soffice', ['--headless', '--convert-to', 'txt', '--outdir', outputDir, inputTmp]);
        }
        const text = fs.readFileSync(outputFile, 'utf-8');
        fs.unlinkSync(inputTmp);
        fs.unlinkSync(outputFile);
        const lines = text.split('\n');
        const fontSize = 20;
        const lineHeight = fontSize * 1.5;
        const width = Math.max(...lines.map((line: string) => line.length)) * fontSize * 0.6 + 40;
        const height = lines.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#222';
        ctx.font = `${fontSize}px sans-serif`;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, 20, 30 + i * lineHeight);
        });
        return canvas.toBuffer('image/jpeg');
      }

      // Markdown to JPG conversion
      if (inputFormat === 'md' && outputFormat === 'jpg') {
        const md = new MarkdownIt();
        const html = md.render(input.toString());
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(`<body style='margin:0;padding:0;'>${html}</body>`, { waitUntil: 'networkidle0' });
        const jpgBuffer = await page.screenshot({ type: 'jpeg', fullPage: true });
        await browser.close();
        return jpgBuffer;
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

      // RTF, ODT, PAGES to PNG conversion (MVP: extract text, render as PNG)
      if ((inputFormat === 'rtf' || inputFormat === 'odt' || inputFormat === 'pages') && outputFormat === 'png') {
        // Try to convert to txt using LibreOffice/unoconv, then render as PNG
        const tmp = require('tmp');
        const fs = require('fs');
        const path = require('path');
        const inputTmp = tmp.tmpNameSync({ postfix: `.${inputFormat}` });
        const outputDir = tmp.dirSync().name;
        fs.writeFileSync(inputTmp, input);
        const outputFile = path.join(outputDir, `converted.txt`);
        try {
          await execFileAsync('unoconv', ['-f', 'txt', '-o', outputFile, inputTmp]);
        } catch (e) {
          await execFileAsync('soffice', ['--headless', '--convert-to', 'txt', '--outdir', outputDir, inputTmp]);
        }
        const text = fs.readFileSync(outputFile, 'utf-8');
        fs.unlinkSync(inputTmp);
        fs.unlinkSync(outputFile);
        const lines = text.split('\n');
        const fontSize = 20;
        const lineHeight = fontSize * 1.5;
        const width = Math.max(...lines.map((line: string) => line.length)) * fontSize * 0.6 + 40;
        const height = lines.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#222';
        ctx.font = `${fontSize}px sans-serif`;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, 20, 30 + i * lineHeight);
        });
        return canvas.toBuffer('image/png');
      }

      // Data formats (JSON, XML, YAML, TOML, CSV) to PNG/JPG
      const dataFormats = ['json', 'xml', 'yaml', 'toml', 'csv'];
      if (dataFormats.includes(inputFormat) && (outputFormat === 'png' || outputFormat === 'jpg')) {
        let text = input.toString();
        try {
          if (inputFormat === 'json') text = JSON.stringify(JSON.parse(text), null, 2);
        } catch {}
        const lines = text.split('\n');
        const fontSize = 18;
        const lineHeight = fontSize * 1.5;
        const width = Math.max(...lines.map((line: string) => line.length)) * fontSize * 0.6 + 40;
        const height = lines.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#222';
        ctx.font = `bold ${fontSize}px monospace`;
        lines.forEach((line: string, i: number) => {
          ctx.fillText(line, 20, 30 + i * lineHeight);
        });
        return (canvas.toBuffer as any)(outputFormat === 'png' ? 'image/png' : 'image/jpeg');
      }

      // CSV to PNG/JPG (table rendering)
      if (inputFormat === 'csv' && (outputFormat === 'png' || outputFormat === 'jpg')) {
        const csv = input.toString();
        const rows = csv.split('\n').map((row: string) => row.split(','));
        const fontSize = 18;
        const cellPadding = 12;
        const lineHeight = fontSize * 1.5;
        const colWidths = rows[0].map((_, colIdx: number) => Math.max(...rows.map((row: string[]) => (row[colIdx] || '').length)) * fontSize * 0.6 + cellPadding * 2);
        const width = colWidths.reduce((a: number, b: number) => a + b, 0) + 40;
        const height = rows.length * lineHeight + 40;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = '#222';
        let y = 30;
        rows.forEach((row: string[], rowIdx: number) => {
          let x = 20;
          row.forEach((cell: string, colIdx: number) => {
            ctx.fillText(cell, x, y);
            x += colWidths[colIdx];
          });
          y += lineHeight;
        });
        return (canvas.toBuffer as any)(outputFormat === 'png' ? 'image/png' : 'image/jpeg');
      }

      // EPUB/MOBI/AZW3 to PNG/JPG (via PDF)
      const ebookFormats = ['epub', 'mobi', 'azw3'];
      if (ebookFormats.includes(inputFormat) && (outputFormat === 'png' || outputFormat === 'jpg')) {
        // Dynamically import ebookConverter to avoid circular dependency
        const { ebookConverter } = require('./ebook');
        const pdfBuffer = await ebookConverter.convert(input, inputFormat, 'pdf');
        // Reuse PDF to PNG/JPG logic
        if (outputFormat === 'png') {
          return await (this as any).convert(pdfBuffer, 'pdf', 'png', options);
        } else {
          return await (this as any).convert(pdfBuffer, 'pdf', 'jpg', options);
        }
      }

      // Code formats to PNG/JPG with syntax highlighting
      const codeFormats = ['json', 'xml', 'yaml', 'toml', 'ts', 'js', 'jsx', 'tsx', 'css', 'scss', 'less'];
      if (codeFormats.includes(inputFormat) && (outputFormat === 'png' || outputFormat === 'jpg')) {
        const code = input.toString();
        // Use highlight.js to highlight code
        const highlighted = hljs.highlightAuto(code, [inputFormat]).value;
        const hljsCss = `
          .hljs { display: block; overflow-x: auto; padding: 0.5em; background: #f0f0f0; color: #333; }
          .hljs-comment, .hljs-quote { color: #998; font-style: italic; }
          .hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #333; font-weight: bold; }
          .hljs-literal, .hljs-number, .hljs-tag .hljs-attr, .hljs-template-variable, .hljs-variable { color: #008080; }
          .hljs-doctag, .hljs-string { color: #d14; }
          .hljs-section, .hljs-selector-id, .hljs-title { color: #900; font-weight: bold; }
          .hljs-subst { font-weight: normal; }
          .hljs-class .hljs-title, .hljs-type { color: #458; font-weight: bold; }
          .hljs-attribute, .hljs-name, .hljs-tag { color: #000080; font-weight: normal; }
          .hljs-link, .hljs-regexp { color: #009926; }
          .hljs-bullet, .hljs-symbol { color: #990073; }
          .hljs-built_in, .hljs-builtin-name { color: #0086b3; }
          .hljs-meta { color: #999; font-weight: bold; }
          .hljs-deletion { background: #fdd; }
          .hljs-addition { background: #dfd; }
          .hljs-emphasis { font-style: italic; }
          .hljs-strong { font-weight: bold; }
        `;
        const html = `<html><head><style>${hljsCss}body{margin:0;padding:0;}pre{margin:0;padding:20px;font-size:18px;}</style></head><body><pre><code class='hljs'>${highlighted}</code></pre></body></html>`;
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const buffer = await page.screenshot({ type: outputFormat === 'png' ? 'png' : 'jpeg', fullPage: true });
        await browser.close();
        return buffer;
      }

      throw new Error(`Unsupported conversion: ${inputFormat} to ${outputFormat}`);
    } catch (error) {
      console.error('Document conversion error:', error);
      throw new Error('Failed to convert document');
    }
  }
}; 