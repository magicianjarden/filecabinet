'use client';

import { Header } from '@/components/Header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileDown, Share2, ShieldCheck, Lock, Zap, ArrowRightCircle, Bug, Info, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100 flex flex-col relative overflow-x-hidden">
      <Header />
      {/* Playful background shapes */}
      <div className="absolute top-0 left-0 w-full h-96 pointer-events-none z-0">
        <svg className="absolute left-[-80px] top-[-80px] opacity-30" width="320" height="320" viewBox="0 0 320 320" fill="none"><circle cx="160" cy="160" r="160" fill="#bbf7d0" /></svg>
        <svg className="absolute right-[-100px] top-24 opacity-20" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" rx="80" fill="#bae6fd" /></svg>
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12 z-10 relative">
        {/* Hero Section */}
        <div className="max-w-2xl w-full text-center space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-green-700 drop-shadow mb-2 animate-fade-in">filecabinet</h1>
          <p className="text-2xl md:text-3xl font-bold text-blue-700 mb-2 animate-fade-in-slow">The simple, privacy-first file toolbox</p>
          <p className="text-lg md:text-xl text-slate-600 mb-4 animate-fade-in-slower">
            Convert, share, and scan files with zero-knowledge privacy. No sign-up, no tracking, just simple tools that work.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-2 animate-fade-in-slower">
            <Badge className="flex items-center gap-1 bg-green-200 text-green-900 border-green-300 shadow hover:scale-110 transition-transform cursor-pointer"><Zap className="h-4 w-4" /> Fast & Fun</Badge>
            <Badge className="flex items-center gap-1 bg-blue-200 text-blue-900 border-blue-300 shadow hover:scale-110 transition-transform cursor-pointer"><ShieldCheck className="h-4 w-4" /> Secure Sharing</Badge>
            <Badge className="flex items-center gap-1 bg-yellow-200 text-yellow-900 border-yellow-300 shadow hover:scale-110 transition-transform cursor-pointer"><Lock className="h-4 w-4" /> Zero-Knowledge</Badge>
            <Badge className="flex items-center gap-1 bg-red-200 text-red-900 border-red-300 shadow hover:scale-110 transition-transform cursor-pointer"><Bug className="h-4 w-4" /> Virus Scan</Badge>
          </div>
        </div>
        {/* Animated Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl mb-16 animate-fade-in-slower">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all duration-200 p-8 flex flex-col items-center group relative overflow-hidden animate-bounce-in">
            <div className="absolute -top-8 -right-8 opacity-10 rotate-12"><FileDown className="w-32 h-32 text-green-200" /></div>
            <FileDown className="h-12 w-12 text-green-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
            <h2 className="text-2xl font-bold mb-2 text-green-700">File Conversion</h2>
            <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-2 mb-2">
              <li>Upload or drag & drop your file</li>
              <li>Select your desired format</li>
              <li>Download instantly</li>
            </ol>
            <div className="text-xs text-slate-500 mb-2">Files are processed securely, but not end-to-end encrypted.</div>
            <Link href="/convert"><Button className="w-full group transition-all duration-200 bg-green-100 text-green-800 hover:bg-green-200">Try Converter <ArrowRightCircle className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" /></Button></Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-200 p-8 flex flex-col items-center group relative overflow-hidden animate-bounce-in-delay">
            <div className="absolute -top-8 -right-8 opacity-10 -rotate-12"><Share2 className="w-32 h-32 text-blue-200" /></div>
            <Share2 className="h-12 w-12 text-blue-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
            <h2 className="text-2xl font-bold mb-2 text-blue-700">File Sharing</h2>
            <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-2 mb-2">
              <li>Encrypt and upload your file</li>
              <li>Get a secure, private link</li>
              <li>Share with confidence</li>
            </ol>
            <div className="text-xs text-blue-700 mb-2 font-medium flex items-center gap-1"><Lock className="h-4 w-4" /> Zero-knowledge: Only you and your recipient can decrypt.</div>
            <Link href="/share"><Button className="w-full group transition-all duration-200 bg-blue-100 text-blue-800 hover:bg-blue-200">Try Sharing <ArrowRightCircle className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" /></Button></Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 hover:border-red-400 hover:shadow-2xl transition-all duration-200 p-8 flex flex-col items-center group relative overflow-hidden animate-bounce-in-delay2">
            <div className="absolute -top-8 -right-8 opacity-10 rotate-6"><Bug className="w-32 h-32 text-red-200" /></div>
            <Bug className="h-12 w-12 text-red-500 mb-2 group-hover:scale-110 transition-transform duration-200" />
            <h2 className="text-2xl font-bold mb-2 text-red-700">Virus Scan</h2>
            <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-2 mb-2">
              <li>Upload or drag & drop your file</li>
              <li>Scan for viruses and malware</li>
              <li>Get instant results</li>
            </ol>
            <div className="text-xs text-red-700 mb-2 font-medium flex items-center gap-1"><Bug className="h-4 w-4" /> Privacy: Files are scanned in-memory and not stored.</div>
            <Link href="/scan"><Button className="w-full group transition-all duration-200 bg-red-100 text-red-800 hover:bg-red-200">Try Virus Scan <ArrowRightCircle className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" /></Button></Link>
          </div>
        </div>
        {/* Privacy/Trust Section */}
        <div className="max-w-2xl w-full mx-auto mt-12 mb-8 animate-fade-in-slower">
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
        <div className="max-w-2xl w-full mx-auto mb-12 mt-16 animate-fade-in-slower">
          <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2 animate-fade-in"> Privacy & Transparency</h2>
          <div className="bg-white/80 border border-green-100 rounded-xl p-6 shadow space-y-8 text-slate-700 text-sm">
            {/* 1. No Accounts, No Personal Data */}
            <div className="flex items-start gap-3 group">
              <Lock className="h-6 w-6 text-yellow-500 flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-yellow-700 flex items-center gap-1 animate-fade-in">No Accounts, No Personal Data</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>No sign-up, no login, ever.</li>
                  <li>We never ask for your name, email, or any personal identifier.</li>
                  <li>You can use all features anonymously.</li>
                </ul>
              </div>
            </div>
            {/* 2. File Handling & Encryption */}
            <div className="flex items-start gap-3 group">
              <ShieldCheck className="h-6 w-6 text-blue-500 flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-blue-700 flex items-center gap-1 animate-fade-in">File Handling & Encryption</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><b>File Sharing & Requests:</b> Files are encrypted in your browser before upload (zero-knowledge). Only you and your recipient have the decryption key. We cannot access, view, or decrypt your files.</li>
                  <li><b>File Conversion:</b> Files are uploaded to our server for conversion. They are not end-to-end encrypted, but are deleted immediately after processing. We do not retain or inspect your files.</li>
                  <li><b>Virus Scan:</b> Files are scanned in-memory and never stored. Scan results are not saved or shared.</li>
                </ul>
              </div>
            </div>
            {/* 3. Conversion, Sharing, and Virus Scan: What Happens to Your Files */}
            <div className="flex items-start gap-3 group">
              <FileDown className="h-6 w-6 text-green-500 flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-green-700 flex items-center gap-1 animate-fade-in">What Happens to Your Files?</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><b>Conversion:</b> Files are processed securely, then deleted.</li>
                  <li><b>Sharing/Requests:</b> Encrypted files and minimal metadata (filename, size, type, expiration) are stored temporarily for download. Files and metadata are deleted after expiration or download (if set).</li>
                  <li><b>Virus Scan:</b> Files are never written to disk or retained after scanning.</li>
                </ul>
              </div>
            </div>
            {/* 4. Cookies & Tracking */}
            <div className="flex items-start gap-3 group">
              <Bug className="h-6 w-6 text-pink-500 flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-pink-700 flex items-center gap-1 animate-fade-in">Cookies & Tracking</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>No tracking cookies, no analytics, no ads.</li>
                  <li>We use only essential cookies for session security (if any).</li>
                  <li>No third-party trackers or advertising pixels.</li>
                </ul>
              </div>
            </div>
            {/* 5. Technical Logs & Analytics */}
            <div className="flex items-start gap-3 group">
              <Info className="h-6 w-6 text-slate-500 flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-slate-700 flex items-center gap-1 animate-fade-in">Technical Logs & Analytics</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Minimal, anonymous technical logs only.</li>
                  <li>We may log error messages or aggregate usage counts for reliability.</li>
                  <li>Logs never include file contents or personal data.</li>
                </ul>
              </div>
            </div>
            {/* 6. Session & History */}
            <div className="flex items-start gap-3 group">
              <Share2 className="h-6 w-6 text-purple-500 flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-purple-700 flex items-center gap-1 animate-fade-in">Session & History</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Your file history is stored only in your browser (local/session storage).</li>
                  <li>We never send your history to our servers.</li>
                </ul>
              </div>
            </div>
            {/* 7. Open Source & Transparency */}
            <div className="flex items-start gap-3 group">
              <Github className="h-6 w-6 text-black flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-black flex items-center gap-1 animate-fade-in">Open Source & Transparency</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Our code is open source.</li>
                  <li>You can review how everything works on <a href="https://github.com/magicianjarden/filecabinet" className="underline text-green-700" target="_blank" rel="noopener noreferrer">GitHub</a>.</li>
                  <li>We welcome feedback and contributions.</li>
                </ul>
              </div>
            </div>
            {/* 8. Contact & Questions */}
            <div className="flex items-start gap-3 group">
              <Info className="h-6 w-6 text-green-600 flex-shrink-0 animate-fade-in group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-base mb-1 text-green-700 flex items-center gap-1 animate-fade-in">Contact & Questions</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Questions or concerns? Email us at <a href="mailto:hello@magicianjarden.com" className="underline text-green-700">hello@magicianjarden.com</a></li>
                  <li>We’re committed to privacy and transparency.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-sm text-gray-500 bg-gradient-to-t from-blue-50 to-transparent w-full mt-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4 mb-2">
            <a href="https://github.com/magicianjarden/filecabinet" target="_blank" rel="noopener noreferrer" className="hover:text-green-700 transition-colors" aria-label="GitHub"><Github className="w-5 h-5" /></a>
            <a href="mailto:hello@magicianjarden.com" className="hover:text-green-700 transition-colors" aria-label="Email"><Info className="w-5 h-5" /></a>
          </div>
          <p>Built with <span className="text-red-500">♥</span> by magicianjarden</p>
        </div>
      </footer>
      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        @keyframes fade-in-slow { from { opacity: 0; transform: translateY(48px); } to { opacity: 1; transform: none; } }
        @keyframes fade-in-slower { from { opacity: 0; transform: translateY(64px); } to { opacity: 1; transform: none; } }
        @keyframes bounce-in { 0% { transform: scale(0.9) translateY(40px); opacity: 0; } 60% { transform: scale(1.05) translateY(-8px); opacity: 1; } 100% { transform: scale(1) translateY(0); } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-slow { animation: fade-in-slow 1.1s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-slower { animation: fade-in-slower 1.5s cubic-bezier(.4,0,.2,1) both; }
        .animate-bounce-in { animation: bounce-in 1.1s cubic-bezier(.4,0,.2,1) both; }
        .animate-bounce-in-delay { animation: bounce-in 1.3s cubic-bezier(.4,0,.2,1) both; }
        .animate-bounce-in-delay2 { animation: bounce-in 1.5s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
}
