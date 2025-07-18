import { supabaseClient } from './auth';

// Generate a random encryption key
export const generateEncryptionKey = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(32));
};

// Generate a random initialization vector
export const generateIV = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(12));
};

// Convert ArrayBuffer to base64 string
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 string to ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Encrypt data using AES-GCM
export const encryptData = async (
  data: ArrayBuffer,
  key: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> => {
  const iv = generateIV();
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );
  return { encryptedData, iv };
};

// Decrypt data using AES-GCM
export const decryptData = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> => {
  return await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedData
  );
};

// Import encryption key from raw key material
export const importEncryptionKey = async (keyMaterial: ArrayBuffer | Uint8Array): Promise<CryptoKey> => {
  const buffer = keyMaterial instanceof Uint8Array ? keyMaterial : keyMaterial;
  return await crypto.subtle.importKey(
    'raw',
    buffer,
    {
      name: 'AES-GCM',
    },
    false,
    ['encrypt', 'decrypt']
  );
};

// Encrypt a file with a new key
export const encryptFile = async (file: File): Promise<{
  encryptedData: ArrayBuffer;
  encryptionKey: Uint8Array;
  iv: Uint8Array;
}> => {
  const encryptionKey = generateEncryptionKey();
  const key = await importEncryptionKey(encryptionKey);
  const fileBuffer = await file.arrayBuffer();
  const { encryptedData, iv } = await encryptData(fileBuffer, key);
  
  return {
    encryptedData,
    encryptionKey,
    iv,
  };
};

// Decrypt a file
export const decryptFile = async (
  encryptedData: ArrayBuffer,
  encryptionKey: Uint8Array,
  iv: Uint8Array
): Promise<ArrayBuffer> => {
  const key = await importEncryptionKey(encryptionKey);
  return await decryptData(encryptedData, key, iv);
};

// Create a blob URL for decrypted file
export const createFileBlob = (decryptedData: ArrayBuffer, mimeType: string): string => {
  const blob = new Blob([decryptedData], { type: mimeType });
  return URL.createObjectURL(blob);
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on MIME type
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  if (mimeType.includes('text/')) return '📄';
  return '📁';
}; 