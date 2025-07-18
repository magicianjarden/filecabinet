import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('q');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!query || query.trim() === '') {
      return NextResponse.json({ files: [], folders: [] });
    }

    const searchTerm = query.toLowerCase().trim();

    // Search files across all folders
    const { data: files, error: filesError } = await supabase
      .from('drive_files')
      .select('*')
      .eq('user_id', userId)
      .ilike('original_name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (filesError) {
      console.error('Files search error:', filesError);
    }

    // Search folders across all levels
    const { data: folders, error: foldersError } = await supabase
      .from('drive_folders')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true });

    if (foldersError) {
      console.error('Folders search error:', foldersError);
    }

    return NextResponse.json({
      files: files || [],
      folders: folders || [],
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 