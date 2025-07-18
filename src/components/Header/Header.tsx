'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FileDown, Menu, X, Zap } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/convert', label: 'Convert' },
    { href: '/share', label: 'Share' },
    { href: '/scan', label: 'Scan' },
    { href: '/drive', label: 'Drive' },
  ];
  return (
    <header className="border-b-2 border-green-100 bg-gradient-to-r from-green-50 via-white to-blue-50 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        <Link href="/" className="text-2xl font-black tracking-tight text-gradient">
          filecabinet
        </Link>
        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-3">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm hover:scale-105 focus-visible:ring-2 focus-visible:ring-green-400 outline-none
                    ${pathname === link.href ? 'bg-green-200 text-green-900' : 'bg-white/70 text-slate-600 hover:bg-green-100 hover:text-green-700'}`}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a 
                href="https://github.com/magicianjarden/filecabinet" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-400 outline-none"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </li>
          </ul>
        </nav>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-400 outline-none transition-all"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X className="w-7 h-7 text-green-600" /> : <Menu className="w-7 h-7 text-green-600" />}
        </button>
        {/* Mobile Dropdown Nav */}
        <div
          className={`absolute left-0 top-full w-full bg-white/95 border-b-2 border-green-100 shadow-lg rounded-b-2xl z-40 flex flex-col items-center py-4 gap-2 md:hidden transition-all duration-150 ease-out
            ${menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
          style={{ willChange: 'opacity, transform' }}
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`w-11/12 text-center px-4 py-3 rounded-full font-medium text-lg transition-all duration-200 shadow-sm mb-1 hover:scale-105 focus-visible:ring-2 focus-visible:ring-green-400 outline-none
                ${pathname === link.href ? 'bg-green-200 text-green-900' : 'bg-white/70 text-slate-600 hover:bg-green-100 hover:text-green-700'}`}
              aria-current={pathname === link.href ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a 
            href="https://github.com/magicianjarden/filecabinet" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-11/12 flex items-center justify-center gap-2 text-slate-600 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-400 outline-none"
            aria-label="GitHub"
            onClick={() => setMenuOpen(false)}
          >
            <Github className="w-5 h-5" /> <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
} 