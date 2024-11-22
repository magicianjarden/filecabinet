import type { 
  SupportedFormats, 
  FileCategory,
  FormatConfig
} from './types/formats';

type SupportedFormatsType = {
  [K in FileCategory]: {
    input: readonly string[];
    output: readonly string[];
  };
};

export const settings = {
  maxFileSize: {
    images: 10 * 1024 * 1024,     // 10MB
    documents: 25 * 1024 * 1024,  // 25MB
    media: 100 * 1024 * 1024,     // 100MB
    archives: 50 * 1024 * 1024,   // 50MB
    presentations: 25 * 1024 * 1024, // 25MB
    spreadsheets: 25 * 1024 * 1024,  // 25MB
    ebooks: 25 * 1024 * 1024,      // 25MB
    code: 5 * 1024 * 1024,      // 5MB for code files
  } as const,
  supportedFormats: {
    documents: {
      input: ['docx', 'txt', 'md', 'pdf', 'html', 'rtf', 'odt'],
      output: ['pdf', 'txt', 'html', 'png', 'json', 'docx']
    },
    images: {
      input: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'tiff'],
      output: ['jpg', 'png', 'webp', 'avif']
    },
    media: {
      input: [
        // Video formats we can handle
        'mp4', 'mov', 'avi', 'webm', 'mkv',
        // Audio formats we can handle
        'mp3', 'wav', 'ogg'
      ],
      output: [
        // Video formats we can convert to
        'mp4', 'webm',
        // Audio formats we can convert to
        'mp3', 'wav', 'ogg'
      ]
    },
    archives: {
      input: ['zip', 'tar'],
      output: ['zip', 'tar']
    },
    presentations: {
      input: ['ppt', 'pptx', 'key'],
      output: ['ppt', 'pptx', 'key']
    },
    spreadsheets: {
      input: ['xls', 'xlsx', 'csv'],
      output: ['xls', 'xlsx', 'csv']
    },
    ebooks: {
      input: ['epub'],
      output: ['epub']
    },
    code: {
      input: ['json', 'xml', 'yaml', 'toml', 'ts', 'js', 'jsx', 'tsx', 'css', 'scss', 'less'],
      output: ['json', 'xml', 'yaml', 'js', 'css']
    }
  } satisfies SupportedFormatsType
} as const;

export function isValidFileCategory(category: string): category is FileCategory {
  return category in settings.supportedFormats;
}

export function getMaxFileSizeForCategory(category: FileCategory): number {
  return settings.maxFileSize[category];
}

export function isSupportedInputFormat(
  category: FileCategory,
  format: string
): boolean {
  const normalizedFormat = normalizeFormat(format);
  return settings.supportedFormats[category].input.includes(normalizedFormat);
}

export function isSupportedOutputFormat(
  category: FileCategory,
  format: string
): boolean {
  const normalizedFormat = normalizeFormat(format);
  return settings.supportedFormats[category].output.includes(normalizedFormat);
}

export function normalizeFormat(format: string): string {
  return format.toLowerCase().replace(/^\./, '');
}

// Type guard for supported formats
export function isValidFormat(format: string): boolean {
  return Object.values(settings.supportedFormats).some(
    ({ input, output }) => 
      input.includes(normalizeFormat(format)) || 
      output.includes(normalizeFormat(format))
  );
}

// Updated MIME types
export function getMimeType(format: string): string {
  const normalized = normalizeFormat(format);
  const mimeTypes: Record<string, string> = {
    // Document formats
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
    html: 'text/html',
    htm: 'text/html',
    xhtml: 'application/xhtml+xml',
    pdf: 'application/pdf',
    tex: 'application/x-tex',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    ott: 'application/vnd.oasis.opendocument.text-template',
    odm: 'application/vnd.oasis.opendocument.text-master',
    dot: 'application/msword',
    dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    dotm: 'application/vnd.ms-word.template.macroEnabled.12',
    pages: 'application/x-iwork-pages-sffpages',

    // Image formats
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    heic: 'image/heic',
    raw: 'image/x-raw',

    // Media formats
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    mkv: 'video/x-matroska',
    webm: 'video/webm',
    m4v: 'video/x-m4v',
    '3gp': 'video/3gpp',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    wma: 'audio/x-ms-wma',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    aiff: 'audio/x-aiff',

    // Archive formats
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    bz2: 'application/x-bzip2',
    xz: 'application/x-xz',
    iso: 'application/x-iso9660-image',
    cab: 'application/vnd.ms-cab-compressed',

    // Code formats
    json: 'application/json',
    yaml: 'application/yaml',
    yml: 'application/yaml',
    xml: 'application/xml',
    csv: 'text/csv',
    toml: 'application/toml',
    ini: 'text/plain',
    properties: 'text/plain',
    js: 'application/javascript',
    mjs: 'application/javascript',
    jsx: 'text/jsx',
    ts: 'application/typescript',
    tsx: 'text/tsx',
    css: 'text/css',
    scss: 'text/x-scss',
    less: 'text/x-less',
    sass: 'text/x-sass',

    // Config files
    'package.json': 'application/json',
    'package-lock.json': 'application/json',
    'yarn.lock': 'text/yaml',
    'pnpm-lock.yaml': 'text/yaml',
    '.babelrc': 'application/json',
    'tsconfig.json': 'application/json',
    '.eslintrc': 'application/json',
    '.prettierrc': 'application/json'
  };
  
  return mimeTypes[normalized] || 'application/octet-stream';
}