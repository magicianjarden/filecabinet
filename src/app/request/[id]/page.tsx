"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadCloud } from "lucide-react";
import QRCode from 'react-qr-code';
import { Header } from '@/components/Header';

// Helper: generate random AES-GCM key and IV
async function generateKeyAndIV() {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  return { key, iv };
}

// Helper: export key to base64
async function exportKeyToBase64(key: CryptoKey) {
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(raw))));
}

// Helper: encrypt file
async function encryptFile(file: File, key: CryptoKey, iv: Uint8Array) {
  const data = await file.arrayBuffer();
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new Uint8Array(encrypted);
}

export default function RequestUploadPage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyB64, setKeyB64] = useState<string | null>(null);
  const [ivB64, setIvB64] = useState<string | null>(null);
  const [statusLink, setStatusLink] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      // 1. Generate key and IV
      const { key, iv } = await generateKeyAndIV();
      // 2. Encrypt file
      const encrypted = await encryptFile(file, key, iv);
      // 3. Export key and IV to base64
      const keyB64Val = await exportKeyToBase64(key);
      const ivB64Val = btoa(String.fromCharCode(...Array.from(iv)));
      setKeyB64(keyB64Val);
      setIvB64(ivB64Val);
      const statusUrl = `${window.location.origin}/request/${params.id}/status#key=${encodeURIComponent(keyB64Val)}&iv=${encodeURIComponent(ivB64Val)}`;
      setStatusLink(statusUrl);
      // 4. Prepare form data
      const formData = new FormData();
      formData.append("file", new Blob([encrypted], { type: "application/octet-stream" }), file.name + ".enc");
      formData.append("iv", ivB64Val);
      // 5. Upload
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/request/${params.id}/upload`, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200) {
          setSuccess(true);
        } else {
          setError("Upload failed. Please try again.");
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        setError("Upload failed. Please try again.");
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setError("Encryption or upload failed. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-xl p-8 shadow-lg border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <UploadCloud className="h-6 w-6 text-green-600" />
              Upload a File
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="text-green-700 text-center font-semibold text-lg">
                  File uploaded and encrypted successfully!<br />
                  The requester can now download it securely.
                </div>
                {keyB64 && ivB64 && (
                  <>
                    <div className="w-full bg-slate-50 rounded p-4 border text-left">
                      <div className="font-semibold text-slate-800 mb-1">Decryption Key (base64):</div>
                      <div className="text-xs break-all mb-2">{keyB64}</div>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(keyB64)}>Copy Key</Button>
                      <div className="font-semibold text-slate-800 mt-4 mb-1">IV (base64):</div>
                      <div className="text-xs break-all mb-2">{ivB64}</div>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(ivB64)}>Copy IV</Button>
                    </div>
                    <div className="w-full flex flex-col items-center gap-2 mt-4">
                      <div className="font-semibold text-slate-800 mb-1">QR Code (Key & IV):</div>
                      <QRCode value={JSON.stringify({ key: keyB64, iv: ivB64 })} size={120} />
                      <div className="text-xs text-slate-500 mt-1 text-center">Scan to get key & IV</div>
                    </div>
                    {statusLink && (
                      <div className="w-full flex flex-col items-center gap-2 mt-4">
                        <div className="font-semibold text-slate-800 mb-1">Status/Download Link (with Key & IV):</div>
                        <span className="text-blue-700 break-all">{statusLink}</span>
                        <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(statusLink)}>Copy Link</Button>
                        <QRCode value={statusLink} size={120} />
                        <div className="text-xs text-slate-500 mt-1 text-center">Send this link to the requester for one-click download & decryption</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                <div
                  className="border-2 border-dashed border-green-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-green-50 transition mb-6"
                  onClick={() => inputRef.current?.click()}
                >
                  {file ? (
                    <span className="text-green-700 font-medium">{file.name}</span>
                  ) : (
                    <span className="text-slate-500">Click to select a file to upload</span>
                  )}
                  <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setError(null);
                      }
                    }}
                  />
                </div>
                {file && !uploading && (
                  <Button className="w-full mb-4" onClick={handleUpload}>
                    Encrypt & Upload
                  </Button>
                )}
                {uploading && (
                  <div className="mb-4">
                    <Progress value={progress} />
                    <p className="text-xs text-slate-500 mt-2">Uploading... {progress}%</p>
                  </div>
                )}
                {error && (
                  <div className="mb-4 text-red-600 text-sm">{error}</div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 