"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, Eye, EyeOff, Lock, CheckCircle, X } from "lucide-react";
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

// Helper: derive key from password and salt using PBKDF2
async function deriveKeyFromPassword(password: string, salt: Uint8Array) {
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
    true,
    ['encrypt', 'decrypt']
  );
}
// Helper: encrypt AES key with derived key
async function encryptAESKey(aesKey: CryptoKey, wrappingKey: CryptoKey) {
  const rawKey = await window.crypto.subtle.exportKey('raw', aesKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    rawKey
  );
  return { encryptedKey: new Uint8Array(encrypted), wrapIv: iv };
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
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    if (password && password !== passwordConfirm) {
      setPasswordError('Passwords do not match.');
      return;
    }
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
      // 4. Prepare form data
      const formData = new FormData();
      formData.append("file", new Blob([encrypted], { type: "application/octet-stream" }), file.name + ".enc");
      formData.append("iv", ivB64Val);
      let statusUrl = '';
      if (password) {
        // Password-based encryption
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const wrappingKey = await deriveKeyFromPassword(password, salt);
        const { encryptedKey, wrapIv } = await encryptAESKey(key, wrappingKey);
        const encryptedKeyB64 = btoa(String.fromCharCode(...Array.from(encryptedKey)));
        const saltB64 = btoa(String.fromCharCode(...Array.from(salt)));
        const wrapIvB64 = btoa(String.fromCharCode(...Array.from(wrapIv)));
        formData.append('encryptedKey', encryptedKeyB64);
        formData.append('salt', saltB64);
        formData.append('wrapIv', wrapIvB64);
        statusUrl = `${window.location.origin}/request/${params.id}/status#encryptedKey=${encodeURIComponent(encryptedKeyB64)}&salt=${encodeURIComponent(saltB64)}&wrapIv=${encodeURIComponent(wrapIvB64)}&iv=${encodeURIComponent(ivB64Val)}`;
      } else {
        // Simple mode
        statusUrl = `${window.location.origin}/request/${params.id}/status#key=${encodeURIComponent(keyB64Val)}&iv=${encodeURIComponent(ivB64Val)}`;
      }
      setStatusLink(statusUrl);
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-xl p-8 shadow-lg border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <UploadCloud className="h-6 w-6 text-green-600" />
              Upload a File
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-6 py-8 animate-fade-in">
                <CheckCircle className="h-12 w-12 text-green-600 mb-2 animate-pop-in" />
                <div className="text-green-700 text-center font-semibold text-lg">
                  File uploaded and encrypted successfully!<br />
                  The requester can now download it securely.
                </div>
                {keyB64 && ivB64 && !password && (
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
                  </>
                )}
                {statusLink && password && (
                  <div className="w-full flex flex-col items-center gap-2 mt-4">
                    <div className="font-semibold text-slate-800 mb-1">Status/Download Link (with Password):</div>
                    <span className="text-blue-700 break-all">{statusLink}</span>
                    <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(statusLink)}>Copy Link</Button>
                    <QRCode value={statusLink} size={120} />
                    <div className="text-xs text-slate-500 mt-1 text-center">Send this link to the requester. They will need the password to decrypt.</div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Drag-and-drop area and file details */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-green-50 transition mb-6 ${file ? 'border-green-400' : 'border-green-300'}`}
                  onClick={() => inputRef.current?.click()}
                  onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setFile(e.dataTransfer.files[0]);
                      setError(null);
                    }
                  }}
                  onDragOver={e => e.preventDefault()}
                  tabIndex={0}
                  role="button"
                  aria-label="Select file to upload"
                >
                  {!file ? (
                    <>
                      <UploadCloud className="h-10 w-10 text-green-400 mb-2" />
                      <span className="text-slate-500">Drag & drop a file here, or click to select</span>
                    </>
                  ) : (
                    <div className="w-full flex flex-col items-center gap-2">
                      <span className="text-green-700 font-medium text-lg">{file.name}</span>
                      <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}</span>
                      <Button size="icon" variant="ghost" className="mt-2" onClick={e => { e.stopPropagation(); setFile(null); }} aria-label="Remove file">
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
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
                {/* Password section */}
                <div className="mb-4 w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1 items-center gap-1">
                    <Lock className="h-4 w-4 text-slate-500" /> Password (optional)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full border rounded px-3 py-2 pr-10"
                      placeholder="Set a password to require for download"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border rounded px-3 py-2 mt-2"
                    placeholder="Confirm password"
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    aria-label="Confirm password"
                  />
                  {passwordError && <div className="text-xs text-red-600 mt-1">{passwordError}</div>}
                  {password && (
                    <div className="text-xs text-slate-500 mt-1">Do not share this password with anyone you don't trust. It is never stored.</div>
                  )}
                </div>
                {/* Upload button and progress */}
                {file && !uploading && (
                  <Button className="w-full mb-4" onClick={handleUpload}>
                    <UploadCloud className="h-5 w-5 mr-2" /> Encrypt & Upload
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