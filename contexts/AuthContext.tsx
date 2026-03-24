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
  signUp: (email: string, password: string, persona: string, ageTier: string, turnstileToken?: string) => Promise<{ error?: string; message?: string; requiresEmailConfirmation?: boolean }>;
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
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });

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
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({ id: userId, persona: 'neutral', age_tier: 'adult', r_rated_mode: false, soul_tokens: 10, streak_days: 0, last_checkin: new Date().toISOString() }, { onConflict: 'id' })
          .select()
          .single();
        if (newProfile) setProfile(newProfile);
        return;
      }
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Server-side signup: bypasses email confirmation entirely
  const signUp = async (email: string, password: string, persona: string, ageTier: string, turnstileToken?: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, persona, ageTier, turnstileToken }),
      });

      const result = await res.json();

      if (!res.ok) {
        let msg = result.error || 'Sign up failed';
        if (msg.includes('already') || res.status === 409) {
          msg = 'This email is already registered. Please sign in instead.';
        }
        return { error: msg };
      }

      // User created — now sign in immediately to establish session
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        return { error: 'Account created! Please sign in.', requiresEmailConfirmation: false };
      }

      return {};
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign up failed';
      return { error: msg };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return {};
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sign in failed';
      return { error: msg };
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
