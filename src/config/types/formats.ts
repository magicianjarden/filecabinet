export type FileCategory = 
  | 'documents'
  | 'images'
  | 'media'
  | 'archives'
  | 'presentations'
  | 'spreadsheets'
  | 'ebooks'
  | 'code';

export type FormatConfig = {
  input: readonly string[];
  output: readonly string[];
};

export type SupportedFormats = {
  readonly [K in FileCategory]: FormatConfig;
}; 