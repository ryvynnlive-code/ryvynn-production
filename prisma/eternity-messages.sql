CREATE TABLE IF NOT EXISTS eternity_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_pubkey_hash VARCHAR(64) NOT NULL UNIQUE,
  encrypted_message BYTEA,
  metadata_iv_tag BYTEA,
  burn_condition JSONB DEFAULT '{"type":"none"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_eternity_pubkey ON eternity_messages(user_pubkey_hash);
CREATE OR REPLACE FUNCTION check_burn_condition() RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.burn_condition->>'type'='views') AND (NEW.burn_condition->>'views_left')::int<=0 THEN
    NEW.encrypted_message=NULL; NEW.metadata_iv_tag=NULL;
  END IF; RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER burn_on_update BEFORE UPDATE ON eternity_messages FOR EACH ROW EXECUTE FUNCTION check_burn_condition();
ALTER TABLE eternity_messages ENABLE ROW LEVEL SECURITY;
