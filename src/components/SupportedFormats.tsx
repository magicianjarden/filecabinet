import React from 'react'
import { FileText, Image, Video, Music, Archive, Code } from 'lucide-react'
import { settings } from '@/config/settings'

interface FormatCategory {
  icon: JSX.Element;
  title: string;
  formats: {
    input: string[];
    output: string[];
  };
  color: string;
  note?: string;
  description: string;
}

const formatCategories: Record<string, FormatCategory> = {
  documents: {
    icon: <FileText className="w-5 h-5" />,
    title: "Documents",
    formats: settings.supportedFormats.documents,
    color: "text-green-600",
    description: "PDF, Word, Text files and more"
  },
  images: {
    icon: <Image className="w-5 h-5" />,
    title: "Images",
    formats: settings.supportedFormats.images,
    color: "text-blue-600",
    description: "JPG, PNG, WebP and more"
  },
  media: {
    icon: <Video className="w-5 h-5" />,
    title: "Media",
    formats: settings.supportedFormats.media,
    color: "text-purple-600",
    description: "Video and audio formats"
  },
  code: {
    icon: <Code className="w-5 h-5" />,
    title: "Code",
    formats: settings.supportedFormats.code,
    color: "text-orange-600",
    description: "JSON, YAML, XML and more"
  },
  archives: {
    icon: <Archive className="w-5 h-5" />,
    title: "Archives",
    formats: settings.supportedFormats.archives,
    color: "text-amber-600",
    description: "ZIP, RAR, 7Z and more",
    note: "Converts to ZIP"
  }
}

export function SupportedFormats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Object.entries(formatCategories).map(([key, category]) => (
        <div 
          key={key}
          className="group p-4 rounded-xl border border-gray-200 bg-white 
            hover:border-gray-300 transition-all duration-200"
        >
          <div className={`flex items-center gap-2 ${category.color}`}>
            {category.icon}
            <h3 className="font-medium">{category.title}</h3>
          </div>
          
          <p className="mt-2 text-sm text-gray-600">
            {category.description}
          </p>

          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {category.formats.input.map(format => (
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