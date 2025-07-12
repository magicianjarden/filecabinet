'use client';

import Link from 'next/link';
import { Github } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/convert', label: 'Convert' },
    { href: '/share', label: 'Share' },
  ];
  return (
    <header className="border-b-2 border-green-100 bg-white sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight text-gradient">
          filecabinet
        </Link>
        <nav>
          <ul className="flex items-center gap-6">
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-slate-600 hover:text-green-600 transition-colors px-2 py-1 rounded-md font-medium ${pathname === link.href ? 'bg-green-100 text-green-700' : ''}`}
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
                className="text-slate-600 hover:text-green-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 