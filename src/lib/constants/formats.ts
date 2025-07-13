export const FORMAT_MAPPING: Record<string, string[]> = {
  // Documents
  'pdf': ['txt', 'json', 'png', 'epub', 'mobi', 'azw3'],
  'docx': ['pdf', 'txt'],
  'doc': ['pdf', 'txt', 'docx', 'rtf', 'odt'],
  'rtf': ['pdf', 'txt', 'docx', 'doc', 'odt'],
  'odt': ['pdf', 'txt', 'docx', 'doc', 'rtf'],
  'pages': ['pdf', 'txt', 'docx', 'doc', 'rtf', 'odt'],
  'txt': ['pdf'],
  'md': ['pdf', 'txt', 'html'],
  'html': ['pdf'],

  // Ebooks
  'epub': ['pdf', 'mobi', 'azw3'],
  'mobi': ['pdf', 'epub', 'azw3'],
  'azw3': ['pdf', 'epub', 'mobi'],

  // Images (Sharp supported)
  'jpg': ['png', 'webp', 'avif'],
  'jpeg': ['png', 'webp', 'avif'],
  'png': ['jpg', 'webp', 'avif'],
  'webp': ['jpg', 'png', 'avif'],
  'gif': ['jpg', 'png', 'webp', 'avif'],
  'avif': ['jpg', 'png', 'webp'],
  'tiff': ['jpg', 'png', 'webp', 'avif'],
  'bmp': ['jpg', 'png', 'webp'],
  'heic': ['jpg', 'png', 'webp'],

  // Media - Video (FFmpeg supported)
  'mp4': ['webm'],
  'mov': ['mp4', 'webm'],
  'avi': ['mp4', 'webm'],
  'webm': ['mp4'],
  'mkv': ['mp4', 'webm'],

  // Media - Audio (FFmpeg supported)
  'mp3': ['wav', 'ogg'],
  'wav': ['mp3', 'ogg'],
  'ogg': ['mp3', 'wav'],
  'm4a': ['mp3', 'wav'],
  'flac': ['mp3', 'wav'],
  'aac': ['mp3', 'wav'],

  // Archives (no conversion supported, so only allow zip/zip for now)
  'zip': [],
  'tar': [],

  // Code formats
  'json': ['xml', 'yaml', 'toml'],
  'xml': ['json', 'yaml', 'toml'],
  'yaml': ['json', 'xml', 'toml'],
  'toml': ['json', 'yaml', 'xml'],
  'ts': ['js'],
  'tsx': ['js', 'jsx'],
  'jsx': ['js'],
  'js': [],
  'scss': ['css'],
  'less': ['css'],
  'sass': ['css'],
};

// Helper function to get all supported formats
export const getAllFormats = () => {
  const formats = new Set<string>();
  Object.keys(FORMAT_MAPPING).forEach(format => formats.add(format));
  Object.values(FORMAT_MAPPING).flat().forEach(format => formats.add(format));
}; 