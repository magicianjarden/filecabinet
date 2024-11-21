import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { settings } from '@/config/settings';
import { cn } from '@/lib/utils';
import { FileText, Image, Film, Archive, FileCode, PresentationIcon, Table, Book } from 'lucide-react';

// Define the category type
interface Category {
  name: string;
  formats: string[];
  description: string;
  color?: string;
  icon?: ReactNode;
  note?: string;
}

export function SupportedFormats() {
  const categories: Category[] = [
    {
      name: 'Documents',
      formats: settings.supportedFormats.documents.input,
      description: 'PDF, Word, Text files and more',
      icon: <FileText className="h-4 w-4" />
    },
    {
      name: 'Images',
      formats: settings.supportedFormats.images.input,
      description: 'JPG, PNG, WebP and more',
      icon: <Image className="h-4 w-4" />
    },
    {
      name: 'Media',
      formats: settings.supportedFormats.media.input,
      description: 'Video and audio formats',
      icon: <Film className="h-4 w-4" />
    },
    {
      name: 'Archives',
      formats: settings.supportedFormats.archives.input,
      description: 'ZIP, RAR, and other archives',
      icon: <Archive className="h-4 w-4" />,
      note: 'Converts to ZIP'
    },
    {
      name: 'Presentations',
      formats: settings.supportedFormats.presentations.input,
      description: 'PowerPoint and Keynote',
      icon: <PresentationIcon className="h-4 w-4" />
    },
    {
      name: 'Spreadsheets',
      formats: settings.supportedFormats.spreadsheets.input,
      description: 'Excel, CSV, and Numbers',
      icon: <Table className="h-4 w-4" />
    },
    {
      name: 'Ebooks',
      formats: settings.supportedFormats.ebooks.input,
      description: 'EPUB, MOBI, and AZW3',
      icon: <Book className="h-4 w-4" />
    },
    {
      name: 'Code',
      formats: settings.supportedFormats.code.input,
      description: 'JSON, YAML, XML, and CSV',
      color: 'border-blue-600/20',
      icon: <FileCode className="h-4 w-4" />,
      note: 'Convert between different data formats'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {categories.map(category => (
        <div 
          key={category.name}
          className="group p-4 rounded-xl border border-gray-200 bg-white 
            hover:border-gray-300 transition-all duration-200"
        >
          <div className={`flex items-center gap-2 ${category.color}`}>
            {category.icon}
            <h3 className="font-medium">{category.name}</h3>
          </div>
          
          <p className="mt-2 text-sm text-gray-600">
            {category.description}
          </p>

          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {category.formats.map(format => (
                <span 
                  key={format}
                  className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600
                    group-hover:bg-gray-200 transition-colors duration-200 uppercase"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>

          {category.note && (
            <p className="mt-2 text-xs text-gray-500">
              {category.note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
} 