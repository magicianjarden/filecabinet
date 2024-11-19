import { settings } from '@/config/settings'

export const SUPPORTED_FORMATS = {
  documents: ['.pdf', '.doc', '.docx', '.txt'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  media: ['.mp4', '.mov', '.avi', '.mp3', '.wav']
};

// Use the largest size from settings as the general max size
export const MAX_FILE_SIZE = Math.max(
  settings.maxFileSize.documents,
  settings.maxFileSize.images,
  settings.maxFileSize.media
);