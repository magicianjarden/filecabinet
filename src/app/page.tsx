'use client';

import { Header } from '@/components/Header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileDown, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Zap, ArrowRightCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">Welcome to FileCabinet</h1>
          <p className="text-lg md:text-xl text-slate-600 mb-4">
            Effortlessly convert and share files with a modern, privacy-focused platform inspired by the best of <a href='https://palmr.kyantech.com.br/' className='underline text-green-700' target='_blank' rel='noopener noreferrer'>Palmr</a>.
          </p>
          {/* Feature Highlights Row */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Badge className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200 transition-transform duration-200 hover:scale-105 cursor-pointer"><Zap className="h-4 w-4" /> Fast & Modern</Badge>
            <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200 transition-transform duration-200 hover:scale-105 cursor-pointer"><ShieldCheck className="h-4 w-4" /> Secure File Sharing</Badge>
            <Badge className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-200 transition-transform duration-200 hover:scale-105 cursor-pointer"><Lock className="h-4 w-4" /> Zero-Knowledge Sharing</Badge>
          </div>
          {/* Step-by-step visuals for features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white rounded-lg shadow p-6 border border-green-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><FileDown className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-200" /> File Conversion</h2>
              <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-2">
                <li>Upload or drag & drop your file</li>
                <li>Select your desired format</li>
                <li>Download your converted file instantly</li>
              </ol>
              <div className="text-xs text-slate-500 mt-2">Files are processed securely, but not end-to-end encrypted.</div>
              <Link href="/convert">
                <Button className="mt-4 w-full group transition-all duration-200" variant="default">
                  Go to Converter <ArrowRightCircle className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-green-100 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 group">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Share2 className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform duration-200" /> File Sharing</h2>
              <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-2">
                <li>Upload and encrypt your file</li>
                <li>Get a secure, shareable link</li>
                <li>Share with confidence—privacy guaranteed</li>
              </ol>
              <div className="text-xs text-green-700 mt-2 font-medium flex items-center gap-1"><Lock className="h-4 w-4" /> Zero-knowledge: Only you and your recipient can decrypt.</div>
              <Link href="/share">
                <Button className="mt-4 w-full group transition-all duration-200" variant="outline">
                  Share a File <ArrowRightCircle className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Privacy/Trust Section */}
        <div className="max-w-2xl w-full mx-auto mt-12 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl p-6 shadow">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-green-600" />
              <span className="text-lg font-semibold text-green-800">Privacy-First Sharing</span>
            </div>
            <div className="flex-1 text-slate-700 text-sm md:text-base md:pl-6">
              <span className="inline-flex items-center gap-1 font-medium"><Lock className="h-4 w-4 text-yellow-600" /> Zero-Knowledge Encryption:</span> Shared files are encrypted <b>before</b> upload, and only you and your recipient hold the keys. We never see your data—ever. (File conversion is processed securely, but not zero-knowledge.)
            </div>
          </div>
        </div>
        {/* Privacy/Transparency Section */}
        <div className="max-w-2xl w-full mx-auto mb-12 mt-16">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Privacy & Transparency</h2>
          <div className="bg-white/80 border border-green-100 rounded-xl p-6 shadow space-y-3 text-slate-700 text-sm">
            <p><b>What we <span className="text-green-700">do not</span> collect:</b></p>
            <ul className="list-disc list-inside ml-4 mb-2">
              <li><b>No accounts or logins:</b> You do not need to sign up or log in to use FileCabinet.</li>
              <li><b>No personal data:</b> We do not collect your name, email, or any personal identifiers.</li>
              <li><b>No file contents for sharing:</b> Shared files are <b>encrypted in your browser</b> before upload. Only you and your recipient have the decryption key. We cannot access or decrypt your shared files.</li>
              <li><b>No persistent cookies or trackers:</b> We do not use analytics, advertising, or tracking cookies.</li>
            </ul>
            <p><b>What we <span className="text-green-700">do</span> collect:</b></p>
            <ul className="list-disc list-inside ml-4 mb-2">
              <li><b>Minimal technical logs:</b> We may log basic, non-identifying technical information (such as error logs or aggregate usage counts) for debugging and to improve reliability. These logs do <b>not</b> include file contents or personal data.</li>
              <li><b>Temporary file metadata:</b> For file sharing, we store encrypted file blobs and non-sensitive metadata (filename, size, type, expiration) to enable downloads and expiration. This metadata is deleted after expiration or download (if delete-after-download is enabled).</li>
              <li><b>Conversion files:</b> For file conversion, your files are uploaded to our server for processing. They are <b>not</b> end-to-end encrypted, but are deleted immediately after conversion. We do not retain or inspect your files.</li>
              <li><b>Session history (local only):</b> Your conversion history is stored <b>only in your browser memory</b> for your session. It is never sent to our servers.</li>
            </ul>
            <p><b>How FileCabinet works:</b></p>
            <ul className="list-disc list-inside ml-4 mb-2">
              <li><b>File Sharing:</b> Files are encrypted in your browser using AES-GCM. The encryption key is never sent to our server. Only the encrypted file and non-sensitive metadata are uploaded. The share link contains the decryption key (or password-wrapped key) in the URL fragment, which is never sent to the server.</li>
              <li><b>File Conversion:</b> Files are uploaded to our server for conversion. They are processed in-memory and deleted after conversion. No file contents are retained or inspected.</li>
              <li><b>Open Source:</b> The code is open for review. You can verify how everything works on our <a href="https://github.com/magicianjarden/filecabinet" className="underline text-green-700" target="_blank" rel="noopener noreferrer">GitHub</a>.</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">If you have privacy questions or concerns, please <a href="mailto:hello@magicianjarden.com" className="underline text-green-700">contact us</a>.</p>
          </div>
        </div>
        {/* How it Works Section */}
        <div className="max-w-4xl w-full mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8 text-slate-900">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* File Conversion Steps */}
            <div className="bg-white rounded-xl shadow p-6 border border-green-100 flex flex-col items-center">
              <FileDown className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="text-lg font-semibold mb-2">File Conversion</h3>
              <ol className="space-y-3 w-full">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 font-bold">1</span>
                  <span>Upload or drag & drop your file</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 font-bold">2</span>
                  <span>Choose your desired output format</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-700 font-bold">3</span>
                  <span>Download your converted file instantly</span>
                </li>
              </ol>
              <div className="text-xs text-slate-500 mt-2">Files are processed securely, but not end-to-end encrypted.</div>
            </div>
            {/* File Sharing Steps */}
            <div className="bg-white rounded-xl shadow p-6 border border-green-100 flex flex-col items-center">
              <Share2 className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="text-lg font-semibold mb-2">File Sharing</h3>
              <ol className="space-y-3 w-full">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">1</span>
                  <span>Upload and encrypt your file in your browser</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">2</span>
                  <span>Get a secure, private share link</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold">3</span>
                  <span>Share the link—only those with it (and the key) can access your file</span>
                </li>
              </ol>
              <div className="text-xs text-green-700 mt-2 font-medium flex items-center gap-1"><Lock className="h-4 w-4" /> Zero-knowledge: Only you and your recipient can decrypt.</div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>Built with love by magicianjarden</p>
      </footer>
    </div>
  );
}
