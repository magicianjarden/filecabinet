interface ConversionResult {
  url: string;
  filename: string;
}

export async function handleConversion(
  file: File,
  targetFormat: string
): Promise<ConversionResult> {
  const startTime = Date.now();
  
  try {
    // Convert the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);

    const response = await fetch('/api/convert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Conversion failed: ${response.statusText}`);
    }

    const result = await response.json();
    const endTime = Date.now();
    const conversionTime = (endTime - startTime) / 1000;

    // Record stats
    await fetch('/api/stats/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileSize: file.size,
        fromFormat: file.name.split('.').pop(),
        toFormat: targetFormat,
        conversionTime,
        success: true
      })
    });

    return result;
  } catch (error) {
    // Record failed conversion
    await fetch('/api/stats/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileSize: file.size,
        fromFormat: file.name.split('.').pop(),
        toFormat: targetFormat,
        success: false
      })
    });

    throw error;
  }
}

// Add helper functions if needed
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = getFileExtension(file.name);
  return allowedTypes.includes(extension);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
} 