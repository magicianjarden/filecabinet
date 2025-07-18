import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { encryptFile, arrayBufferToBase64 } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;
    const userId = formData.get('userId') as string;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size limit (10GB)
    const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10GB limit' }, { status: 400 });
    }

    // Check user storage limit
    const { data: driveUser } = await supabase
      .from('drive_users')
      .select('storage_used, storage_limit')
      .eq('id', userId)
      .single();

    if (driveUser && driveUser.storage_used + file.size > driveUser.storage_limit) {
      return NextResponse.json({ error: 'Storage limit exceeded' }, { status: 413 });
    }

    // Encrypt the file
    const { encryptedData, encryptionKey, iv } = await encryptFile(file);

    // Generate storage path
    const fileId = crypto.randomUUID();
    const storagePath = `${userId}/${fileId}`;

    // Upload encrypted file to storage
    console.log('Uploading file:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storagePath
    });

    // Try different content type strategies
    let contentType = file.type;
    
    // If no specific type, try common binary types
    if (!contentType || contentType === 'application/octet-stream') {
      const extension = file.name.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'txt':
          contentType = 'text/plain';
          break;
        case 'pdf':
          contentType = 'application/pdf';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'doc':
          contentType = 'application/msword';
          break;
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xls':
          contentType = 'application/vnd.ms-excel';
          break;
        case 'xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          contentType = 'application/binary';
          break;
      }
    }
    
    console.log('Using content type:', contentType);
    
    const { error: uploadError } = await supabase.storage
      .from('drive-files')
      .upload(storagePath, encryptedData, {
        contentType: contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Store file metadata in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('drive_files')
      .insert({
        user_id: userId,
        folder_id: folderId,
        name: file.name,
        original_name: file.name,
        mime_type: file.type,
        size: file.size,
        storage_path: storagePath,
        encryption_key: arrayBufferToBase64(new Uint8Array(encryptionKey).buffer),
        encryption_iv: arrayBufferToBase64(new Uint8Array(iv).buffer),
        is_encrypted: true,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('drive-files').remove([storagePath]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        size: fileRecord.size,
        mime_type: fileRecord.mime_type,
        created_at: fileRecord.created_at,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 