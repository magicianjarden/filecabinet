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
        {/* Security & Privacy Notice */}
        <section className="max-w-4xl mx-auto mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
            <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5c4.142 0 7.5-3.358 7.5-7.5S16.142 5.5 12 5.5 4.5 8.858 4.5 13s3.358 7.5 7.5 7.5z" /></svg>
            <div>
              <div className="font-semibold text-green-900 mb-1">Security & Privacy Notice</div>
              <div className="text-green-800 text-sm">
                Your files are processed securely and deleted after conversion. We do not store your files after conversion is complete. Your files are never shared with third parties.
                {/* Optionally add a link to a full privacy policy */}
                {/* <a href="/privacy" className="ml-2 underline text-green-700 hover:text-green-900">Learn more</a> */}
              </div>
            </div>
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