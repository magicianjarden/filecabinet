import type { 
  SupportedFormats, 
  FileCategory,
  FormatConfig
} from '@/types/formats';

type SupportedFormatsType = {
  [K in FileCategory]: {
    input: readonly string[];
    output: readonly string[];
  };
};

export const settings = {
  maxFileSize: {
    images: 1024 * 1024 * 10,     // 10MB
    documents: 1024 * 1024 * 20,   // 20MB
    media: 1024 * 1024 * 100,     // 100MB
    archives: 1024 * 1024 * 200,   // 200MB
    code: 1024 * 1024 * 5,        // 5MB
  } as const,

  supportedFormats: {
    documents: {
      input: ['pdf', 'docx', 'doc', 'rtf', 'txt', 'odt', 'pages', 'epub', 'md', 'tex'],
      output: ['pdf', 'docx', 'txt', 'md']
    },
    images: {
      input: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic', 'raw'],
      output: ['jpg', 'png', 'webp', 'gif']
    },
    media: {
      input: [
        // Video
        'mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp',
        // Audio
        'mp3', 'wav', 'ogg', 'aac', 'wma', 'flac', 'm4a', 'aiff'
      ],
      output: [
        // Video
        'mp4', 'webm',
        // Audio
        'mp3', 'wav'
      ]
    },
    archives: {
      input: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'cab'],
      output: ['zip']
    },
    code: {
      input: ['json', 'yaml', 'yml', 'xml', 'csv', 'toml', 'ini', 'properties'],
      output: ['json', 'yaml', 'xml', 'csv']
    }
  } satisfies SupportedFormatsType
} as const;

export function isValidFileCategory(category: string): category is FileCategory {
  return Object.keys(settings.supportedFormats).includes(category);
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

// Helper to get mime type for format
export function getMimeType(format: string): string {
  const normalized = normalizeFormat(format);
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    odt: 'application/vnd.oasis.opendocument.text',
    rtf: 'application/rtf',
    txt: 'text/plain',
    md: 'text/markdown',
    tex: 'application/x-tex',
    epub: 'application/epub+zip',
    pages: 'application/x-iwork-pages-sffpages',
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
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    bz2: 'application/x-bzip2',
    xz: 'application/x-xz',
    iso: 'application/x-iso9660-image',
    cab: 'application/vnd.ms-cab-compressed',
    json: 'application/json',
    yaml: 'application/yaml',
    yml: 'application/yaml',
    xml: 'application/xml',
    csv: 'text/csv',
    toml: 'application/toml',
    ini: 'text/plain',
    properties: 'text/plain'
  };
  
  return mimeTypes[normalized] || 'application/octet-stream';
}