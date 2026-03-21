import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmt4eWxqd2Vtbm5id3pjcmtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyMDU2NSwiZXhwIjoyMDg4NTk2NTY1fQ.zChCd7uhbTN2OdI5DCB8BEE8f6Gb3I_hfRpMkRoagHg';

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
