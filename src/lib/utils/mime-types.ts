export const mimeTypes = {
  // Images
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'heic': 'image/heic',
  
  // Documents
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'txt': 'text/plain',
  'rtf': 'application/rtf',
  'odt': 'application/vnd.oasis.opendocument.text',
  
  // Media
  'mp4': 'video/mp4',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'avi': 'video/x-msvideo',
  'mov': 'video/quicktime',
  'wmv': 'video/x-ms-wmv',
  'flv': 'video/x-flv',
  'webm': 'video/webm',
  'mkv': 'video/x-matroska',
  'm4v': 'video/x-m4v',
  
  // Archives
  'zip': 'application/zip',
  'rar': 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  
  // Code
  'js': 'text/javascript',
  'ts': 'text/typescript',
  'py': 'text/x-python',
  'java': 'text/x-java',
  'cpp': 'text/x-c++src',
  
  // Others
  'csv': 'text/csv',
  'json': 'application/json',
  'xml': 'application/xml',
} as const;

export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  return mimeTypes[ext as keyof typeof mimeTypes] || 'application/octet-stream';
}

export function getExtensionFromMime(mimeType: string): string | null {
  for (const [ext, mime] of Object.entries(mimeTypes)) {
    if (mime === mimeType) return ext;
  }
  return null;
} 