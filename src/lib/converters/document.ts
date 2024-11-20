import { Converter } from '@/types/converters';
import { settings } from '@/config/settings';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { marked } from 'marked';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// PDF parsing options
const PDF_PARSE_OPTIONS = {
  // Disable internal file loading
  disableCopyPaste: true,
  // Max pages to parse (0 = all pages)
  max: 0
};

export const documentConverter: Converter = {
  name: 'Document Converter',
  description: 'Convert between document formats',
  inputFormats: settings.supportedFormats.documents.input,
  outputFormats: settings.supportedFormats.documents.output,
  
  async convert(input: Buffer, inputFormat: string, outputFormat: string): Promise<Buffer> {
    try {
      let text: string;

      // First convert input to plain text
      switch (inputFormat) {
        case 'docx':
          const docxResult = await mammoth.extractRawText({ buffer: input });
          text = docxResult.value;
          break;

        case 'pdf':
          try {
            const pdfData = await pdfParse(input);
            text = pdfData.text;
          } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            throw new Error('Failed to parse PDF file');
          }
          break;

        case 'md':
          const mdText = input.toString('utf-8');
          const html = await Promise.resolve(marked(mdText));
          text = html.replace(/<[^>]*>/g, '');
          break;

        case 'txt':
          text = input.toString('utf-8');
          break;

        case 'rtf':
          text = input.toString('utf-8')
            .replace(/[\\][\w\d]+/g, '')
            .replace(/[{}]/g, '')
            .trim();
          break;

        default:
          throw new Error(`Unsupported input format: ${inputFormat}`);
      }

      // Then convert text to output format
      switch (outputFormat) {
        case 'txt':
          return Buffer.from(text, 'utf-8');

        case 'md':
          const md = text
            .split('\n\n')
            .map(para => para.trim())
            .filter(para => para)
            .join('\n\n');
          return Buffer.from(md, 'utf-8');

        case 'docx': {
          // Create a new Word document
          const doc = new Document({
            sections: [{
              properties: {},
              children: text
                .split('\n\n')
                .filter(para => para.trim())
                .map(para => new Paragraph({
                  children: [
                    new TextRun({
                      text: para.trim(),
                    }),
                  ],
                })),
            }],
          });

          // Generate the DOCX buffer
          return await Packer.toBuffer(doc);
        }

        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }
    } catch (error) {
      console.error('Document conversion error:', error);
      throw new Error('Failed to convert document');
    }
  }
}; 