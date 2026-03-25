-- ================================================================
-- RYVYNN MIGRATION v2 — Schema alignment for Stripe + Agent routes
-- Run this in Supabase SQL Editor → iofkxyljwemnnbwzcrke
-- ================================================================

-- ── 1. profiles: add Stripe + subscription columns ───────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free','solo','family','therapist','enterprise','lifetime')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('active','inactive','past_due','canceled')),
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON profiles(email);

-- ── 2. journal_entries: add encryption + metadata columns ────────
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS iv TEXT,
  ADD COLUMN IF NOT EXISTS salt TEXT,
  ADD COLUMN IF NOT EXISTS mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'user'
    CHECK (source IN ('user','agent','voice'));

-- ── 3. wall_entries: add miracle alias + approval flow ───────────
-- Rename transformation → miracle to match product language
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='wall_entries' AND column_name='transformation'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='wall_entries' AND column_name='miracle'
  ) THEN
    ALTER TABLE wall_entries RENAME COLUMN transformation TO miracle;
  END IF;
END $$;

ALTER TABLE wall_entries
  ADD COLUMN IF NOT EXISTS miracle TEXT,
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Also add policy for service role inserts via agent
CREATE POLICY IF NOT EXISTS "Service role can insert wall entries"
  ON wall_entries FOR INSERT
  WITH CHECK (TRUE);

-- ── 4. eternity_messages: align columns ──────────────────────────
ALTER TABLE eternity_messages
  ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
  ADD COLUMN IF NOT EXISTS iv TEXT,
  ADD COLUMN IF NOT EXISTS salt TEXT,
  ADD COLUMN IF NOT EXISTS deliver_after_years INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS recipient_hint TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── 5. crisis_events table (new) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS crisis_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low','moderate','high','imminent')),
  signals TEXT[] DEFAULT '{}',
  reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crisis_events ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write crisis events
CREATE POLICY IF NOT EXISTS "Service role manages crisis events"
  ON crisis_events FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_crisis_events_risk
  ON crisis_events(risk_level, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crisis_events_session
  ON crisis_events(session_id);

-- ── 6. payment_events table (new) ────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_customer_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  stripe_event_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role manages payment events"
  ON payment_events FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_payment_events_customer
  ON payment_events(stripe_customer_id);

-- ── 7. Update profile trigger to include email ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, soul_tokens, streak_days, subscription_tier, email)
  VALUES (NEW.id, 10, 0, 'free', NEW.email)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- MIGRATION COMPLETE
-- Verify with: SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'profiles' ORDER BY column_name;
-- ================================================================
