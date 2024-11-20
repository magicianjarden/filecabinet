import { Converter } from '@/types/converters';
import { settings } from '@/config/settings';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { marked } from 'marked';

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
          const pdfData = await pdfParse(input);
          text = pdfData.text;
          break;

        case 'md':
          const mdText = input.toString('utf-8');
          // Convert Markdown to plain text by first converting to HTML
          const html = await Promise.resolve(marked(mdText));
          // Simple HTML to text conversion
          text = html.replace(/<[^>]*>/g, '');
          break;

        case 'txt':
          text = input.toString('utf-8');
          break;

        case 'rtf':
          // Basic RTF to text conversion
          text = input.toString('utf-8')
            .replace(/[\\][\w\d]+/g, '') // Remove RTF commands
            .replace(/[{}]/g, '')        // Remove braces
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
          // Simple text to Markdown conversion
          const md = text
            .split('\n\n')
            .map(para => para.trim())
            .filter(para => para)
            .join('\n\n');
          return Buffer.from(md, 'utf-8');

        case 'docx': {
          // For DOCX, we'll create a simple HTML structure and convert it
          const htmlContent = `
            <html>
              <body>
                ${text.split('\n\n')
                  .map(para => `<p>${para.trim()}</p>`)
                  .join('\n')}
              </body>
            </html>
          `;

          // Convert HTML to DOCX using mammoth's conversion
          const result = await mammoth.convertToDocx({
            value: htmlContent,
            options: { styleMap: ['p => p'] }
          });
          return Buffer.from(result);
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