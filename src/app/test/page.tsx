'use client';

import { FileUpload } from '@/components/FileUpload';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <FileUpload />
      </div>
    </div>
  );
}