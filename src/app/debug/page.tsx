'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseClient } from '@/lib/auth';

export default function DebugPage() {
  const { user, session, driveUser, loading } = useAuth();
  const [envVars, setEnvVars] = useState<any>({});
  const [tableTest, setTableTest] = useState<any>(null);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    });
  }, []);

  const testTableAccess = async () => {
    if (!supabaseClient || !user) return;

    try {
      console.log('Testing table access...');
      const { data, error } = await supabaseClient
        .from('drive_users')
        .select('*')
        .limit(1);
      
      setTableTest({ data, error });
      console.log('Table test result:', { data, error });
    } catch (err) {
      setTableTest({ error: err });
      console.error('Table test error:', err);
    }
  };

  const testStorageAccess = async () => {
    try {
      console.log('Testing storage access...');
      const response = await fetch('/api/debug/storage');
      const data = await response.json();
      
      setStorageInfo(data);
      console.log('Storage test result:', data);
    } catch (err) {
      setStorageInfo({ error: err });
      console.error('Storage test error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="grid gap-6">
          {/* Environment Variables */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(envVars, null, 2)}
            </pre>
          </div>

          {/* Supabase Client Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Supabase Client Status</h2>
            <p>Client configured: {supabaseClient ? '✅ Yes' : '❌ No'}</p>
            {supabaseClient && (
              <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            )}
          </div>

          {/* Auth State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
            <p>Loading: {loading ? '✅ Yes' : '❌ No'}</p>
            <p>User: {user ? `✅ ${user.email}` : '❌ None'}</p>
            <p>Session: {session ? '✅ Active' : '❌ None'}</p>
            <p>Drive User: {driveUser ? `✅ ${driveUser.email}` : '❌ None'}</p>
            
            {user && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">User Details:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Table Access Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Table Access Test</h2>
            <button 
              onClick={testTableAccess}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={!user}
            >
              Test drive_users Table Access
            </button>
            
            {tableTest && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(tableTest, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Storage Access Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Storage Access Test</h2>
            <button 
              onClick={testStorageAccess}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Storage Bucket Configuration
            </button>
            
            {storageInfo && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Storage Info:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(storageInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 