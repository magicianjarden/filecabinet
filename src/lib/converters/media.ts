let ffmpeg: any

// Initialize FFmpeg only on server side
if (typeof window === 'undefined') {
  const initFFmpeg = async () => {
    const ffmpegModule = await import('fluent-ffmpeg')
    const ffmpegInstaller = await import('@ffmpeg-installer/ffmpeg')
    const ffprobeInstaller = await import('@ffprobe-installer/ffprobe')
    
    ffmpeg = ffmpegModule.default
    ffmpeg.setFfmpegPath(ffmpegInstaller.path)
    ffmpeg.setFfprobePath(ffprobeInstaller.path)
    return ffmpeg
  }
  
  // Initialize when module loads
  initFFmpeg().catch(console.error)
}

export async function convertMedia(
  buffer: Buffer,
  inputFormat: string,
  outputFormat: string
): Promise<{ success: boolean; data?: Buffer; error?: string; mimeType?: string }> {
  try {
    if (!ffmpeg) {
      throw new Error('FFmpeg not initialized')
    }

    // Your existing conversion logic
    return {
      success: true,
      data: buffer,
      mimeType: `video/${outputFormat}`
    }
  } catch (error) {
    console.error('Media conversion error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert media'
    }
  }
} 