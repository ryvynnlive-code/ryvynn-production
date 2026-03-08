import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Auth will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (will expand as schema is created)
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
