export const FORMAT_MAPPING: Record<string, string[]> = {
  // Documents
  'pdf': ['txt', 'json', 'png'],
  'doc': ['pdf', 'docx', 'txt', 'rtf', 'odt'],
  'docx': ['pdf', 'txt'],
  'txt': ['pdf'],
  'rtf': ['pdf', 'doc', 'docx', 'txt'],
  'odt': ['pdf', 'doc', 'docx'],
  'pages': ['pdf', 'doc', 'docx'],
  'md': ['pdf', 'txt', 'html'],

  // Images - what Sharp actually supports
  'jpg': ['png', 'webp', 'avif'],
  'jpeg': ['png', 'webp', 'avif'],
  'png': ['jpg', 'webp', 'avif'],
  'webp': ['jpg', 'png', 'avif'],
  'gif': ['jpg', 'png', 'webp', 'avif'],
  'avif': ['jpg', 'png', 'webp'],
  'tiff': ['jpg', 'png', 'webp', 'avif'],

  // Media - Video
  'mp4': ['webm'],
  'mov': ['mp4', 'webm'],
  'avi': ['mp4', 'webm'],
  'webm': ['mp4'],
  'mkv': ['mp4', 'webm'],

  // Media - Audio
  'mp3': ['wav', 'ogg'],
  'wav': ['mp3', 'ogg'],
  'ogg': ['mp3', 'wav'],
  'm4a': ['mp3', 'wav'],
  'flac': ['mp3', 'wav'],
  'aac': ['mp3', 'wav'],

  // Archives - what we actually support
  'zip': ['tar'],
  'tar': ['zip'],

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
  'csv': ['xls', 'xlsx', 'pdf'],

  // Code formats - Enhanced
  'json': ['xml', 'yaml', 'toml'],
  'xml': ['json', 'yaml', 'toml'],
  'yaml': ['json', 'xml', 'toml'],
  'toml': ['json', 'yaml', 'xml'],
  
  // TypeScript/JavaScript
  'ts': ['js'],
  'tsx': ['js', 'jsx'],
  'jsx': ['js'],
  
  // CSS Preprocessors
  'scss': ['css'],
  'less': ['css'],
  'sass': ['css'],
  
  // Build Configs
  'rollup.config.js': ['webpack.config.js', 'vite.config.js'],
  'webpack.config.js': ['rollup.config.js', 'vite.config.js'],
  'vite.config.js': ['rollup.config.js', 'webpack.config.js'],
  
  // Package Managers
  'package.json': ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'],
  'yarn.lock': ['package-lock.json', 'pnpm-lock.yaml'],
  'pnpm-lock.yaml': ['package-lock.json', 'yarn.lock'],
  
  // Config Files
  '.babelrc': ['babel.config.js', 'babel.config.json'],
  'tsconfig.json': ['jsconfig.json'],
  '.eslintrc': ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml'],
  '.prettierrc': ['.prettierrc.js', '.prettierrc.json', '.prettierrc.yaml']
};

// Helper function to get all supported formats
export const getAllFormats = () => {
  const formats = new Set<string>();
  
  // Add all source formats
  Object.keys(FORMAT_MAPPING).forEach(format => formats.add(format));
  
  // Add all target formats
  Object.values(FORMAT_MAPPING).flat().forEach(format => formats.add(format));
}; 