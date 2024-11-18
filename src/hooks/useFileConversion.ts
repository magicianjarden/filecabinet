import { useState } from 'react';

type ConversionStatus = 'idle' | 'processing' | 'completed' | 'failed';

export function useFileConversion(type: 'document' | 'image' | 'media') {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const convert = async (file: File, targetFormat: string) => {
    try {
      setStatus('processing');
      setProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('targetFormat', targetFormat);

      const response = await fetch(`/api/convert/${type}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Conversion failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = response.headers.get('content-disposition')
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || 'converted-file';

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus('completed');
      setProgress(100);
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    convert,
    progress,
    status,
    error,
  };
} 