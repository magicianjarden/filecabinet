import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
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

    // Get file metadata first
    const { data: file, error: fileError } = await supabase
      .from('drive_files')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (fileError || !file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('drive-files')
      .remove([file.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('drive_files')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Update user storage usage
    const { data: currentUser } = await supabase
      .from('drive_users')
      .select('storage_used')
      .eq('id', userId)
      .single();

    if (currentUser) {
      const { error: updateError } = await supabase
        .from('drive_users')
        .update({
          storage_used: Math.max(0, currentUser.storage_used - file.size),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Storage usage update error:', updateError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, newName, targetFolderId } = await request.json();
    const fileId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify file belongs to user
    const { data: existingFile, error: fetchError } = await supabase
      .from('drive_files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    switch (action) {
      case 'rename':
        if (!newName || newName.trim() === '') {
          return NextResponse.json({ error: 'New name required' }, { status: 400 });
        }

        // Check if file with same name already exists in the same folder
        const { data: existingFileWithName } = await supabase
          .from('drive_files')
          .select('id')
          .eq('user_id', userId)
          .eq('original_name', newName.trim())
          .eq('folder_id', existingFile.folder_id)
          .neq('id', fileId)
          .single();

        if (existingFileWithName) {
          return NextResponse.json({ error: 'A file with this name already exists in this folder' }, { status: 409 });
        }

        // Update file name
        const { data: updatedFile, error: updateError } = await supabase
          .from('drive_files')
          .update({ 
            original_name: newName.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', fileId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ file: updatedFile });

      case 'copy':
        if (!targetFolderId) {
          return NextResponse.json({ error: 'Target folder ID required' }, { status: 400 });
        }

        // Verify target folder belongs to user
        const { data: targetFolder } = await supabase
          .from('drive_folders')
          .select('id')
          .eq('id', targetFolderId)
          .eq('user_id', userId)
          .single();

        if (!targetFolder) {
          return NextResponse.json({ error: 'Target folder not found' }, { status: 404 });
        }

        // Generate unique name for copied file
        let newFileName = existingFile.original_name;
        let counter = 1;
        
        while (true) {
          const { data: existingCopy } = await supabase
            .from('drive_files')
            .select('id')
            .eq('user_id', userId)
            .eq('original_name', newFileName)
            .eq('folder_id', targetFolderId)
            .single();

          if (!existingCopy) break;
          
          const nameParts = existingFile.original_name.split('.');
          const extension = nameParts.length > 1 ? `.${nameParts.pop()}` : '';
          const baseName = nameParts.join('.');
          newFileName = `${baseName} (${counter})${extension}`;
          counter++;
        }

        // Copy the file (create new record with same encrypted content)
        const { data: copiedFile, error: copyError } = await supabase
          .from('drive_files')
          .insert({
            user_id: userId,
            name: existingFile.name, // Keep same encrypted name
            original_name: newFileName,
            mime_type: existingFile.mime_type,
            size: existingFile.size,
            folder_id: targetFolderId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (copyError) {
          return NextResponse.json({ error: copyError.message }, { status: 500 });
        }

        return NextResponse.json({ file: copiedFile });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('File operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 