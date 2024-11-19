import React from 'react'
import { FileText, Image, Video, Music, Archive, Code } from 'lucide-react'
import { settings } from '@/config/settings'

interface FormatCategory {
  icon: JSX.Element;
  title: string;
  formats: string[];
  color: string;
  note?: string;
}

const formatCategories: Record<string, FormatCategory> = {
  documents: {
    icon: <FileText className="w-6 h-6" />,
    title: "Documents",
    formats: settings.supportedFormats.documents.input,
    color: "text-green-500"
  },
  images: {
    icon: <Image className="w-6 h-6" />,
    title: "Images",
    formats: settings.supportedFormats.images.input,
    color: "text-blue-500"
  },
  media: {
    icon: <Video className="w-6 h-6" />,
    title: "Media",
    formats: settings.supportedFormats.media.input,
    color: "text-purple-500"
  },
  code: {
    icon: <Code className="w-6 h-6" />,
    title: "Code",
    formats: settings.supportedFormats.code.input,
    color: "text-orange-500"
  },
  archives: {
    icon: <Archive className="w-6 h-6" />,
    title: "Archives",
    formats: settings.supportedFormats.archives.input,
    color: "text-amber-500",
    note: "All archive formats can be converted to ZIP"
  }
}

export function SupportedFormats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Object.entries(formatCategories).map(([key, category]) => (
        <div 
          key={key}
          className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 
            transition-all bg-white shadow-sm hover:shadow-md"
        >
          <div className={`flex items-center gap-2 ${category.color}`}>
            {category.icon}
            <h3 className="font-semibold">{category.title}</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {category.formats.map(format => (
              <span 
                key={format}
                className="px-2 py-1 bg-gray-100 rounded-md text-sm 
                  hover:bg-gray-200 cursor-help uppercase"
                title={category.note || `Convert ${format} files`}
              >
                {format}
              </span>
            ))}
          </div>
          {category.note && (
            <p className="mt-2 text-xs text-gray-500 italic">
              {category.note}
            </p>
          )}
        </div>
      ))}
    </div>
  )
} 