'use client';

import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <FileUpload />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        <p>Buit with love by magicianjarden</p>
      </footer>
    </div>
  );
}
