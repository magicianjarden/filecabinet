import { settings } from '@/config/settings'

export const SUPPORTED_FORMATS = {
  documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'html', 'md'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'tiff', 'bmp', 'heic'],
  media: ['mp4', 'mov', 'avi', 'webm', 'mkv', 'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'],
  archives: ['zip', 'tar'],
  presentations: ['ppt', 'pptx', 'key'],
  spreadsheets: ['xls', 'xlsx', 'csv'],
  ebooks: ['epub', 'mobi', 'azw3', 'pdf'],
  code: ['json', 'xml', 'yaml', 'toml', 'ts', 'js', 'jsx', 'tsx', 'css', 'scss', 'less']
} as const;

// Create a type from the values
export type SupportedFormat = typeof SUPPORTED_FORMATS[keyof typeof SUPPORTED_FORMATS][number];

// Use the largest size from settings as the general max size
export const MAX_FILE_SIZE = 1 * 1024 * 1024 * 1024; // 50MB