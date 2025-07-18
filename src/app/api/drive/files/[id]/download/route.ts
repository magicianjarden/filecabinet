import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decryptFile, base64ToArrayBuffer } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get file metadata
    const { data: file, error: fileError } = await supabase
      .from('drive_files')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Download encrypted file from storage
    const { data: encryptedData, error: downloadError } = await supabase.storage
      .from('drive-files')
      .download(file.storage_path);

    if (downloadError || !encryptedData) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Decrypt the file
    const encryptionKey = new Uint8Array(base64ToArrayBuffer(file.encryption_key));
    const iv = new Uint8Array(base64ToArrayBuffer(file.encryption_iv));
    
    const encryptedArrayBuffer = await encryptedData.arrayBuffer();
    const decryptedData = await decryptFile(encryptedArrayBuffer, encryptionKey, iv);

    // Create response with proper headers
    const response = new NextResponse(decryptedData);
    response.headers.set('Content-Type', file.mime_type);
    response.headers.set('Content-Disposition', `attachment; filename="${file.original_name}"`);
    response.headers.set('Content-Length', file.size.toString());

    return response;

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 