import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { data: folder, error } = await supabase
      .from('drive_folders')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (error || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json(folder);

  } catch (error) {
    console.error('Get folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId, newName } = await request.json();
    const folderId = params.id;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify folder belongs to user
    const { data: existingFolder, error: fetchError } = await supabase
      .from('drive_folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    switch (action) {
      case 'rename':
        if (!newName || newName.trim() === '') {
          return NextResponse.json({ error: 'New name required' }, { status: 400 });
        }

        // Check if folder with same name already exists in the same parent
        const { data: existingFolderWithName } = await supabase
          .from('drive_folders')
          .select('id')
          .eq('user_id', userId)
          .eq('name', newName.trim())
          .eq('parent_id', existingFolder.parent_id)
          .neq('id', folderId)
          .single();

        if (existingFolderWithName) {
          return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 });
        }

        // Generate new path
        let newPath = `/${newName.trim()}`;
        if (existingFolder.parent_id) {
          // Get parent folder path
          const { data: parentFolder } = await supabase
            .from('drive_folders')
            .select('path')
            .eq('id', existingFolder.parent_id)
            .eq('user_id', userId)
            .single();
          
          if (parentFolder) {
            newPath = `${parentFolder.path}/${newName.trim()}`;
          }
        }

        // Update folder name and path
        const { data: updatedFolder, error: updateError } = await supabase
          .from('drive_folders')
          .update({ 
            name: newName.trim(),
            path: newPath,
            updated_at: new Date().toISOString()
          })
          .eq('id', folderId)
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Update paths of all child folders recursively
        await updateChildFolderPaths(supabase, userId, folderId, newPath);

        return NextResponse.json({ folder: updatedFolder });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Folder operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to recursively update child folder paths
async function updateChildFolderPaths(supabase: any, userId: string, parentId: string, parentPath: string) {
  // Get all child folders
  const { data: childFolders } = await supabase
    .from('drive_folders')
    .select('id, name')
    .eq('user_id', userId)
    .eq('parent_id', parentId);

  if (childFolders) {
    for (const child of childFolders) {
      const childPath = `${parentPath}/${child.name}`;
      
      // Update child folder path
      await supabase
        .from('drive_folders')
        .update({ path: childPath })
        .eq('id', child.id)
        .eq('user_id', userId);

      // Recursively update grandchildren
      await updateChildFolderPaths(supabase, userId, child.id, childPath);
    }
  }
} 