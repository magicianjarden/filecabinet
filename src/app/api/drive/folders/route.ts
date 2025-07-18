import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { name, parentId, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Folder name required' }, { status: 400 });
    }

    // Generate folder path
    let folderPath = `/${name.trim()}`;
    
    if (parentId) {
      // Get parent folder path
      const { data: parentFolder } = await supabase
        .from('drive_folders')
        .select('path')
        .eq('id', parentId)
        .eq('user_id', userId)
        .single();
      
      if (parentFolder) {
        folderPath = `${parentFolder.path}/${name.trim()}`;
      }
    }

    // Check if folder with same name already exists in the same parent
    const { data: existingFolder } = await supabase
      .from('drive_folders')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name.trim())
      .eq('parent_id', parentId || null)
      .single();

    if (existingFolder) {
      return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 });
    }

    // Create the folder
    const { data: folder, error } = await supabase
      .from('drive_folders')
      .insert({
        user_id: userId,
        name: name.trim(),
        parent_id: parentId || null,
        path: folderPath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folder });

  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = supabase
      .from('drive_folders')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null); // Root folders
    }

    const { data: folders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ folders });

  } catch (error) {
    console.error('Get folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 