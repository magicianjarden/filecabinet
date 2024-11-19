'use client';

import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';
import { SupportedFormats } from '@/components/SupportedFormats';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-16">
        {/* File Upload Section */}
        <section>
          <div className="max-w-4xl mx-auto">
            <FileUpload />
          </div>
        </section>

        {/* Supported Formats Section */}
        <section className="max-w-7xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Supported Formats
            </h2>
            <p className="text-slate-600">
              Convert between any of these file formats with ease
            </p>
          </div>
          <SupportedFormats />
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        <p>Built with love by magicianjarden</p>
      </footer>
    </div>
  );
}
