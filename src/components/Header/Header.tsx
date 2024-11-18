'use client';

import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b-2 border-green-100 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-gradient">
            filecabinet
          </h1>
          <nav>
            <ul className="flex items-center gap-4">
              <li>
                <a 
                  href="https://magicianjarden/filecabinet" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-green-600 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
} 