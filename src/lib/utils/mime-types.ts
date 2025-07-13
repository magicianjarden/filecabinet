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
  // Ebooks
  'epub': 'application/epub+zip',
  'mobi': 'application/x-mobipocket-ebook',
  'azw3': 'application/vnd.amazon.ebook',
  
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

export function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'avif': 'image/avif',
    'tiff': 'image/tiff',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'md': 'text/markdown',
    'html': 'text/html',
    // Ebooks
    'epub': 'application/epub+zip',
    'mobi': 'application/x-mobipocket-ebook',
    'azw3': 'application/vnd.amazon.ebook',
    // Spreadsheets
    'csv': 'text/csv',
    
    // Code
    'json': 'application/json',
    'xml': 'application/xml',
    'yaml': 'application/yaml',
    'yml': 'application/yaml',
    'toml': 'application/toml',
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'css': 'text/css',
    
    // Archives
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    '7z': 'application/x-7z-compressed',
    'rar': 'application/x-rar-compressed',
    
    // Media
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'mkv': 'video/x-matroska'
  };

  return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
}

export function getExtensionFromMime(mimeType: string): string | null {
  for (const [ext, mime] of Object.entries(mimeTypes)) {
    if (mime === mimeType) return ext;
  }
  return null;
} 