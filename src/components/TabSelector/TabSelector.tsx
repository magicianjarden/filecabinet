'use client';

import { FileText, Image, Film } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabSelectorProps {
  activeTab: 'document' | 'image' | 'media';
  onTabChange: (tab: 'document' | 'image' | 'media') => void;
}

const tabs = [
  {
    id: 'document',
    label: 'Documents',
    icon: FileText,
  },
  {
    id: 'image',
    label: 'Images',
    icon: Image,
  },
  {
    id: 'media',
    label: 'Media',
    icon: Film,
  },
] as const;

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="inline-flex p-1 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center px-4 py-2 rounded-md transition-all duration-200",
                "hover:bg-black/5",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
                isActive && "bg-black text-white hover:bg-black/90"
              )}
            >
              <Icon className="w-5 h-5 mr-2" />
              <span className="font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      <p className="text-sm text-gray-500 font-medium">
        {activeTab === 'document' && 'Convert PDFs, Word documents, and more'}
        {activeTab === 'image' && 'Convert JPG, PNG, WebP, and other formats'}
        {activeTab === 'media' && 'Convert video and audio files'}
      </p>
    </div>
  );
} 