'use client';

import { 
  HardDrive, 
  ChevronRight, 
  Search,
  ArrowLeft
} from 'lucide-react';

interface DriveFolder {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  created_at: string;
  updated_at: string;
}

interface BreadcrumbBarProps {
  searchQuery: string;
  onClearSearch?: () => void;
  searchResults?: { files: any[], folders: any[] };
  currentFolder: string | null;
  breadcrumbPath: DriveFolder[];
  onNavigateToFolder: (folderId: string | null) => void;
}

export function BreadcrumbBar({
  searchQuery,
  onClearSearch,
  searchResults,
  currentFolder,
  breadcrumbPath,
  onNavigateToFolder
}: BreadcrumbBarProps) {
  if (searchQuery) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results for "{searchQuery}"
            </h2>
            <span className="text-sm text-gray-500">
              ({(searchResults?.files?.length || 0) + (searchResults?.folders?.length || 0)} results)
            </span>
          </div>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <nav className="flex items-center" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          <li>
            <button
              onClick={() => onNavigateToFolder(null)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <HardDrive className="h-4 w-4 mr-2" />
              Home
            </button>
          </li>
          {breadcrumbPath.map((folder, index) => (
            <li key={folder.id} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => onNavigateToFolder(folder.id)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors ml-1"
              >
                {folder.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
} 