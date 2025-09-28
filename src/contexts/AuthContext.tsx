'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Starting sign up process for:', email);
      
      // Basic validation
      if (!email || !password) {
        const error = { message: 'Email and password are required' };
        console.error('Validation error:', error);
        return { error };
      }

      if (password.length < 6) {
        const error = { message: 'Password must be at least 6 characters' };
        console.error('Validation error:', error);
        return { error };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      console.log('Sign up result:', { 
        user: data.user?.id, 
        session: !!data.session, 
        error: error?.message 
      });
      
      return { data, error };
    } catch (err: any) {
      console.error('Sign up error:', err);
      return { error: { message: err.message || 'An unexpected error occurred during sign up' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process for:', email);
      
      // Basic validation
      if (!email || !password) {
        const error = { message: 'Email and password are required' };
        console.error('Validation error:', error);
        return { error };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      console.log('Sign in result:', { 
        user: data.user?.id, 
        session: !!data.session, 
        error: error?.message 
      });
      
      return { data, error };
    } catch (err: any) {
      console.error('Sign in error:', err);
      return { error: { message: err.message || 'An unexpected error occurred during sign in' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }
      
      console.log('Sign out successful');
      return { error: null };
    } catch (err: any) {
      console.error('Sign out error:', err);
      return { error: { message: err.message || 'An unexpected error occurred during sign out' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Starting password reset for:', email);
      
      if (!email) {
        const error = { message: 'Email is required' };
        console.error('Validation error:', error);
        return { error };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      console.log('Password reset result:', { error: error?.message });
      return { error };
    } catch (err: any) {
      console.error('Password reset error:', err);
      return { error: { message: err.message || 'An unexpected error occurred during password reset' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}






