'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabaseClient, getDriveUser, ensureDriveUser, AuthState, DriveUser, signUp as authSignUp, signIn as authSignIn, signOut as authSignOut, resetPassword as authResetPassword, updatePassword as authUpdatePassword } from '@/lib/auth';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (password: string) => Promise<{ data: any; error: any }>;
  refreshDriveUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [driveUser, setDriveUser] = useState<DriveUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDriveUser = async () => {
    if (user) {
      const driveUserData = await ensureDriveUser(user);
      setDriveUser(driveUserData);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    return await authSignUp(email, password, fullName);
  };

  const signIn = async (email: string, password: string) => {
    return await authSignIn(email, password);
  };

  const signOut = async () => {
    return await authSignOut();
  };

  const resetPassword = async (email: string) => {
    return await authResetPassword(email);
  };

  const updatePassword = async (password: string) => {
    return await authUpdatePassword(password);
  };

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    if (!supabaseClient) {
      console.warn('Supabase client not configured');
      setLoading(false);
      clearTimeout(timeout);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('Initial session:', session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User found, ensuring drive user exists...');
          const driveUserData = await ensureDriveUser(session.user);
          console.log('Drive user data:', driveUserData);
          setDriveUser(driveUserData);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    let subscription: any;
    if (supabaseClient) {
      try {
        const { data } = supabaseClient.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, session);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              console.log('User in auth state change, ensuring drive user exists...');
              const driveUserData = await ensureDriveUser(session.user);
              console.log('Drive user data from auth state change:', driveUserData);
              setDriveUser(driveUserData);
            } else {
              setDriveUser(null);
            }
            
            console.log('Setting loading to false from auth state change');
            setLoading(false);
          }
        );
        subscription = data.subscription;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
        setLoading(false);
      }
    }

    return () => {
      clearTimeout(timeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    driveUser,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshDriveUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 