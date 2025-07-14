import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Toggle } from '@/components/ui/toggle';
import { UploadCloud, Link as LinkIcon, Eye, EyeOff, XCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { getTempFile } from '@/lib/utils/utils';

// Helper: generate random AES-GCM key and IV
async function generateKeyAndIV() {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  return { key, iv };
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
// Helper: encrypt file
async function encryptFile(file: File, key: CryptoKey, iv: Uint8Array) {
  const data = await file.arrayBuffer();
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return new Uint8Array(encrypted);
}
// Helper to get file type for preview
function getFileType(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext) return 'unknown';
  if ([ 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp' ].includes(ext)) return 'image';
  if ([ 'txt', 'md', 'csv', 'json' ].includes(ext)) return 'text';
  if ([ 'pdf' ].includes(ext)) return 'pdf';
  return 'binary';
}

function getPasswordStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const EXPIRATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '12 hours', value: 12 },
  { label: '24 hours (max)', value: 24 },
  { label: 'Custom...', value: 'custom' },
];

export default function SendFileFlow() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<number | 'custom'>(24);
  const [customExpiration, setCustomExpiration] = useState('');
  const [deleteOnDownload, setDeleteOnDownload] = useState(true);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<any>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const temp = getTempFile();
    if (temp) {
      setFile(temp);
      setShareUrl(null);
      setError(null);
    }
  }, []);

  useEffect(() => {
    if (file && uploadedFileInfo && getFileType(uploadedFileInfo.name) === 'text') {
      file.text().then(setTextPreview);
    } else {
      setTextPreview(null);
    }
  }, [file, uploadedFileInfo]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setShareUrl(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (password && password !== passwordConfirm) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setUploading(true);
    setProgress(0);
    setError(null);
    setShareUrl(null);
    setPasswordError(null);
    try {
      // 1. Generate key and IV
      const { key, iv } = await generateKeyAndIV();
      // 2. Encrypt file
      const encrypted = await encryptFile(file, key, iv);
      // 3. Export key and IV to base64
      const rawKeyBuffer = await window.crypto.subtle.exportKey('raw', key);
      const rawKeyArr = Array.from(new Uint8Array(rawKeyBuffer));
      const keyB64 = btoa(String.fromCharCode(...rawKeyArr));
      const ivArr = Array.from(iv); // iv is a Uint8Array
      const ivB64 = btoa(String.fromCharCode(...ivArr));
      // 4. Prepare form data
      const formData = new FormData();
      formData.append('file', new Blob([encrypted], { type: 'application/octet-stream' }), file.name + '.enc');
      formData.append('iv', ivB64);
      // Add the original file name for backend to use
      formData.append('originalName', file.name);
      // Expiration in hours
      const exp = expiration === 'custom' ? Number(customExpiration) : expiration;
      formData.append('expiration', String(exp));
      formData.append('deleteOnDownload', String(deleteOnDownload));
      // 5. Upload
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/share/upload', true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = async () => {
        setUploading(false);
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
          setUploadedFileInfo({
            name: file.name,
            size: file.size,
            type: file.type,
            expiration: exp,
            deleteOnDownload,
          });
          // Password protection logic
          if (password) {
            // Generate salt
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            // Derive key
            const wrappingKey = await deriveKeyFromPassword(password, salt);
            // Encrypt AES key
            const { encryptedKey, wrapIv } = await encryptAESKey(key, wrappingKey);
            // Store encryptedKey, salt, wrapIv, and file iv in the link
            const encryptedKeyB64 = btoa(String.fromCharCode(...Array.from(encryptedKey)));
            const saltB64 = btoa(String.fromCharCode(...Array.from(salt)));
            const wrapIvB64 = btoa(String.fromCharCode(...Array.from(wrapIv)));
            const url =
              `${window.location.origin}/share/${res.id}` +
              `#encryptedKey=${encodeURIComponent(encryptedKeyB64)}` +
              `&salt=${encodeURIComponent(saltB64)}` +
              `&wrapIv=${encodeURIComponent(wrapIvB64)}` +
              `&iv=${encodeURIComponent(ivB64)}`;
            setShareUrl(url);
          } else {
            // No password, store raw key and iv
            const url =
              `${window.location.origin}/share/${res.id}` +
              `#key=${encodeURIComponent(keyB64)}&iv=${encodeURIComponent(ivB64)}`;
            setShareUrl(url);
          }
        } else {
          setError('Upload failed. Please try again.');
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        setError('Upload failed. Please try again.');
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setError('Encryption or upload failed. Please try again.');
    }
  };

  return (
    <Card className="p-8 shadow-xl border-green-200 flex flex-col bg-gradient-to-br from-green-50 to-white hover:shadow-2xl transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <UploadCloud className="h-6 w-6 text-green-600" />
          Send a File
        </CardTitle>
        <div className="text-slate-600 mt-2 text-base font-normal">
          Securely encrypt and share a file with anyone. Only those with the link (and password, if set) can decrypt and download.
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {/* Step 1: Upload */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold">1</span>
            <span className="font-semibold text-green-700">Choose a file to share</span>
          </div>
          <div
            className="border-2 border-dashed border-green-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-green-50 transition mb-4"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            tabIndex={0}
            aria-label="File dropzone"
          >
            {file ? (
              <div className="w-full flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 w-full justify-between">
                  <span className="text-green-700 font-medium truncate max-w-xs">{file.name}</span>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    aria-label="Remove file"
                    onClick={e => { e.stopPropagation(); setFile(null); setShareUrl(null); setError(null); }}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 w-full justify-between">
                  <span>Type: {file.type || getFileType(file.name)}</span>
                  <span>Size: {(file.size/1024).toFixed(2)} KB</span>
                </div>
                {getFileType(file.name) === 'image' && (
                  <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-full max-h-32 rounded border mt-2" />
                )}
              </div>
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
                  setShareUrl(null);
                  setError(null);
                }
              }}
            />
          </div>
          {/* Expiration selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiration</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EXPIRATION_OPTIONS.filter(opt => opt.value !== 'custom').map(opt => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={expiration === opt.value ? 'default' : 'outline'}
                  className={expiration === opt.value ? 'bg-green-600 text-white' : ''}
                  onClick={() => setExpiration(opt.value as number)}
                >
                  {opt.label}
                </Button>
              ))}
              <Button
                type="button"
                variant={expiration === 'custom' ? 'default' : 'outline'}
                className={expiration === 'custom' ? 'bg-green-600 text-white' : ''}
                onClick={() => setExpiration('custom')}
              >
                Custom...
              </Button>
            </div>
            {expiration === 'custom' && (
              <div className="mt-2">
                <input
                  type="number"
                  min={1}
                  max={24}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter hours (1-24)"
                  value={customExpiration}
                  onChange={e => {
                    const val = Math.max(1, Math.min(24, Number(e.target.value)));
                    setCustomExpiration(val.toString());
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">Max expiration is 24 hours.</p>
              </div>
            )}
            <div className="mt-4">
              <Toggle
                checked={deleteOnDownload}
                onCheckedChange={setDeleteOnDownload}
                label="Delete after first download"
              />
            </div>
          </div>
          {/* Password protection UI */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1 items-center gap-1">
              Password (optional)
              <span className="ml-1" title="Password is never stored. Only those with the password can decrypt the file.">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#64748b" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="12" fill="#64748b">?</text></svg>
              </span>
            </label>
            <div className="relative mb-2">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded px-3 py-2 pr-10"
                placeholder="Set a password to require for download"
                value={password}
                onChange={e => setPassword(e.target.value)}
                aria-label="Password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                className="w-full border rounded px-3 py-2 pr-10"
                placeholder="Confirm password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                aria-label="Confirm password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                onClick={() => setShowPasswordConfirm(v => !v)}
                aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
              >
                {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Password strength meter */}
            {password && (
              <div className="mt-2">
                <div className="w-full h-2 bg-slate-200 rounded">
                  <div
                    className={`h-2 rounded transition-all ${getPasswordStrength(password) <= 2 ? 'bg-red-400 w-1/5' : getPasswordStrength(password) === 3 ? 'bg-yellow-400 w-3/5' : 'bg-green-500 w-full'}`}
                    style={{ width: `${getPasswordStrength(password) * 20}%` }}
                  />
                </div>
                <div className="text-xs mt-1 text-slate-500">
                  {getPasswordStrength(password) <= 2 ? 'Weak' : getPasswordStrength(password) === 3 ? 'Medium' : 'Strong'}
                </div>
              </div>
            )}
            {passwordError && <div className="text-xs text-red-600 mt-1">{passwordError}</div>}
          </div>
          {file && !uploading && (
            <Button className="w-full mb-4" onClick={handleUpload}>
              Encrypt, Upload & Generate Link
            </Button>
          )}
          {uploading && (
            <div className="mb-4">
              <Progress value={progress} />
              <p className="text-xs text-slate-500 mt-2">Uploading... {progress}%</p>
            </div>
          )}
          {error && (
            <div className="mb-4 text-red-600 text-sm" role="alert">{error}</div>
          )}
        </div>
        {/* Step 2: Share Link */}
        {shareUrl && uploadedFileInfo && (
          <div className="flex flex-col items-center gap-6 mt-6 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold">2</span>
              <span className="font-semibold text-green-700">Share this link</span>
            </div>
            <div className="w-full bg-slate-50 rounded p-4 border text-left">
              <div className="font-semibold text-slate-800 mb-1">{uploadedFileInfo.name}</div>
              <div className="text-xs text-slate-500 mb-1">{uploadedFileInfo.type || 'Unknown type'}</div>
              <div className="text-xs text-slate-500 mb-1">Size: {uploadedFileInfo.size ? `${(uploadedFileInfo.size/1024).toFixed(2)} KB` : 'Unknown'}</div>
              <div className="text-xs text-slate-500 mb-1">Expires in: {uploadedFileInfo.expiration} hour{uploadedFileInfo.expiration === 1 ? '' : 's'}</div>
              <div className="text-xs text-slate-500 mb-1">Delete after first download: {uploadedFileInfo.deleteOnDownload ? 'Yes' : 'No'}</div>
            </div>
            {/* Preview */}
            {file && getFileType(uploadedFileInfo.name) === 'image' && (
              <img src={URL.createObjectURL(file)} alt="Preview" className="max-w-full max-h-64 rounded border" />
            )}
            {file && getFileType(uploadedFileInfo.name) === 'pdf' && (
              <iframe src={URL.createObjectURL(file)} className="w-full h-64 rounded border" title="PDF Preview" />
            )}
            {file && getFileType(uploadedFileInfo.name) === 'text' && textPreview && (
              <pre className="bg-slate-100 rounded p-2 mb-4 max-h-64 overflow-auto text-xs w-full">{textPreview}</pre>
            )}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200 shadow-sm">
                <LinkIcon className="h-4 w-4 text-green-600" />
                <input
                  className="text-green-700 underline break-all font-semibold bg-transparent border-none w-64 md:w-96 focus:outline-none"
                  value={shareUrl}
                  readOnly
                  aria-label="Share link"
                  onFocus={e => e.target.select()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 1500);
                  }}
                  aria-label="Copy link"
                >
                  Copy
                </Button>
                {copySuccess && <span className="ml-2 text-green-600 text-xs">Copied!</span>}
              </div>
              <div className="bg-white p-4 rounded shadow border border-green-100">
                <QRCode value={shareUrl} size={160} />
                <div className="text-xs text-slate-500 mt-2 text-center">Scan to access this file</div>
              </div>
            </div>
            <div className="text-green-700 text-center mt-4">
              <b>Success!</b> Your file is ready to share. Only those with this link (and password, if set) can access it.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 