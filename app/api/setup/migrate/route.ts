import { NextResponse } from 'next/server';

// Full RYVYNN database schema
const SCHEMA_STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  `CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    persona TEXT NOT NULL CHECK (persona IN ('feminine', 'masculine', 'neutral')) DEFAULT 'neutral',
    age_tier TEXT NOT NULL CHECK (age_tier IN ('youth', 'young_adult', 'adult', 'mature')) DEFAULT 'adult',
    r_rated_mode BOOLEAN DEFAULT FALSE,
    soul_tokens INTEGER DEFAULT 10,
    streak_days INTEGER DEFAULT 0,
    last_checkin TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN CREATE POLICY "Users can view own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "Users can create own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS eternity_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_message TEXT NOT NULL,
    trigger_condition TEXT,
    recipient_info TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE eternity_messages ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN CREATE POLICY "Users can view own eternity messages" ON eternity_messages FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "Users can create own eternity messages" ON eternity_messages FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "Users can update own eternity messages" ON eternity_messages FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS wall_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    confession TEXT NOT NULL,
    transformation TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE wall_entries ENABLE ROW LEVEL SECURITY`,

  `DO $$ BEGIN CREATE POLICY "Anyone can view wall entries" ON wall_entries FOR SELECT USING (TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "Authenticated users can create wall entries" ON wall_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous = TRUE); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS subscriptions (
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
  )`,

  `ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('daily_checkin', 'streak_bonus', 'confession', 'journal_save', 'eternity_create', 'admin_grant')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "Users can view own token transactions" ON token_transactions FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE TABLE IF NOT EXISTS guardian_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  `ALTER TABLE guardian_conversations ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "Users can view own conversations" ON guardian_conversations FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "Users can create own conversations" ON guardian_conversations FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_journal_created_at ON journal_entries(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_eternity_user_id ON eternity_messages(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_wall_created_at ON wall_entries(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_guardian_user_id ON guardian_conversations(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_guardian_created_at ON guardian_conversations(created_at DESC)`,

  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
  $$ language 'plpgsql'`,

  `DO $$ BEGIN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TRIGGER update_journal_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `DO $$ BEGIN
    CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, persona, age_tier, soul_tokens, streak_days)
    VALUES (NEW.id, 'neutral', 'adult', 10, 0)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

  `DO $$ BEGIN
    CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  `CREATE OR REPLACE FUNCTION award_tokens(user_uuid UUID, amount INTEGER, transaction_type TEXT, description TEXT DEFAULT NULL)
  RETURNS JSON AS $$
  DECLARE current_balance INTEGER; new_balance INTEGER;
  BEGIN
    SELECT soul_tokens INTO current_balance FROM profiles WHERE id = user_uuid;
    IF current_balance IS NULL THEN RAISE EXCEPTION 'User not found: %', user_uuid; END IF;
    new_balance := current_balance + amount;
    UPDATE profiles SET soul_tokens = new_balance WHERE id = user_uuid;
    INSERT INTO token_transactions (user_id, amount, type, description) VALUES (user_uuid, amount, transaction_type, description);
    RETURN json_build_object('previous_balance', current_balance, 'amount_awarded', amount, 'new_balance', new_balance);
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

  `CREATE OR REPLACE FUNCTION increment_wall_votes(entry_id UUID)
  RETURNS INTEGER AS $$
  DECLARE new_vote_count INTEGER;
  BEGIN
    UPDATE wall_entries SET votes = votes + 1 WHERE id = entry_id RETURNING votes INTO new_vote_count;
    RETURN new_vote_count;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { secret } = body as { secret?: string };

    if (!process.env.MIGRATE_SECRET || secret !== process.env.MIGRATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
    }

    // Dynamic import of pg (installed in production build)
    const { Pool } = await import('pg');

    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 15000,
    });

    const results: { stmt: string; ok: boolean; error?: string }[] = [];

    for (const stmt of SCHEMA_STATEMENTS) {
      const label = stmt.trim().substring(0, 60).replace(/\s+/g, ' ');
      try {
        await pool.query(stmt);
        results.push({ stmt: label, ok: true });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ stmt: label, ok: false, error: msg });
      }
    }

    await pool.end();

    const failed = results.filter(r => !r.ok);
    return NextResponse.json({
      success: true,
      total: results.length,
      passed: results.length - failed.length,
      failed: failed.length,
      results,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
