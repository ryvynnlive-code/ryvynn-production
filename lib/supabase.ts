import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  persona: 'feminine' | 'masculine' | 'neutral';
  age_tier: 'youth' | 'young_adult' | 'adult' | 'mature';
  r_rated_mode: boolean;
  soul_tokens: number;
  streak_days: number;
  last_checkin: string;
  created_at: string;
};
