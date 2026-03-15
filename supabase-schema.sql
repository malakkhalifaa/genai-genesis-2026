-- ═══════════════════════════════════════════════════════════════════════════
-- ScamShield — Unified Supabase Schema
-- Paste this entire file into your Supabase SQL Editor and click Run.
-- Safe to re-run: all statements use CREATE TABLE IF NOT EXISTS / IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── Users ────────────────────────────────────────────────────────────────────
-- Core auth + profile table used by both frontend and backend.
-- password_hash is required for custom email/password auth.
CREATE TABLE IF NOT EXISTS users (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 TEXT,
  email                TEXT        UNIQUE,
  password_hash        TEXT,                          -- SHA-256, required for login
  region               TEXT,
  age_group            TEXT,                          -- e.g. '65+', '45-64'
  face_descriptor      JSONB,                         -- face-api.js descriptor array
  timezone             TEXT,
  ip_address           TEXT,
  never_used_crypto    BOOLEAN     DEFAULT false,
  never_sent_giftcards BOOLEAN     DEFAULT false,
  known_domains        TEXT[]      DEFAULT '{}',      -- quick-access array
  trusted_contacts     TEXT[]      DEFAULT '{}',      -- quick-access array
  created_at           TIMESTAMPTZ DEFAULT now(),
  last_seen_at         TIMESTAMPTZ DEFAULT now()
);

-- Patch missing columns if users table already existed without them
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS age_group           TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_descriptor     JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone            TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_address          TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS never_used_crypto   BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS never_sent_giftcards BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS known_domains       TEXT[]  DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trusted_contacts    TEXT[]  DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at        TIMESTAMPTZ DEFAULT now();


-- ── Scan history (our frontend writes here) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES users(id) ON DELETE SET NULL,
  content_type        TEXT        NOT NULL,   -- 'text' | 'url' | 'image' | 'document'
  content_snippet     TEXT,                   -- first 120 chars of input
  risk_level          TEXT,                   -- 'low' | 'medium' | 'high' | 'critical'
  risk_score          INTEGER,                -- 0–100
  reasons             JSONB       DEFAULT '[]',
  explanation         TEXT,
  recommended_action  TEXT,
  ip_address          TEXT,
  timezone            TEXT,
  platform            TEXT        DEFAULT 'web',
  user_feedback       TEXT,                   -- 'legit' | 'not_sure' | NULL
  corrected_label     TEXT,                   -- 'not_scam' | NULL
  created_at          TIMESTAMPTZ DEFAULT now()
);


-- ── Reports (teammate's table — mirrors scans, used by their backend) ─────────
CREATE TABLE IF NOT EXISTS reports (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  content_type    TEXT,
  platform        TEXT,
  region          TEXT,
  risk_score      INTEGER,
  risk_level      TEXT,
  model_name      TEXT,
  model_version   TEXT,
  user_feedback   TEXT,
  corrected_label TEXT,
  created_at      TIMESTAMP   DEFAULT now()
);


-- ── Live call alerts ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_call_alerts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  risk_level  TEXT        NOT NULL,   -- 'medium' | 'high' | 'critical'
  reason      TEXT,
  snippet     TEXT,                   -- first 90 chars of transcribed audio
  ip_address  TEXT,
  timezone    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ── Call sessions (full transcript + alerts saved on call end) ────────────────
CREATE TABLE IF NOT EXISTS call_sessions (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES users(id) ON DELETE SET NULL,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER     DEFAULT 0,
  transcript       TEXT,
  alerts           JSONB       DEFAULT '[]',
  alert_count      INTEGER     DEFAULT 0,
  highest_risk     TEXT        DEFAULT 'none',
  ip_address       TEXT,
  timezone         TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);


-- ── Community alerts (anonymised scam reports for heatmap) ────────────────────
CREATE TABLE IF NOT EXISTS community_alerts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_level  TEXT        NOT NULL,
  scam_type   TEXT        NOT NULL,
  region      TEXT,
  timezone    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ── User behaviour profile (teammate's normalised table) ─────────────────────
CREATE TABLE IF NOT EXISTS user_behavior_profile (
  id                       UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                  UUID      REFERENCES users(id) ON DELETE CASCADE,
  never_used_crypto        BOOLEAN   DEFAULT false,
  never_sent_giftcards     BOOLEAN   DEFAULT false,
  typical_transaction_min  NUMERIC,
  typical_transaction_max  NUMERIC,
  primary_payment_methods  TEXT[],
  updated_at               TIMESTAMP DEFAULT now()
);


-- ── User known domains (teammate's normalised table) ─────────────────────────
CREATE TABLE IF NOT EXISTS user_known_domains (
  id              UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID      REFERENCES users(id) ON DELETE CASCADE,
  domain          TEXT,
  frequency_score INTEGER   DEFAULT 1,
  created_at      TIMESTAMP DEFAULT now()
);


-- ── Trusted contacts (teammate's normalised table) ────────────────────────────
-- Note: our users table also has a trusted_contacts TEXT[] column for quick access.
-- This normalised table stores richer contact metadata.
CREATE TABLE IF NOT EXISTS trusted_contact_details (
  id                 UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID      REFERENCES users(id) ON DELETE CASCADE,
  contact_name       TEXT,
  contact_type       TEXT,
  contact_identifier TEXT,
  created_at         TIMESTAMP DEFAULT now()
);


-- ── User transaction patterns (teammate's table) ──────────────────────────────
CREATE TABLE IF NOT EXISTS user_transaction_patterns (
  id             UUID      DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID      REFERENCES users(id) ON DELETE CASCADE,
  merchant       TEXT,
  average_amount NUMERIC,
  last_seen      TIMESTAMP
);


-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS scans_user_id_idx              ON scans (user_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx           ON scans (created_at DESC);
CREATE INDEX IF NOT EXISTS reports_user_id_idx            ON reports (user_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx         ON reports (created_at DESC);
CREATE INDEX IF NOT EXISTS live_alerts_user_id_idx        ON live_call_alerts (user_id);
CREATE INDEX IF NOT EXISTS live_alerts_created_at_idx     ON live_call_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS call_sessions_user_id_idx      ON call_sessions (user_id);
CREATE INDEX IF NOT EXISTS call_sessions_started_at_idx   ON call_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS community_alerts_created_at    ON community_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS community_alerts_scam_type     ON community_alerts (scam_type);
CREATE INDEX IF NOT EXISTS idx_behavior_user              ON user_behavior_profile (user_id);
CREATE INDEX IF NOT EXISTS idx_domains_user               ON user_known_domains (user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user              ON trusted_contact_details (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user          ON user_transaction_patterns (user_id);


-- ── Row-level security (leave OFF for service-role-key usage) ─────────────────
-- ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scans                   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports                 ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE live_call_alerts        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE call_sessions           ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_behavior_profile   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_known_domains      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trusted_contact_details ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_transaction_patterns ENABLE ROW LEVEL SECURITY;
