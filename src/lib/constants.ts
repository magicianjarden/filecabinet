import { settings } from '@/config/settings'

export const SUPPORTED_FORMATS = {
  documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  media: ['mp4', 'mp3', 'wav', 'avi'],
  archives: ['zip', 'rar', '7z']
} as const;

// Create a type from the values
export type SupportedFormat = typeof SUPPORTED_FORMATS[keyof typeof SUPPORTED_FORMATS][number];

// Use the largest size from settings as the general max size
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB