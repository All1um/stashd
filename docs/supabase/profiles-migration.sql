-- ============================================================
-- STASHD — Profiles table
-- Paste into Supabase SQL Editor and run AFTER schema.sql.
-- ============================================================

CREATE TABLE profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email        TEXT,
  display_name TEXT,
  country_code TEXT    NOT NULL DEFAULT 'CA',
  region       TEXT    NOT NULL DEFAULT 'British Columbia',
  currency     TEXT    NOT NULL DEFAULT 'CAD',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_country ON profiles(country_code);

-- Users can read and update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();
