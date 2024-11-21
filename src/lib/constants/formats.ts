export const FORMAT_MAPPING: Record<string, string[]> = {
  // Documents
  'pdf': ['doc', 'docx', 'txt', 'rtf', 'odt', 'pages'],
  'doc': ['pdf', 'docx', 'txt', 'rtf', 'odt'],
  'docx': ['pdf', 'doc', 'txt', 'rtf', 'odt'],
  'txt': ['pdf', 'doc', 'docx', 'rtf'],
  'rtf': ['pdf', 'doc', 'docx', 'txt'],
  'odt': ['pdf', 'doc', 'docx'],
  'pages': ['pdf', 'doc', 'docx'],

  // Images
  'jpg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'heic'],
  'jpeg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'heic'],
  'png': ['jpg', 'webp', 'gif', 'bmp', 'tiff', 'pdf', 'heic'],
  'gif': ['jpg', 'png', 'webp', 'bmp', 'tiff'],
  'webp': ['jpg', 'png', 'gif', 'bmp', 'tiff'],
  'bmp': ['jpg', 'png', 'webp', 'gif', 'tiff'],
  'tiff': ['jpg', 'png', 'webp', 'gif', 'bmp'],
  'heic': ['jpg', 'png', 'webp'],

  // Media - Video
  'mp4': ['mov', 'avi', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
  'mov': ['mp4', 'avi', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
  'avi': ['mp4', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
  'wmv': ['mp4', 'mov', 'avi', 'flv', 'webm'],
  'flv': ['mp4', 'mov', 'avi', 'wmv', 'webm'],
  'webm': ['mp4', 'mov', 'avi', 'wmv', 'flv'],
  'mkv': ['mp4', 'mov', 'avi'],
  'm4v': ['mp4', 'mov'],

  // Media - Audio
  'mp3': ['wav', 'aac', 'wma', 'ogg', 'm4a', 'flac'],
  'wav': ['mp3', 'aac', 'wma', 'ogg', 'm4a', 'flac'],
  'aac': ['mp3', 'wav', 'wma', 'ogg', 'm4a'],
  'wma': ['mp3', 'wav', 'aac', 'ogg'],
  'ogg': ['mp3', 'wav', 'aac', 'wma'],
  'm4a': ['mp3', 'wav', 'aac'],
  'flac': ['mp3', 'wav', 'aac'],

  // Archives
  'zip': ['7z', 'rar', 'tar', 'gz'],
  'rar': ['zip', '7z', 'tar', 'gz'],
  '7z': ['zip', 'rar', 'tar', 'gz'],
  'tar': ['zip', 'rar', '7z', 'gz'],
  'gz': ['zip', 'rar', '7z', 'tar'],

  // Ebooks
  'epub': ['pdf', 'mobi', 'azw3'],
  'mobi': ['epub', 'pdf', 'azw3'],
  'azw3': ['epub', 'pdf', 'mobi'],

  // Presentations
  'ppt': ['pdf', 'pptx'],
  'pptx': ['ppt', 'pdf'],
  'key': ['pdf', 'pptx'],

  // Spreadsheets
  'xls': ['pdf', 'xlsx', 'csv'],
  'xlsx': ['xls', 'pdf', 'csv'],
  'csv': ['xls', 'xlsx', 'pdf']
};

// Helper function to get all supported formats
export const getAllFormats = () => {
  const formats = new Set<string>();
  
  // Add all source formats
  Object.keys(FORMAT_MAPPING).forEach(format => formats.add(format));
  
  // Add all target formats
  Object.values(FORMAT_MAPPING).flat().forEach(format => formats.add(format));
}; 