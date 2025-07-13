'use client';

import { useState } from 'react';
import SendFileFlow from './SendFileFlow';
import RequestFileFlow from './RequestFileFlow';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, Link as LinkIcon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import QRCode from 'react-qr-code';
import { getTempFile } from '@/lib/utils/utils';
import { useRouter } from 'next/navigation';

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

// Helper: export key to base64
async function exportKeyToBase64(key: CryptoKey) {
  const raw = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(raw))));
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

const EXPIRATION_OPTIONS = [
  { label: '1 hour', value: 1 },
  { label: '2 hours', value: 2 },
  { label: '4 hours', value: 4 },
  { label: '8 hours', value: 8 },
  { label: '12 hours', value: 12 },
  { label: '24 hours (max)', value: 24 },
  { label: 'Custom...', value: 'custom' },
];

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

export default function SharePage() {
  const [tab, setTab] = useState<'send' | 'request'>('send');
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Header />
      <div className="flex items-center justify-center mt-4 mb-2">
        <span className="inline-block bg-yellow-300 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Beta</span>
      </div>
      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-center gap-2 bg-white rounded-lg shadow border p-1">
            <button
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${tab === 'send' ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-100'}`}
              onClick={() => setTab('send')}
              aria-selected={tab === 'send'}
              aria-controls="send-tab"
            >
              Send a File
            </button>
            <button
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${tab === 'request' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-100'}`}
              onClick={() => setTab('request')}
              aria-selected={tab === 'request'}
              aria-controls="request-tab"
            >
              Request a File
            </button>
          </div>
        </div>
        <div className="w-full max-w-2xl">
          {tab === 'send' ? <SendFileFlow /> : <RequestFileFlow />}
        </div>
      </main>
    </div>
  );
} 