'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileDown, Link as LinkIcon } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Header } from '@/components/Header';

function parseFragment() {
  if (typeof window === 'undefined') return { mode: 'none' };
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  if (params.has('key') && params.has('iv')) {
    return {
      mode: 'simple',
      key: decodeURIComponent(params.get('key') || ''),
      iv: decodeURIComponent(params.get('iv') || ''),
    };
  } else if (
    params.has('encryptedKey') &&
    params.has('salt') &&
    params.has('wrapIv') &&
    params.has('iv')
  ) {
    return {
      mode: 'password',
      encryptedKey: decodeURIComponent(params.get('encryptedKey') || ''),
      salt: decodeURIComponent(params.get('salt') || ''),
      wrapIv: decodeURIComponent(params.get('wrapIv') || ''),
      iv: decodeURIComponent(params.get('iv') || ''),
    };
  }
  return { mode: 'none' };
}

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

async function importKey(keyB64: string) {
  const raw = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
}

async function decryptFile(encrypted: ArrayBuffer, key: CryptoKey, ivB64: string) {
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  return await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
}

function getFileType(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext) return 'unknown';
  if ([ 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp' ].includes(ext)) return 'image';
  if ([ 'txt', 'md', 'csv', 'json' ].includes(ext)) return 'text';
  if ([ 'pdf' ].includes(ext)) return 'pdf';
  return 'binary';
}

export default function SharedFilePage({ params }: { params: { id: string } }) {
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    const frag = parseFragment();
    if (frag.mode === 'none') {
      setError('Missing decryption key or IV in the link.');
      setLoading(false);
      return;
    }
    if (frag.mode === 'password') {
      setPasswordRequired(true);
      setLoading(false);
      return;
    }
    // Simple mode: proceed as before
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const metaRes = await fetch(`/api/share/${params.id}/meta`);
        if (!metaRes.ok) {
          setError('File not found or expired.');
          setLoading(false);
          return;
        }
        const meta = await metaRes.json();
        setFileInfo(meta);
        const fileRes = await fetch(`/api/share/${params.id}`);
        if (!fileRes.ok) {
          setError('File not found or expired.');
          setLoading(false);
          return;
        }
        const encrypted = await fileRes.arrayBuffer();
        const cryptoKey = await importKey(frag.key || '');
        const decrypted = await decryptFile(encrypted, cryptoKey, frag.iv || '');
        const blob = new Blob([decrypted], { type: meta.type || 'application/octet-stream' });
        setDecryptedBlob(blob);
        const fileType = getFileType(meta.name);
        if (fileType === 'image' || fileType === 'pdf') {
          setPreviewUrl(URL.createObjectURL(blob));
        } else if (fileType === 'text') {
          const text = await blob.text();
          setTextPreview(text);
        }
      } catch (err) {
        setError('Failed to fetch or decrypt file.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [params.id]);

  // Password-based decryption handler
  const handlePasswordDecrypt = async () => {
    setDecrypting(true);
    setPasswordError(null);
    setError(null);
    const frag = parseFragment();
    try {
      const metaRes = await fetch(`/api/share/${params.id}/meta`);
      if (!metaRes.ok) {
        setError('File not found or expired.');
        setDecrypting(false);
        return;
      }
      const meta = await metaRes.json();
      setFileInfo(meta);
      const fileRes = await fetch(`/api/share/${params.id}`);
      if (!fileRes.ok) {
        setError('File not found or expired.');
        setDecrypting(false);
        return;
      }
      const encrypted = await fileRes.arrayBuffer();
      // Derive key from password
      const wrapKey = await deriveKeyFromPassword(password, frag.salt || '');
      // Unwrap AES key
      const cryptoKey = await unwrapAesKey(frag.encryptedKey || '', wrapKey, frag.wrapIv || '');
      // Decrypt file
      const decrypted = await decryptFile(encrypted, cryptoKey, frag.iv || '');
      const blob = new Blob([decrypted], { type: meta.type || 'application/octet-stream' });
      setDecryptedBlob(blob);
      const fileType = getFileType(meta.name);
      if (fileType === 'image' || fileType === 'pdf') {
        setPreviewUrl(URL.createObjectURL(blob));
      } else if (fileType === 'text') {
        const text = await blob.text();
        setTextPreview(text);
      }
      setPasswordRequired(false);
    } catch (err) {
      setPasswordError('Incorrect password or failed to decrypt file.');
    } finally {
      setDecrypting(false);
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!fileInfo) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/share/${params.id}/download`);
      if (!res.ok) {
        setError('Failed to download file.');
        setDownloading(false);
        return;
      }
      const encrypted = await res.arrayBuffer();
      const frag = parseFragment();
      let cryptoKey;
      if (frag.mode === 'simple') {
        cryptoKey = await importKey(frag.key || '');
      } else if (frag.mode === 'password') {
        const wrapKey = await deriveKeyFromPassword(password, frag.salt || '');
        cryptoKey = await unwrapAesKey(frag.encryptedKey || '', wrapKey, frag.wrapIv || '');
      } else {
        setError('Missing decryption key or IV in the link.');
        setDownloading(false);
        return;
      }
      const decrypted = await decryptFile(encrypted, cryptoKey, frag.iv || '');
      const blob = new Blob([decrypted], { type: fileInfo.type || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.name || 'file';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 100);
    } catch (err) {
      setError('Failed to decrypt or download file.');
    } finally {
      setDownloading(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-xl p-8 shadow-lg border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <FileDown className="h-6 w-6 text-green-600" />
              Shared File
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <Progress value={100} className="mb-4" />}
            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
            {passwordRequired && !decryptedBlob && (
              <div className="mb-4">
                <div className="mb-2 text-slate-700">This file is password-protected. Enter the password to decrypt:</div>
                <input
                  type="password"
                  className="border rounded px-3 py-2 w-full mb-2"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={decrypting}
                  onKeyDown={e => { if (e.key === 'Enter') handlePasswordDecrypt(); }}
                  autoFocus
                />
                {passwordError && <div className="text-red-600 text-xs mb-2">{passwordError}</div>}
                <Button className="w-full" onClick={handlePasswordDecrypt} disabled={decrypting || !password}>
                  {decrypting ? 'Decrypting...' : 'Decrypt File'}
                </Button>
              </div>
            )}
            {fileInfo && !loading && !error && !passwordRequired && (
              <>
                {/* Metadata */}
                <div className="w-full bg-slate-50 rounded p-4 border text-left mb-4">
                  <div className="font-semibold text-slate-800 mb-1">{fileInfo.name}</div>
                  <div className="text-xs text-slate-500 mb-1">{fileInfo.type || 'Unknown type'}</div>
                  <div className="text-xs text-slate-500 mb-1">Size: {fileInfo.size ? `${(fileInfo.size/1024).toFixed(2)} KB` : 'Unknown'}</div>
                </div>
                {/* Preview */}
                {previewUrl && getFileType(fileInfo.name) === 'image' && (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-64 rounded border mb-4" />
                )}
                {previewUrl && getFileType(fileInfo.name) === 'pdf' && (
                  <iframe src={previewUrl} className="w-full h-64 rounded border mb-4" title="PDF Preview" />
                )}
                {textPreview && getFileType(fileInfo.name) === 'text' && (
                  <pre className="bg-slate-100 rounded p-2 mb-4 max-h-64 overflow-auto text-xs w-full">{textPreview}</pre>
                )}
                {/* Share link and QR code */}
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
                    <LinkIcon className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 break-all">{shareUrl}</span>
                  </div>
                  <div className="bg-white p-4 rounded shadow">
                    <QRCode value={shareUrl} size={160} />
                    <div className="text-xs text-slate-500 mt-2 text-center">Scan to open this page</div>
                  </div>
                </div>
                <Button className="w-full" onClick={handleDownload} disabled={!decryptedBlob || downloading}>
                  {downloading ? 'Downloading...' : 'Download File'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 