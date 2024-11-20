import { SupportedFormats } from '@/types/formats';

export const supportedFormats: SupportedFormats = {
  archives: {
    input: ['zip'],
    output: ['zip']
  },
  code: {
    input: ['json', 'yaml', 'yml', 'xml', 'csv'],
    output: ['json', 'yaml', 'xml', 'csv']
  },
  documents: {
    input: ['pdf', 'docx', 'txt', 'rtf', 'md'],
    output: ['pdf', 'docx', 'txt']
  },
  images: {
    input: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    output: ['jpg', 'png', 'webp']
  },
  media: {
    input: ['mp4', 'mov', 'avi', 'mp3', 'wav'],
    output: ['mp4', 'mp3']
  }
} as const; 