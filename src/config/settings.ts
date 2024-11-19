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
    images: 1024 * 1024 * 10,    // 10MB
    documents: 1024 * 1024 * 20,  // 20MB
    media: 1024 * 1024 * 50,     // 50MB
    archives: 1024 * 1024 * 100,  // 100MB
    code: 1024 * 1024 * 5,       // 5MB
  } as const,

  supportedFormats: {
    archives: {
      input: ['zip', 'rar', 'tar', 'gz', '7z'],
      output: ['zip']
    },
    code: {
      input: ['json', 'yaml', 'yml', 'xml', 'csv'],
      output: ['json', 'yaml', 'xml', 'csv']
    },
    documents: {
      input: ['pdf', 'docx', 'txt', 'rtf', 'md'],
      output: ['pdf', 'docx', 'txt']
    },
    images: {
      input: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      output: ['jpg', 'png', 'webp']
    },
    media: {
      input: ['mp4', 'mov', 'avi', 'mp3', 'wav'],
      output: ['mp4', 'mp3']
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
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    json: 'application/json',
    yaml: 'application/yaml',
    xml: 'application/xml',
    csv: 'text/csv',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/x-wav'
  };
  return mimeTypes[normalized] || '';
}