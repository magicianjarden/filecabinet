"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DownloadCloud, Clock, Lock, Eye, EyeOff, FileText, Image as ImageIcon, File as FileIcon } from "lucide-react";
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

// Helper: derive key from password and salt using PBKDF2
async function deriveKeyFromPassword(password: string, saltB64: string) {
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['unwrapKey']
  );
}
async function unwrapAesKey(encryptedKeyB64: string, wrapKey: CryptoKey, wrapIvB64: string) {
  const encryptedKey = Uint8Array.from(atob(encryptedKeyB64), c => c.charCodeAt(0));
  const wrapIv = Uint8Array.from(atob(wrapIvB64), c => c.charCodeAt(0));
  return await window.crypto.subtle.unwrapKey(
    'raw',
    encryptedKey,
    wrapKey,
    { name: 'AES-GCM', iv: wrapIv },
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
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
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Auto-fill key/iv or password-based params from URL fragment
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.slice(1));
      const key = params.get('key');
      const iv = params.get('iv');
      const encryptedKey = params.get('encryptedKey');
      const salt = params.get('salt');
      const wrapIv = params.get('wrapIv');
      if (key) setKeyB64(key);
      if (iv) setIvB64(iv);
      if (encryptedKey && salt && wrapIv && iv) {
        setPasswordRequired(true);
        setKeyB64(''); // Clear key field
        setIvB64(iv);
      }
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
    setPasswordError(null);
    try {
      const res = await fetch(`/api/request/${params.id}/download`);
      if (!res.ok) {
        setError("Download failed or file expired.");
        setDownloading(false);
        return;
      }
      const encrypted = await res.arrayBuffer();
      let decrypted;
      if (passwordRequired) {
        // Password-based decryption
        if (!password) {
          setPasswordError('Password required to decrypt file.');
          setDownloading(false);
          return;
        }
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.slice(1));
        const encryptedKey = params.get('encryptedKey') || '';
        const salt = params.get('salt') || '';
        const wrapIv = params.get('wrapIv') || '';
        const iv = params.get('iv') || '';
        try {
          const wrapKey = await deriveKeyFromPassword(password, salt);
          const cryptoKey = await unwrapAesKey(encryptedKey, wrapKey, wrapIv);
          decrypted = await decryptFile(encrypted, cryptoKey, iv);
        } catch (err) {
          setPasswordError('Incorrect password or failed to decrypt file.');
          setDownloading(false);
          return;
        }
      } else {
        // Simple mode
        const key = await importKey(keyB64);
        decrypted = await decryptFile(encrypted, key, ivB64);
      }
      const blob = new Blob([decrypted], { type: fileInfo?.type || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileInfo?.name?.replace(/\.enc$/, "") || "file";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Decryption failed. Check your key, IV, or password.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-12">
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
              <div className="flex flex-col items-center gap-6 py-8 animate-fade-in">
                {/* File Info Card */}
                <div className="w-full bg-slate-50 rounded p-4 border text-left mb-2 flex items-center gap-4">
                  {(() => {
                    const ext = fileInfo.name?.split('.').pop()?.toLowerCase();
                    if (["png","jpg","jpeg","gif","webp","bmp"].includes(ext)) return <ImageIcon className="h-8 w-8 text-green-500" />;
                    if (["txt","md","csv","json"].includes(ext)) return <FileText className="h-8 w-8 text-green-500" />;
                    return <FileIcon className="h-8 w-8 text-green-500" />;
                  })()}
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 mb-1 truncate">{fileInfo.name}</div>
                    <div className="text-xs text-slate-500 mb-1">{fileInfo.type || 'Unknown type'}</div>
                    <div className="text-xs text-slate-500 mb-1">Size: {fileInfo.size ? `${(fileInfo.size/1024).toFixed(2)} KB` : 'Unknown'}</div>
                    {fulfilledAt && (
                      <div className="text-xs text-slate-400">Uploaded at: {new Date(fulfilledAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>
                {/* Password or Key/IV Prompt */}
                {passwordRequired ? (
                  <div className="w-full flex flex-col gap-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Lock className="h-4 w-4 text-slate-500" /> Password Required
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full border rounded px-3 py-2 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                        placeholder="Enter password to decrypt"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={downloading}
                        aria-label="Password"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && <div className="text-red-600 text-xs mb-2">{passwordError}</div>}
                    <Button className="w-full mt-2" onClick={handleDownload} disabled={downloading || !password}>
                      {downloading ? "Decrypting..." : <><DownloadCloud className="h-5 w-5 mr-2" /> Download & Decrypt</>}
                    </Button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Decryption Key & IV</label>
                    <div className="flex gap-2 w-full">
                      <input
                        className="border px-2 py-1 rounded w-1/2"
                        placeholder="Decryption Key (base64)"
                        value={keyB64}
                        onChange={e => setKeyB64(e.target.value)}
                        aria-label="Decryption Key"
                      />
                      <input
                        className="border px-2 py-1 rounded w-1/2"
                        placeholder="IV (base64)"
                        value={ivB64}
                        onChange={e => setIvB64(e.target.value)}
                        aria-label="IV"
                      />
                    </div>
                    <Button className="w-full mt-2" onClick={handleDownload} disabled={downloading || !keyB64 || !ivB64}>
                      {downloading ? "Decrypting..." : <><DownloadCloud className="h-5 w-5 mr-2" /> Download & Decrypt</>}
                    </Button>
                  </div>
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