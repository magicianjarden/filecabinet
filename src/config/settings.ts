export const settings = {
    // File size limits
    maxFileSize: {
      documents: 25 * 1024 * 1024,  // 25MB for documents
      images: 15 * 1024 * 1024,     // 15MB for images
      media: 100 * 1024 * 1024      // 100MB for media files
    },
  
    // Supported file formats
    supportedFormats: {
      documents: {
        input: ['.pdf', '.docx', '.txt', '.rtf', '.md'],
        output: {
          pdf: ['.docx', '.txt', '.rtf'],
          docx: ['.pdf', '.txt', '.rtf'],
          txt: ['.pdf', '.docx'],
          rtf: ['.pdf', '.docx'],
          md: ['.pdf', '.docx', '.txt']
        }
      },
      images: {
        input: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff'],
        output: {
          jpg: ['.png', '.webp', '.tiff'],
          png: ['.jpg', '.webp', '.tiff'],
          webp: ['.jpg', '.png'],
          tiff: ['.jpg', '.png', '.webp']
        }
      },
      media: {
        input: ['.mp3', '.mp4', '.wav', '.avi', '.mov', '.webm'],
        output: {
          mp3: ['.wav', '.ogg'],
          wav: ['.mp3', '.ogg'],
          mp4: ['.avi', '.mov', '.webm'],
          avi: ['.mp4', '.mov'],
          mov: ['.mp4', '.avi']
        }
      }
    },
  
    // Conversion timeouts (in milliseconds)
    conversionTimeouts: {
      documents: 60000,  // 60 seconds
      images: 30000,     // 30 seconds
      media: 180000      // 3 minutes
    },
  
    // Error messages
    errors: {
      fileTooLarge: 'File size exceeds the maximum limit',
      unsupportedFormat: 'File format is not supported',
      conversionFailed: 'File conversion failed',
      timeoutExceeded: 'Conversion timeout exceeded'
    },
  
    // Stats tracking categories
    statsCategories: {
      totalConversions: 'Total conversions performed',
      documentConversions: 'Document conversions',
      imageConversions: 'Image conversions',
      mediaConversions: 'Media conversions',
      popularFormats: 'Most popular formats'
    }
  }
  
  // Type definitions for better TypeScript support
  export type FileCategory = 'documents' | 'images' | 'media'
  export type SupportedInputFormat = keyof typeof settings.supportedFormats
  
  // Helper functions
  export const isFormatSupported = (filename: string, category: FileCategory): boolean => {
    const extension = filename.toLowerCase().match(/\.[0-9a-z]+$/)?.[0]
    return extension ? settings.supportedFormats[category].input.includes(extension) : false
  }
  
  export const getAvailableOutputFormats = (inputFormat: string, category: FileCategory): string[] => {
    const extension = inputFormat.toLowerCase().match(/\.[0-9a-z]+$/)?.[0]
    if (!extension) return []
    
    const formatKey = extension.slice(1) as keyof typeof settings.supportedFormats[typeof category]['output']
    return settings.supportedFormats[category].output[formatKey] || []
  }
  
  export const checkFileSize = (size: number, category: FileCategory): boolean => {
    return size <= settings.maxFileSize[category]
  }