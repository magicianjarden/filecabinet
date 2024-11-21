export type ArchiveInputFormat = 'zip';
export type ArchiveOutputFormat = 'zip';

export type CodeInputFormat = 'json' | 'yaml' | 'yml' | 'xml' | 'csv';
export type CodeOutputFormat = 'json' | 'yaml' | 'xml' | 'csv';

export type DocumentInputFormat = 'pdf' | 'docx' | 'txt' | 'rtf' | 'md';
export type DocumentOutputFormat = 'pdf' | 'docx' | 'txt';

export type ImageInputFormat = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp';
export type ImageOutputFormat = 'jpg' | 'png' | 'webp';

export type MediaInputFormat = 'mp4' | 'mov' | 'avi' | 'mp3' | 'wav';
export type MediaOutputFormat = 'mp4' | 'mp3';

export type FileCategory = 
  | 'documents'
  | 'images'
  | 'media'
  | 'archives'
  | 'presentations'
  | 'spreadsheets'
  | 'ebooks'
  | 'code';

export interface FormatConfig {
  input: string[];
  output: string[];
}

export interface SupportedFormats {
  archives: FormatConfig;
  code: FormatConfig;
  documents: FormatConfig;
  images: FormatConfig;
  media: FormatConfig;
} 