import React from 'react'
import { FileText, Image, Video, Music } from 'lucide-react'

const formats = {
  images: {
    icon: <Image className="w-6 h-6" />,
    title: "Images",
    formats: ["JPG", "PNG", "WEBP", "GIF", "HEIC"],
    color: "text-blue-500"
  },
  documents: {
    icon: <FileText className="w-6 h-6" />,
    title: "Documents",
    formats: ["PDF", "DOCX", "XLSX", "TXT"],
    color: "text-green-500"
  },
  video: {
    icon: <Video className="w-6 h-6" />,
    title: "Video",
    formats: ["MP4", "MOV", "AVI", "MKV"],
    color: "text-purple-500"
  },
  audio: {
    icon: <Music className="w-6 h-6" />,
    title: "Audio",
    formats: ["MP3", "WAV", "AAC", "FLAC"],
    color: "text-orange-500"
  }
}

export function SupportedFormats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {Object.entries(formats).map(([key, category]) => (
        <div 
          key={key}
          className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
        >
          <div className={`flex items-center gap-2 ${category.color}`}>
            {category.icon}
            <h3 className="font-semibold">{category.title}</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {category.formats.map(format => (
              <span 
                key={format}
                className="px-2 py-1 bg-gray-100 rounded-md text-sm hover:bg-gray-200 cursor-help"
                title={`Click to convert to ${format}`}
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 