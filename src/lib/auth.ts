import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if both URL and key are available
export const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DriveUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  storage_used: number;
  storage_limit: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  driveUser: DriveUser | null;
  loading: boolean;
}

export const signUp = async (email: string, password: string, fullName?: string) => {
  if (!supabaseClient) {
    return { data: null, error: { message: 'Supabase client not configured' } };
  }
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!supabaseClient) {
    return { data: null, error: { message: 'Supabase client not configured' } };
  }
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabaseClient) {
    return { error: { message: 'Supabase client not configured' } };
  }
  const { error } = await supabaseClient.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  if (!supabaseClient) {
    return { data: null, error: { message: 'Supabase client not configured' } };
  }
  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
};

export const updatePassword = async (password: string) => {
  if (!supabaseClient) {
    return { data: null, error: { message: 'Supabase client not configured' } };
  }
  const { data, error } = await supabaseClient.auth.updateUser({
    password,
  });
  return { data, error };
};

export const ensureDriveUser = async (user: User): Promise<DriveUser | null> => {
  console.log('ensureDriveUser called with user:', user.id, user.email);
  
  if (!supabaseClient) {
    console.error('Supabase client not configured');
    return null;
  }

  // Add timeout to prevent hanging
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      console.error('ensureDriveUser timeout after 10 seconds');
      resolve(null);
    }, 10000);
  });

  const ensureUserPromise = (async () => {
    try {
      console.log('Checking for existing drive user...');
      // First try to get existing drive user
      const { data: existingUser, error: fetchError } = await supabaseClient
        .from('drive_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.log('Error fetching existing user:', fetchError);
      }

      if (existingUser) {
        console.log('Found existing drive user:', existingUser);
        return existingUser;
      }

      console.log('No existing drive user found, creating new one...');
      // If user doesn't exist, create them
      const { data: newUser, error: createError } = await supabaseClient
        .from('drive_users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          storage_used: 0,
          storage_limit: 10737418240, // 10GB default
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating drive user:', createError);
        return null;
      }

      console.log('Successfully created new drive user:', newUser);
      return newUser;
    } catch (error) {
      console.error('Error ensuring drive user exists:', error);
      return null;
    }
  })();

  return Promise.race([ensureUserPromise, timeoutPromise]);
};

export const getDriveUser = async (userId: string): Promise<DriveUser | null> => {
  if (!supabaseClient) {
    console.error('Supabase client not configured');
    return null;
  }

  try {
    const { data, error } = await supabaseClient
      .from('drive_users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching drive user:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDriveUser:', error);
    return null;
  }
};

export const updateDriveUser = async (userId: string, updates: Partial<DriveUser>) => {
  if (!supabaseClient) {
    return { data: null, error: { message: 'Supabase client not configured' } };
  }
  const { data, error } = await supabaseClient
    .from('drive_users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}; 