-- RYVYNN Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  persona TEXT NOT NULL CHECK (persona IN ('feminine', 'masculine', 'neutral')) DEFAULT 'neutral',
  age_tier TEXT NOT NULL CHECK (age_tier IN ('youth', 'young_adult', 'adult', 'mature')) DEFAULT 'adult',
  r_rated_mode BOOLEAN DEFAULT FALSE,
  soul_tokens INTEGER DEFAULT 10,
  streak_days INTEGER DEFAULT 0,
  last_checkin TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow profile creation on signup (will be handled by auth trigger)
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- JOURNAL ENTRIES TABLE (Encrypted Client-Side)
-- =====================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_content TEXT NOT NULL, -- Client-side encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for journal entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries" 
  ON journal_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries" 
  ON journal_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" 
  ON journal_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" 
  ON journal_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- DIGITAL ETERNITY MESSAGES (Encrypted Client-Side)
-- =====================================================
CREATE TABLE IF NOT EXISTS eternity_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  encrypted_message TEXT NOT NULL, -- Client-side encrypted
  trigger_condition TEXT, -- e.g., "death", "specific_date", "bloodline_request"
  recipient_info TEXT, -- Encrypted recipient details
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for eternity messages
ALTER TABLE eternity_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own eternity messages" 
  ON eternity_messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own eternity messages" 
  ON eternity_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own eternity messages" 
  ON eternity_messages FOR UPDATE 
  USING (auth.uid() = user_id);

-- =====================================================
-- WALL ENTRIES (Public 50/50 Feed)
-- =====================================================
CREATE TABLE IF NOT EXISTS wall_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous
  confession TEXT NOT NULL,
  transformation TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for wall entries
ALTER TABLE wall_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read wall entries (public feed)
CREATE POLICY "Anyone can view wall entries" 
  ON wall_entries FOR SELECT 
  USING (TRUE);

-- Authenticated users can create wall entries
CREATE POLICY "Authenticated users can create wall entries" 
  ON wall_entries FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous = TRUE);

-- =====================================================
-- SUBSCRIPTIONS (Stripe Integration)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('solo', 'family', 'therapist', 'enterprise', 'lifetime')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- Only backend can modify subscriptions (via service role)
-- No INSERT/UPDATE/DELETE policies for users

-- =====================================================
-- SOUL TOKEN TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Positive for earn, negative for spend
  type TEXT NOT NULL CHECK (type IN ('daily_checkin', 'streak_bonus', 'confession', 'journal_save', 'eternity_create', 'admin_grant')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for token transactions
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own token transactions" 
  ON token_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- =====================================================
-- GUARDIAN CONVERSATION HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS guardian_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for guardian conversations
ALTER TABLE guardian_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" 
  ON guardian_conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" 
  ON guardian_conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_created_at ON journal_entries(created_at DESC);

CREATE INDEX idx_eternity_user_id ON eternity_messages(user_id);
CREATE INDEX idx_eternity_status ON eternity_messages(status);

CREATE INDEX idx_wall_created_at ON wall_entries(created_at DESC);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_created_at ON token_transactions(created_at DESC);

CREATE INDEX idx_guardian_user_id ON guardian_conversations(user_id);
CREATE INDEX idx_guardian_created_at ON guardian_conversations(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_updated_at 
  BEFORE UPDATE ON journal_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PROFILE AUTO-CREATION ON USER SIGNUP
-- =====================================================
-- This trigger automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, persona, age_tier, soul_tokens, streak_days)
  VALUES (NEW.id, 'neutral', 'adult', 10, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DAILY STREAK & TOKEN BONUS FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION check_daily_streak(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  profile_record RECORD;
  hours_since_checkin NUMERIC;
  new_streak INTEGER;
  bonus_tokens INTEGER := 0;
  result JSON;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = user_uuid;
  
  hours_since_checkin := EXTRACT(EPOCH FROM (NOW() - profile_record.last_checkin)) / 3600;
  
  -- If checked in within 24-48 hours: maintain streak
  IF hours_since_checkin >= 24 AND hours_since_checkin < 48 THEN
    new_streak := profile_record.streak_days + 1;
    
    -- Award streak bonuses
    IF new_streak = 3 THEN bonus_tokens := 5;
    ELSIF new_streak = 7 THEN bonus_tokens := 15;
    END IF;
    
  -- If checked in too early (< 24 hours): no change
  ELSIF hours_since_checkin < 24 THEN
    new_streak := profile_record.streak_days;
    
  -- If checked in too late (> 48 hours): reset streak
  ELSE
    new_streak := 1;
  END IF;
  
  -- Update profile
  UPDATE profiles 
  SET 
    last_checkin = NOW(),
    streak_days = new_streak,
    soul_tokens = soul_tokens + bonus_tokens
  WHERE id = user_uuid;
  
  -- Log transaction if bonus awarded
  IF bonus_tokens > 0 THEN
    INSERT INTO token_transactions (user_id, amount, type, description)
    VALUES (user_uuid, bonus_tokens, 'streak_bonus', 'Day ' || new_streak || ' streak bonus');
  END IF;
  
  result := json_build_object(
    'streak_days', new_streak,
    'bonus_tokens', bonus_tokens,
    'total_tokens', profile_record.soul_tokens + bonus_tokens
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- =====================================================
-- RPC FUNCTION: AWARD TOKENS
-- =====================================================
CREATE OR REPLACE FUNCTION award_tokens(
  user_uuid UUID,
  amount INTEGER,
  transaction_type TEXT,
  description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT soul_tokens INTO current_balance
  FROM profiles
  WHERE id = user_uuid;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User not found: %', user_uuid;
  END IF;
  
  -- Update balance
  new_balance := current_balance + amount;
  
  UPDATE profiles
  SET soul_tokens = new_balance
  WHERE id = user_uuid;
  
  -- Log transaction
  INSERT INTO token_transactions (user_id, amount, type, description)
  VALUES (user_uuid, amount, transaction_type, description);
  
  RETURN json_build_object(
    'previous_balance', current_balance,
    'amount_awarded', amount,
    'new_balance', new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RPC FUNCTION: INCREMENT WALL VOTES
-- =====================================================
CREATE OR REPLACE FUNCTION increment_wall_votes(entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_vote_count INTEGER;
BEGIN
  UPDATE wall_entries
  SET votes = votes + 1
  WHERE id = entry_id
  RETURNING votes INTO new_vote_count;
  
  RETURN new_vote_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- After running this schema:
-- 1. Set NEXT_PUBLIC_SUPABASE_URL in Vercel env vars
-- 2. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env vars
-- 3. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env vars (for admin operations)
