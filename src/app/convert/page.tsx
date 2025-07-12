'use client';

import { FileUpload } from '@/components/FileUpload';
import { SupportedFormats } from '@/components/SupportedFormats';
import { Header } from '@/components/Header';
import { motion } from 'framer-motion';

export default function ConvertPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <section>
          <div className="max-w-4xl mx-auto">
            <FileUpload />
          </div>
        </section>
        <section className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 space-y-2"
          >
            <h2 className="text-2xl font-bold text-slate-900">
              Supported Formats
            </h2>
            <p className="text-slate-600">
              Convert between any of these file formats with ease
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SupportedFormats />
          </motion.div>
        </section>
      </main>
    </div>
  );
} 