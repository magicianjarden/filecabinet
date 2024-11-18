'use client';

import { useState } from 'react';

interface RequestTesterProps {
  method: string;
  path: string;
  requestBody?: any;
  parameters?: any[];
}

export function RequestTester({ method, path, requestBody, parameters }: RequestTesterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (targetFormat) formData.append('targetFormat', targetFormat);

      const res = await fetch(path, {
        method,
        body: method !== 'GET' ? formData : undefined,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Request failed');
      }

      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        setResponse(data);
      } else {
        // Handle file download
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const filename = res.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'converted-file';
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setResponse({ message: 'File downloaded successfully' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border rounded-lg p-4">
      <h4 className="font-semibold mb-4">Try it out</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File upload for conversion endpoints */}
        {path.includes('/convert/') && (
          <div>
            <label className="block mb-2">
              File:
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full mt-1"
              />
            </label>
            
            <label className="block mb-2">
              Target Format:
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="block w-full mt-1 p-2 border rounded"
              >
                <option value="">Select format</option>
                {path.includes('/document/') && (
                  <>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="txt">TXT</option>
                  </>
                )}
                {path.includes('/image/') && (
                  <>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                  </>
                )}
                {path.includes('/media/') && (
                  <>
                    <option value="mp4">MP4</option>
                    <option value="mp3">MP3</option>
                    <option value="webm">WEBM</option>
                  </>
                )}
              </select>
            </label>
          </div>
        )}

        {/* URL parameters */}
        {parameters?.map((param) => (
          <div key={param.name}>
            <label className="block mb-2">
              {param.name}:
              <input
                type="text"
                name={param.name}
                required={param.required}
                className="block w-full mt-1 p-2 border rounded"
                placeholder={param.description}
              />
            </label>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded ${
            loading
              ? 'bg-gray-400'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Processing...' : 'Send Request'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4">
          <h5 className="font-semibold mb-2">Response:</h5>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 