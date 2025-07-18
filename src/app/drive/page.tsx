'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IntegratedHeader } from '@/components/Header/IntegratedHeader';
import { BreadcrumbBar } from '@/components/Header/BreadcrumbBar';
import { UploadProgress } from '@/components/FileUpload/UploadProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatFileSize, getFileIcon } from '@/lib/encryption';
import Sidebar from '@/components/Sidebar/Sidebar';
import { 
  Upload, 
  Folder, 
  File, 
  Download, 
  Trash2, 
  ChevronRight,
  Image,
  FileText,
  FileVideo,
  FileAudio,
  Archive,
  FileSpreadsheet,
  Presentation,
  Code,
  MoreVertical,
  Edit,
  Copy,
  Info,
  Menu,
  HardDrive,
  Search,
  Grid3X3,
  List
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

export default function DrivePage() {
  const { user, driveUser, signOut, loading } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ files: DriveFile[], folders: DriveFolder[] }>({ files: [], folders: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<DriveFolder[]>([]);
  const [showFolderMenu, setShowFolderMenu] = useState<string | null>(null);
  const [showFileMenu, setShowFileMenu] = useState<string | null>(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [renameItem, setRenameItem] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [copyItem, setCopyItem] = useState<{ id: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [newName, setNewName] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [allFolders, setAllFolders] = useState<DriveFolder[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchFiles();
      fetchFolders();
      updateBreadcrumbPath();
      fetchAllFolders();
    }
  }, [user, currentFolder]);

  const fetchAllFolders = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/drive/folders?userId=${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setAllFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching all folders:', error);
    }
  };

  useEffect(() => {
    // Global search across all files and folders
    const performSearch = async () => {
      if (!user) return;

      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/drive/search?userId=${user.id}&q=${encodeURIComponent(searchQuery)}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ files: [], folders: [] });
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);



  const fetchFiles = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/drive/files?userId=${user.id}&folderId=${currentFolder || ''}`);
      const data = await response.json();
      
      if (response.ok) {
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchFolders = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/drive/folders?userId=${user.id}&parentId=${currentFolder || ''}`);
      const data = await response.json();
      
      if (response.ok) {
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const updateBreadcrumbPath = async () => {
    if (!user || !currentFolder) {
      setBreadcrumbPath([]);
      return;
    }

    try {
      const path: DriveFolder[] = [];
      let currentFolderId = currentFolder;

      // Build the breadcrumb path by traversing up the folder hierarchy
      while (currentFolderId) {
        const response = await fetch(`/api/drive/folders/${currentFolderId}?userId=${user.id}`);
        if (response.ok) {
          const folder = await response.json();
          path.unshift(folder);
          currentFolderId = folder.parent_id;
        } else {
          break;
        }
      }

      setBreadcrumbPath(path);
    } catch (error) {
      console.error('Error building breadcrumb path:', error);
      setBreadcrumbPath([]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Reset upload state
    setUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);
    if (currentFolder) {
      formData.append('folderId', currentFolder);
    }

    try {
      // Simulate progress for better UX (since we can't get real progress from fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        setUploadProgress(100);
        fetchFiles(); // Refresh file list
      } else {
        const error = await response.json();
        setUploadError(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
        setUploadError('');
      }, 1000); // Keep success state visible for 1 second
    }
  };

  const handleCancelUpload = () => {
    setUploading(false);
    setUploadProgress(0);
    setUploadFileName('');
    setUploadError('');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/signin');
  };

  const handleDownload = async (file: DriveFile) => {
    try {
      const response = await fetch(`/api/drive/files/${file.id}/download?userId=${user?.id}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.original_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  const handleDelete = async (file: DriveFile) => {
    if (!confirm(`Are you sure you want to delete "${file.original_name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/drive/files/${file.id}?userId=${user?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFiles(); // Refresh file list
      } else {
        const error = await response.json();
        alert(error.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/drive/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolder,
          userId: user?.id,
        }),
      });

      if (response.ok) {
        setNewFolderName('');
        setShowNewFolderDialog(false);
        fetchFolders(); // Refresh folder list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Create folder error:', error);
      alert('Failed to create folder');
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || !renameItem || !user) return;

    try {
      const endpoint = renameItem.type === 'file' ? `/api/drive/files/${renameItem.id}` : `/api/drive/folders/${renameItem.id}`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'rename',
          userId: user.id,
          newName: newName,
        }),
      });

      if (response.ok) {
        setShowRenameDialog(false);
        setRenameItem(null);
        setNewName('');
        // Refresh data
        fetchFiles();
        fetchFolders();
        fetchAllFolders();
        updateBreadcrumbPath();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to rename');
      }
    } catch (error) {
      console.error('Rename error:', error);
      alert('Failed to rename');
    }
  };

  const handleCopy = async () => {
    if (!copyItem || !user) return;

    try {
      const response = await fetch(`/api/drive/files/${copyItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'copy',
          userId: user.id,
          targetFolderId: targetFolderId || null,
        }),
      });

      if (response.ok) {
        setShowCopyDialog(false);
        setCopyItem(null);
        setTargetFolderId('');
        // Refresh data
        fetchFiles();
        fetchFolders();
        fetchAllFolders();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to copy file');
      }
    } catch (error) {
      console.error('Copy error:', error);
      alert('Failed to copy file');
    }
  };

  const handleFolderAction = (action: string, folder: DriveFolder) => {
    setShowFolderMenu(null);
    
    switch (action) {
      case 'rename':
        setRenameItem({ id: folder.id, name: folder.name, type: 'folder' });
        setNewName(folder.name);
        setShowRenameDialog(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${folder.name}" and all its contents?`)) {
          // TODO: Implement folder deletion
          alert('Folder deletion coming soon!');
        }
        break;
      case 'info':
        alert(`Folder: ${folder.name}\nCreated: ${new Date(folder.created_at).toLocaleDateString()}\nPath: ${folder.path}`);
        break;
    }
  };

  const handleFileAction = (action: string, file: DriveFile) => {
    setShowFileMenu(null);
    
    switch (action) {
      case 'rename':
        setRenameItem({ id: file.id, name: file.original_name, type: 'file' });
        setNewName(file.original_name);
        setShowRenameDialog(true);
        break;
      case 'copy':
        setCopyItem({ id: file.id, name: file.original_name, type: 'file' });
        setTargetFolderId(currentFolder || '');
        setShowCopyDialog(true);
        break;
      case 'info':
        alert(`File: ${file.original_name}\nSize: ${formatFileSize(file.size)}\nType: ${file.mime_type}\nCreated: ${new Date(file.created_at).toLocaleDateString()}`);
        break;
    }
  };

  // Get file icon component based on MIME type
  const getFileIconComponent = (mimeType: string) => {
    const iconSize = viewMode === 'list' ? 'h-5 w-5' : 'h-6 w-6';
    if (mimeType.startsWith('image/')) return <Image className={`${iconSize} text-blue-500`} />;
    if (mimeType.startsWith('video/')) return <FileVideo className={`${iconSize} text-purple-500`} />;
    if (mimeType.startsWith('audio/')) return <FileAudio className={`${iconSize} text-green-500`} />;
    if (mimeType.includes('pdf')) return <FileText className={`${iconSize} text-red-500`} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className={`${iconSize} text-blue-600`} />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileSpreadsheet className={`${iconSize} text-green-600`} />;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return <Presentation className={`${iconSize} text-orange-500`} />;
    if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('rar')) return <Archive className={`${iconSize} text-yellow-500`} />;
    if (mimeType.includes('text/') || mimeType.includes('javascript') || mimeType.includes('python') || mimeType.includes('json')) return <Code className={`${iconSize} text-gray-600`} />;
    return <File className={`${iconSize} text-gray-500`} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          user={user}
          driveUser={driveUser}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          onUpload={() => document.getElementById('file-upload')?.click()}
          onCreateFolder={() => setShowNewFolderDialog(true)}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Integrated Header */}
        <IntegratedHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearching={isSearching}
          onClearSearch={() => setSearchQuery('')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          user={user}
          driveUser={driveUser}
          onSignOut={handleSignOut}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />

        {/* Breadcrumb Bar */}
        <BreadcrumbBar
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          searchResults={searchResults}
          currentFolder={currentFolder}
          breadcrumbPath={breadcrumbPath}
          onNavigateToFolder={setCurrentFolder}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />

        {/* Files and Folders - Grid or List View */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2"
        }>
          {/* Folders */}
          {(searchQuery ? searchResults.folders : folders).map((folder: DriveFolder) => (
            <Card 
              key={folder.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer group ${
                viewMode === 'list' ? 'flex items-center' : ''
              }`}
              onClick={() => setCurrentFolder(folder.id)}
            >
              <CardContent className={`${viewMode === 'list' ? 'p-3 flex-1' : 'p-4'}`}>
                <div className={`flex items-center ${viewMode === 'list' ? 'space-x-4' : 'space-x-3'}`}>
                  <div className="flex-shrink-0">
                    <Folder className={`${viewMode === 'list' ? 'h-6 w-6' : 'h-8 w-8'} text-blue-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${viewMode === 'list' ? 'text-base' : 'text-sm'} font-medium text-gray-900 truncate`}>
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(folder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFolderMenu(showFolderMenu === folder.id ? null : folder.id);
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                    
                    {/* Folder Action Menu */}
                    {showFolderMenu === folder.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderAction('rename', folder);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderAction('info', folder);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Info className="h-4 w-4 mr-2" />
                          Info
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFolderAction('delete', folder);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Files */}
          {(searchQuery ? searchResults.files : files).map((file: DriveFile) => (
            <Card key={file.id} className={`hover:shadow-md transition-shadow group ${
              viewMode === 'list' ? 'flex items-center' : ''
            }`}>
              <CardContent className={`${viewMode === 'list' ? 'p-3 flex-1' : 'p-4'}`}>
                <div className={`flex items-center ${viewMode === 'list' ? 'space-x-4' : 'space-x-3'}`}>
                  <div className="flex-shrink-0">
                    {getFileIconComponent(file.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${viewMode === 'list' ? 'text-base' : 'text-sm'} font-medium text-gray-900 truncate`}>
                      {file.original_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFileMenu(showFileMenu === file.id ? null : file.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                      {/* File Action Menu */}
                      {showFileMenu === file.id && (
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileAction('rename', file);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileAction('copy', file);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileAction('info', file);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Info
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(searchQuery ? (searchResults.files.length === 0 && searchResults.folders.length === 0) : (files.length === 0 && folders.length === 0)) && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <HardDrive className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No results found' : 'Your drive is empty'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `No files or folders match "${searchQuery}"`
                : 'Get started by uploading your first file or creating a folder to organize your content'
              }
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => document.getElementById('file-upload')?.click()} size="lg">
                <Upload className="h-5 w-5 mr-2" />
                Upload File
              </Button>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(true)} size="lg">
                <Folder className="h-5 w-5 mr-2" />
                Create Folder
              </Button>
            </div>
          </div>
        )}

        {/* New Folder Dialog */}
        {showNewFolderDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Create New Folder</CardTitle>
                    <CardDescription>
                      {currentFolder ? `Inside "${folders.find(f => f.id === currentFolder)?.name}"` : 'In your drive'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Folder Name
                    </label>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter folder name"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                      Create Folder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rename Dialog */}
        {showRenameDialog && renameItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Edit className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Rename {renameItem.type === 'file' ? 'File' : 'Folder'}</CardTitle>
                    <CardDescription>
                      Rename "{renameItem.name}"
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Name
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter new ${renameItem.type} name`}
                      onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => {
                      setShowRenameDialog(false);
                      setRenameItem(null);
                      setNewName('');
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleRename} disabled={!newName.trim()}>
                      Rename
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Copy Dialog */}
        {showCopyDialog && copyItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Copy className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Copy File</CardTitle>
                    <CardDescription>
                      Copy "{copyItem.name}" to another location
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination Folder
                    </label>
                    <select
                      value={targetFolderId}
                      onChange={(e) => setTargetFolderId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Root Folder</option>
                      {allFolders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.path}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => {
                      setShowCopyDialog(false);
                      setCopyItem(null);
                      setTargetFolderId('');
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCopy}>
                      Copy File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>

    {/* Upload Progress */}
    <UploadProgress
      isUploading={uploading}
      fileName={uploadFileName}
      progress={uploadProgress}
      onCancel={handleCancelUpload}
      error={uploadError}
    />
  </div>
  );
} 