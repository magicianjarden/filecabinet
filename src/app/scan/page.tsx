"use client";
import { useState, useRef } from "react";
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, ShieldX, UploadCloud, Loader2, Info, FileWarning } from "lucide-react";
import Link from 'next/link';

export default function VirusScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | { clean: boolean; infected: boolean; output: string }>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setProgress(0);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/scan", true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        setScanning(false);
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          setResult(res);
        } else {
          setError("Scan failed. Please try again.");
        }
      };
      xhr.onerror = () => {
        setScanning(false);
        setError("Scan failed. Please try again.");
      };
      xhr.send(formData);
    } catch (err) {
      setScanning(false);
      setError("Scan failed. Please try again.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
          {/* Left: Scan Area */}
          <div className="flex-1 flex flex-col items-center">
            <Card className="w-full max-w-xl p-8 shadow-xl border-green-200 flex flex-col bg-gradient-to-br from-green-50 to-white hover:shadow-2xl transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <span className="relative flex items-center">
                    <ShieldCheck className={`h-7 w-7 ${scanning ? 'animate-spin-slow text-yellow-500' : result?.infected ? 'text-red-600' : 'text-green-600'}`} />
                  </span>
                  Virus Scan
                </CardTitle>
                <div className="text-slate-600 mt-2 text-base font-normal">
                  Scan a file for viruses and malware before sharing or downloading.<br/>
                  <span className="text-xs text-green-700">Powered by open-source ClamAV antivirus.</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition mb-4 w-full ${result?.infected ? 'border-red-400 bg-red-50' : result?.clean ? 'border-green-400 bg-green-50' : 'border-green-300 bg-white hover:bg-green-50'}`}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => inputRef.current?.click()}
                  tabIndex={0}
                  aria-label="File dropzone"
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
                        setResult(null);
                        setError(null);
                      }
                    }}
                  />
                </div>
                {/* Scan summary/status */}
                <div className="flex flex-col items-center gap-2 mb-2">
                  {scanning && (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                      <div className="text-yellow-700 font-semibold">Scanning for viruses...</div>
                    </div>
                  )}
                  {!scanning && result && result.clean && (
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-green-600" />
                      <div className="text-green-700 font-bold text-lg">No threats found</div>
                    </div>
                  )}
                  {!scanning && result && result.infected && (
                    <div className="flex flex-col items-center gap-2">
                      <ShieldX className="w-8 h-8 text-red-600" />
                      <div className="text-red-700 font-bold text-lg">Threat detected!</div>
                      <div className="text-xs text-red-700">Do not open or share this file. Delete it immediately.</div>
                    </div>
                  )}
                </div>
                {file && !scanning && (
                  <div className="flex gap-2 w-full">
                    <Button className="flex-1" onClick={handleScan}>
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Scan File
                    </Button>
                    <Button className="flex-1" variant="outline" onClick={handleReset}>
                      Clear
                    </Button>
                  </div>
                )}
                {scanning && (
                  <div className="mb-4 w-full">
                    <Progress value={progress} />
                    <p className="text-xs text-slate-500 mt-2">Uploading... {progress}%</p>
                  </div>
                )}
                {error && <div className="mb-4 text-red-600 text-sm" role="alert">{error}</div>}
                {result && (
                  <div className={`flex flex-col items-center gap-2 p-4 rounded border w-full ${result.clean ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                    <div className="w-full text-left text-xs text-slate-600 mb-2 font-mono">Scan details:</div>
                    <pre className="bg-white rounded p-2 text-xs mt-2 w-full overflow-x-auto border border-slate-100">{result.output}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Right: Info & Tips */}
          <div className="flex-1 flex flex-col gap-6 max-w-xl mx-auto">
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-2 shadow">
              <Info className="w-6 h-6 text-green-600" />
              <div className="text-green-900 text-base font-semibold">Virus scanning helps protect you from malware, trojans, and other threats. Files are scanned in-memory and never stored. If a threat is found, do not open or share the file.</div>
            </div>
            <div className="bg-white/80 border border-green-100 rounded-lg p-4 shadow text-slate-700 text-sm">
              <div className="font-semibold mb-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-600" /> How it works:</div>
              <ul className="list-disc list-inside ml-4">
                <li>Upload any file to scan for viruses and malware.</li>
                <li>Powered by open-source <a href="https://www.clamav.net/" className="underline text-green-700" target="_blank" rel="noopener noreferrer">ClamAV</a>.</li>
                <li>Scan results are private and not stored.</li>
              </ul>
            </div>
            <div className="bg-white/80 border border-yellow-100 rounded-lg p-4 shadow text-slate-700 text-sm">
              <div className="font-semibold mb-1 flex items-center gap-1"><FileWarning className="w-4 h-4 text-yellow-600" /> Try it yourself:</div>
              <ul className="list-disc list-inside ml-4">
                <li>Download the harmless <a href="https://www.eicar.org/download/eicar.com.txt" className="underline text-blue-700" target="_blank" rel="noopener noreferrer">EICAR test file</a> and scan it to see a real detection.</li>
                <li>Never upload sensitive or personal files for testing.</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900 text-sm flex flex-col gap-2">
              <div className="font-semibold mb-1 flex items-center gap-1"><Info className="w-4 h-4 text-blue-600" /> Tips for staying safe with files:</div>
              <ul className="list-disc list-inside ml-4">
                <li>Always scan files from unknown sources before opening.</li>
                <li>Keep your operating system and antivirus software up to date.</li>
                <li>Be cautious with email attachments and downloads.</li>
                <li>If a file is flagged as dangerous, delete it immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Add a slow spin animation for the shield
// In your global CSS (e.g., globals.css), add:
// .animate-spin-slow { animation: spin 2s linear infinite; } 