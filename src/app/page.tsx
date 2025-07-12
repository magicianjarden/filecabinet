'use client';

import { Header } from '@/components/Header';
import { motion } from 'framer-motion';
import { FileDown } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Header />
      <main className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to FileCabinet</h1>
        <p className="text-slate-600 mb-8">Quickly convert or share your files with ease.</p>
        {/* Optionally, add navigation buttons */}
      </main>
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>Built with love by magicianjarden</p>
      </footer>
    </div>
  );
}
