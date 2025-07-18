'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Folder, 
  HardDrive, 
  User, 
  Search,
  Home,
  Star,
  Clock,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  FileSpreadsheet,
  Presentation,
  Code,
  BarChart3,
  Zap,
  Loader2,
  ArrowLeft
} from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
  folder_id: string | null;
}

interface DriveFolder {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  user: any;
  driveUser: any;
  currentFolder: string | null;
  setCurrentFolder: (folderId: string | null) => void;
  onUpload: () => void;
  onCreateFolder: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  user,
  driveUser,
  currentFolder,
  setCurrentFolder,
  onUpload,
  onCreateFolder,
  onSearch,
  searchQuery,
  collapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [recentFiles, setRecentFiles] = useState<DriveFile[]>([]);
  const [allUserFiles, setAllUserFiles] = useState<DriveFile[]>([]);
  const [allUserFolders, setAllUserFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageExpanded, setStorageExpanded] = useState(false);
  const [currentFolderPath, setCurrentFolderPath] = useState<DriveFolder[]>([]);
  const [storageStats, setStorageStats] = useState({
    total: 0,
    used: 0,
    percentage: 0,
    byType: {
      images: 0,
      documents: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      other: 0
    }
  });

  // Fetch all user data
  useEffect(() => {
    const fetchAllUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        console.log('Fetching data for user:', user.id);
        
        // Fetch all files
        const filesResponse = await fetch(`/api/drive/all-files?userId=${user.id}`);
        const filesData = await filesResponse.json();
        
        // Fetch all folders
        const foldersResponse = await fetch(`/api/drive/all-folders?userId=${user.id}`);
        const foldersData = await foldersResponse.json();
        
        console.log('Files response:', filesResponse.status, filesData);
        console.log('Folders response:', foldersResponse.status, foldersData);
        
        if (filesResponse.ok && foldersResponse.ok) {
          setAllUserFiles(filesData.files || []);
          setAllUserFolders(foldersData.folders || []);
          console.log('Set files:', filesData.files?.length || 0);
          console.log('Set folders:', foldersData.folders?.length || 0);
        } else {
          console.error('API responses not ok:', filesResponse.status, foldersResponse.status);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUserData();
  }, [user]);

  // Build current folder path
  useEffect(() => {
    const buildFolderPath = async () => {
      if (!currentFolder || !allUserFolders.length) {
        setCurrentFolderPath([]);
        return;
      }

      const path: DriveFolder[] = [];
      let currentFolderId: string | null = currentFolder;

      // Build the breadcrumb path by traversing up the folder hierarchy
      while (currentFolderId) {
        const folder = allUserFolders.find(f => f.id === currentFolderId);
        if (folder) {
          path.unshift(folder);
          currentFolderId = folder.parent_id || null;
        } else {
          break;
        }
      }

      setCurrentFolderPath(path);
    };

    buildFolderPath();
  }, [currentFolder, allUserFolders]);

  // Calculate storage stats from all user files
  useEffect(() => {
    const total = driveUser?.storage_limit || 0;
    const used = driveUser?.storage_used || 0;
    const percentage = total > 0 ? (used / total) * 100 : 0;

    const byType = {
      images: 0,
      documents: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      other: 0
    };

    allUserFiles.forEach(file => {
      if (file.mime_type.startsWith('image/')) {
        byType.images += file.size;
      } else if (file.mime_type.startsWith('video/')) {
        byType.videos += file.size;
      } else if (file.mime_type.startsWith('audio/')) {
        byType.audio += file.size;
      } else if (file.mime_type.includes('pdf') || file.mime_type.includes('document') || file.mime_type.includes('text')) {
        byType.documents += file.size;
      } else if (file.mime_type.includes('zip') || file.mime_type.includes('rar') || file.mime_type.includes('tar')) {
        byType.archives += file.size;
      } else {
        byType.other += file.size;
      }
    });

    setStorageStats({ total, used, percentage, byType });
  }, [allUserFiles, driveUser]);

  // Get recent files from all user files (last 5)
  useEffect(() => {
    const recent = [...allUserFiles]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    setRecentFiles(recent);
  }, [allUserFiles]);

  // Helper function to count all nested folders recursively
  const countAllFolders = (folders: DriveFolder[]): number => {
    return folders.length;
  };

  // Helper function to count all nested files recursively
  const countAllFiles = (files: DriveFile[]): number => {
    return files.length;
  };

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };

  const navigateToParent = () => {
    if (currentFolderPath.length > 0) {
      const parentFolder = currentFolderPath[currentFolderPath.length - 2];
      if (parentFolder) {
        setCurrentFolder(parentFolder.id);
      } else {
        setCurrentFolder(null);
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-green-500" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-4 w-4 text-blue-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <Archive className="h-4 w-4 text-orange-500" />;
    if (mimeType.includes('spreadsheet')) return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    if (mimeType.includes('presentation')) return <Presentation className="h-4 w-4 text-red-600" />;
    if (mimeType.includes('code') || mimeType.includes('script')) return <Code className="h-4 w-4 text-gray-600" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Render complete tree structure under a folder
  const renderCompleteTree = (parentId: string | null, level: number = 0) => {
    const childFolders = allUserFolders.filter(folder => folder.parent_id === parentId);
    const childFiles = allUserFiles.filter(file => file.folder_id === parentId);
    
    // Sort folders and files by name
    const sortedFolders = [...childFolders].sort((a, b) => a.name.localeCompare(b.name));
    const sortedFiles = [...childFiles].sort((a, b) => a.original_name.localeCompare(b.original_name));
    
    const allItems = [...sortedFolders, ...sortedFiles];
    
    return allItems.map(item => {
      const isFolder = 'parent_id' in item;
      const folder = item as DriveFolder;
      const file = item as DriveFile;
      
      if (isFolder) {
        const hasChildren = allUserFolders.some(f => f.parent_id === folder.id) || 
                           allUserFiles.some(f => f.folder_id === folder.id);
        
        return (
          <div key={folder.id}>
            <div 
              className={`flex items-center space-x-2 py-1 px-2 rounded-md cursor-pointer transition-colors ${
                currentFolder === folder.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleFolderClick(folder.id)}
              style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
              <button
                onClick={(e) => toggleFolder(folder.id, e)}
                className="flex items-center justify-center w-4 h-4 hover:bg-gray-200 rounded"
              >
                {hasChildren ? (
                  expandedFolders.has(folder.id) ? 
                    <ChevronDown className="h-3 w-3" /> : 
                    <ChevronRight className="h-3 w-3" />
                ) : (
                  <div className="w-3 h-3" />
                )}
              </button>
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm truncate flex-1">{folder.name}</span>
            </div>
            {expandedFolders.has(folder.id) && renderCompleteTree(folder.id, level + 1)}
          </div>
        );
      } else {
        return (
          <div 
            key={file.id}
            className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-gray-50 transition-colors"
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            <div className="w-4 h-4" /> {/* Spacer for alignment */}
            {getFileIcon(file.mime_type)}
            <span className="text-sm truncate flex-1">{file.original_name}</span>
          </div>
        );
      }
    });
  };

  if (loading) {
    return (
      <div className={`${collapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  // Collapsed sidebar - icon only
  if (collapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300">
        {/* Toggle Button */}
        <div className="p-2 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full h-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Storage Icon */}
        <div className="p-2 border-b border-gray-200 flex justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <HardDrive className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2 space-y-2">
          <Button 
            onClick={onUpload} 
            variant="ghost"
            size="sm"
            className="w-full h-8 p-0"
            title="Upload File"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button 
            onClick={onCreateFolder} 
            variant="ghost"
            size="sm"
            className="w-full h-8 p-0"
            title="New Folder"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 p-2 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolder(null)}
            className={`w-full h-8 p-0 ${
              currentFolder === null ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
            }`}
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 p-0 hover:bg-gray-50"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>


      </div>
    );
  }

  // Expanded sidebar - full content
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300">
      {/* Storage Stats Card Section */}
      <div className="p-6 border-b border-gray-200">
        <Card className="rounded-xl shadow-sm relative">
          <CardContent className="p-5 pb-4">
            {/* Collapse Button - positioned absolutely in top-right corner */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="absolute top-3 right-3 h-7 w-7 p-0 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-3 w-3 text-gray-500" />
            </Button>
            
            {/* Storage Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <HardDrive className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Storage</h3>
                <p className="text-sm text-gray-500">Drive usage & stats</p>
              </div>
            </div>
            
            {/* Storage Overview */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Used Space</span>
                <span className="font-semibold text-black">{formatFileSize(storageStats.used)} / {storageStats.total ? formatFileSize(storageStats.total) : '10 GB'}</span>
              </div>
              <Progress value={storageStats.percentage} className="h-2 bg-gray-100" />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{Math.round(storageStats.percentage)}% used</span>
                <span>{formatFileSize(storageStats.total - storageStats.used)} available</span>
              </div>
            </div>
            
            {/* Storage Breakdown */}
            <div className="mb-4">
              <div 
                className="flex items-center justify-between text-sm text-gray-600 mb-2 cursor-pointer hover:bg-gray-50 rounded p-1 -m-1"
                onClick={() => setStorageExpanded(!storageExpanded)}
              >
                <span className="font-medium">By Type</span>
                {storageExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </div>
              
              {/* Storage Breakdown Dropdown */}
              {storageExpanded && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {storageStats.byType.images > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Image className="h-3 w-3 text-green-500" />
                        <span className="text-gray-600">Images</span>
                      </div>
                      <span className="text-gray-500">{formatFileSize(storageStats.byType.images)}</span>
                    </div>
                  )}
                  {storageStats.byType.documents > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3 w-3 text-red-500" />
                        <span className="text-gray-600">Documents</span>
                      </div>
                      <span className="text-gray-500">{formatFileSize(storageStats.byType.documents)}</span>
                    </div>
                  )}
                  {storageStats.byType.videos > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <FileVideo className="h-3 w-3 text-purple-500" />
                        <span className="text-gray-600">Videos</span>
                      </div>
                      <span className="text-gray-500">{formatFileSize(storageStats.byType.videos)}</span>
                    </div>
                  )}
                  {storageStats.byType.audio > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <FileAudio className="h-3 w-3 text-blue-500" />
                        <span className="text-gray-600">Audio</span>
                      </div>
                      <span className="text-gray-500">{formatFileSize(storageStats.byType.audio)}</span>
                    </div>
                  )}
                  {storageStats.byType.archives > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Archive className="h-3 w-3 text-orange-500" />
                        <span className="text-gray-600">Archives</span>
                      </div>
                      <span className="text-gray-500">{formatFileSize(storageStats.byType.archives)}</span>
                    </div>
                  )}
                  {storageStats.byType.other > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-600">Other</span>
                      </div>
                      <span className="text-gray-500">{formatFileSize(storageStats.byType.other)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* File Counts */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>{allUserFiles.length} files</span>
              <span>{allUserFolders.length} folders</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pt-4 pb-2">
        <div className="space-y-2">
          <Button 
            onClick={onUpload} 
            className="w-full justify-start" 
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
          <Button 
            onClick={onCreateFolder} 
            variant="outline" 
            className="w-full justify-start" 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Access</h3>
          
          {/* Home */}
          <button
            onClick={() => setCurrentFolder(null)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              currentFolder === null 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>

          {/* Folder Tree */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <Folder className="h-4 w-4 mr-2" />
                Navigate
              </h3>
              {currentFolder && (
                <button
                  onClick={navigateToParent}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back</span>
                </button>
              )}
            </div>

            {/* Current Location Breadcrumb */}
            {currentFolderPath.length > 0 && (
              <div className="mb-3 p-2 bg-gray-50 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Current Location:</div>
                <div className="flex items-center space-x-1 text-sm">
                  {currentFolderPath.map((folder, index) => (
                    <div key={folder.id} className="flex items-center">
                      <button
                        onClick={() => setCurrentFolder(folder.id)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {folder.name}
                      </button>
                      {index < currentFolderPath.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-gray-400 mx-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Folder Tree */}
            <div className="space-y-1">
              {renderCompleteTree(currentFolder || null)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Recent Files
          </h3>
          <div className="space-y-1">
            {recentFiles.map(file => (
              <button
                key={file.id}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {getFileIcon(file.mime_type)}
                <div className="flex-1 min-w-0 text-left">
                  <p className="truncate">{file.original_name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
} 