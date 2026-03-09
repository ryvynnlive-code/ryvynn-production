'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, persona: string, ageTier: string, turnstileToken?: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet - create it with defaults
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            persona: 'neutral',
            age_tier: 'adult',
            r_rated_mode: false,
            soul_tokens: 10,
            streak_days: 0,
            last_checkin: new Date().toISOString(),
          }, { onConflict: 'id' })
          .select()
          .single();

        if (!createError && newProfile) {
          setProfile(newProfile);
        }
        return;
      }

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const signUp = async (email: string, password: string, persona: string, ageTier: string, turnstileToken?: string) => {
    try {
      // Check if Supabase is configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Database connection not configured. Please try again later.');
      }

      // Verify Turnstile token if provided
      if (turnstileToken) {
        try {
          const verifyResponse = await fetch('/api/auth/verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: turnstileToken }),
          });

          const verifyData = await verifyResponse.json();

          if (!verifyData.success) {
            throw new Error('Bot verification failed. Please try again.');
          }
        } catch (fetchError: any) {
          // If Turnstile verification fails due to network, continue anyway
          console.warn('Turnstile verification failed:', fetchError);
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Check if email confirmation is required
      // When confirmation required: user exists but session is null
      if (data.user && !data.session) {
        return { 
          requiresEmailConfirmation: true,
          message: `Check your email (${email}) for a confirmation link, then come back to sign in.`
        };
      }

      if (data.user) {
        // Create profile - don't throw if it fails (may already exist or RLS issue)
        // Use upsert to avoid duplicate key errors
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            persona,
            age_tier: ageTier,
            r_rated_mode: false,
            soul_tokens: 10, // Starting tokens
            streak_days: 0,
            last_checkin: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (profileError) {
          // Log but don't block signup - user is created, profile can be created on first login
          console.error('Profile creation error (non-fatal):', profileError.message);
        }
      }

      return {};
    } catch (error: any) {
      // Improve error messages for common issues
      let errorMessage = error.message || 'Sign up failed';
      
      if (error.message?.includes('fetch') || error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
      } else if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      return { error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return {};
    } catch (error: any) {
      return { error: error.message || 'Sign in failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
