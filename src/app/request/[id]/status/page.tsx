"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DownloadCloud, Clock } from "lucide-react";
import { Header } from '@/components/Header';

// Helper: import key from base64
async function importKey(keyB64: string) {
  const raw = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM" },
    true,
    ["decrypt"]
  );
}

// Helper: decrypt file
async function decryptFile(encrypted: ArrayBuffer, key: CryptoKey, ivB64: string) {
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
  return new Uint8Array(decrypted);
}

export default function RequestStatusPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<string>("pending");
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [fulfilledAt, setFulfilledAt] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For MVP, ask user for key/iv manually (could be in fragment in future)
  const [keyB64, setKeyB64] = useState("");
  const [ivB64, setIvB64] = useState("");

  // Auto-fill key/iv from URL fragment
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.slice(1));
      const key = params.get('key');
      const iv = params.get('iv');
      if (key) setKeyB64(key);
      if (iv) setIvB64(iv);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchStatus = async () => {
      const res = await fetch(`/api/request/${params.id}/status`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      setFileInfo(data.file);
      setExpiresAt(data.expires_at);
      setFulfilledAt(data.fulfilled_at);
    };
    fetchStatus();
    if (status === "pending") {
      interval = setInterval(fetchStatus, 3000);
    }
    return () => interval && clearInterval(interval);
    // eslint-disable-next-line
  }, [params.id, status]);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/request/${params.id}/download`);
      if (!res.ok) {
        setError("Download failed or file expired.");
        setDownloading(false);
        return;
      }
      const encrypted = await res.arrayBuffer();
      const key = await importKey(keyB64);
      const decrypted = await decryptFile(encrypted, key, ivB64);
      const blob = new Blob([decrypted], { type: fileInfo?.type || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInfo?.name?.replace(/\.enc$/, "") || "file";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Decryption failed. Check your key and IV.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-xl p-8 shadow-lg border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <DownloadCloud className="h-6 w-6 text-green-600" />
              File Request Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === "pending" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="text-yellow-700 font-semibold text-lg">Waiting for recipient to upload a file...</div>
                {expiresAt && (
                  <div className="text-xs text-slate-500">Expires at: {new Date(expiresAt).toLocaleString()}</div>
                )}
                <Progress value={100} className="mt-4" />
              </div>
            )}
            {status === "fulfilled" && fileInfo && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="text-green-700 font-semibold text-lg">File is ready to download!</div>
                <div className="text-sm text-slate-700">{fileInfo.name} ({fileInfo.size} bytes)</div>
                <div className="flex gap-2 w-full">
                  <input
                    className="border px-2 py-1 rounded w-1/2"
                    placeholder="Decryption Key (base64)"
                    value={keyB64}
                    onChange={e => setKeyB64(e.target.value)}
                  />
                  <input
                    className="border px-2 py-1 rounded w-1/2"
                    placeholder="IV (base64)"
                    value={ivB64}
                    onChange={e => setIvB64(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleDownload} disabled={downloading || !keyB64 || !ivB64}>
                  {downloading ? "Decrypting..." : "Download & Decrypt"}
                </Button>
                {fulfilledAt && (
                  <div className="text-xs text-slate-500">Uploaded at: {new Date(fulfilledAt).toLocaleString()}</div>
                )}
              </div>
            )}
            {status === "expired" && (
              <div className="text-red-700 text-center font-semibold text-lg py-8">
                This file request has expired or was deleted.
              </div>
            )}
            {error && (
              <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 