import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export const getFileCategory = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'pages'].includes(ext)) return 'Documents';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'heic'].includes(ext)) return 'Images';
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(ext)) return 'Videos';
  if (['mp3', 'wav', 'aac', 'wma', 'ogg', 'm4a', 'flac'].includes(ext)) return 'Audio';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'Archives';
  if (['epub', 'mobi', 'azw3'].includes(ext)) return 'Ebooks';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'Presentations';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'Spreadsheets';
  return 'Other';
}; 