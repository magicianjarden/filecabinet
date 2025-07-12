import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Link as LinkIcon } from 'lucide-react';

export default function SharePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    // TODO: Implement actual upload logic and update progress
    setTimeout(() => {
      setProgress(100);
      setUploading(false);
      setShareUrl('https://filecabinet.xyz/share/your-file-id'); // Placeholder
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-xl p-8 shadow-lg border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <UploadCloud className="h-6 w-6 text-green-600" />
              Share a File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-green-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-green-50 transition mb-6"
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
            >
              {file ? (
                <span className="text-green-700 font-medium">{file.name}</span>
              ) : (
                <span className="text-slate-500">Drag & drop a file here, or click to select</span>
              )}
              <input
                type="file"
                ref={inputRef}
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            {file && !uploading && (
              <Button className="w-full mb-4" onClick={handleUpload}>
                Upload & Generate Link
              </Button>
            )}
            {uploading && (
              <div className="mb-4">
                <Progress value={progress} />
                <p className="text-xs text-slate-500 mt-2">Uploading...</p>
              </div>
            )}
            {shareUrl && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 rounded">
                <LinkIcon className="h-4 w-4 text-green-600" />
                <a href={shareUrl} className="text-green-700 underline break-all" target="_blank" rel="noopener noreferrer">
                  {shareUrl}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 