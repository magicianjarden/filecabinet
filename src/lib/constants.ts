import { settings } from '@/config/settings'

export const SUPPORTED_FORMATS = {
  documents: ['.pdf', '.docx', '.txt', '.rtf'],
  images: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  media: ['.mp4', '.webm', '.mov', '.mp3', '.wav'],
  archives: ['.zip', '.rar', '.7z', '.tar', '.gz']
};

// Use the largest size from settings as the general max size
export const MAX_FILE_SIZE = Math.max(
  settings.maxFileSize.documents,
  settings.maxFileSize.images,
  settings.maxFileSize.media,
  settings.maxFileSize.archives
);