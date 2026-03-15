-- ScamShield — full Supabase schema
-- Run this entire file in your Supabase SQL editor.

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  region              TEXT,
  face_descriptor     JSONB,             -- face-api.js Float32Array as JSON array
  timezone            TEXT,
  ip_address          TEXT,
  never_used_crypto   BOOLEAN DEFAULT false,
  never_sent_giftcards BOOLEAN DEFAULT false,
  known_domains       TEXT[]  DEFAULT '{}',
  trusted_contacts    TEXT[]  DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  last_seen_at        TIMESTAMPTZ DEFAULT now()
);

-- ── Scan history ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  content_type        TEXT NOT NULL,     -- 'text' | 'url' | 'image' | 'document'
  content_snippet     TEXT,              -- first 120 chars of input
  risk_level          TEXT,              -- 'low' | 'medium' | 'high' | 'critical'
  risk_score          INTEGER,           -- 0–100
  reasons             JSONB DEFAULT '[]',
  explanation         TEXT,
  recommended_action  TEXT,
  ip_address          TEXT,
  timezone            TEXT,
  platform            TEXT DEFAULT 'web',
  user_feedback       TEXT,              -- 'legit' | 'not_sure' | NULL
  corrected_label     TEXT,              -- 'not_scam' | NULL
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── Live call alerts ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_call_alerts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  risk_level  TEXT NOT NULL,             -- 'medium' | 'high' | 'critical'
  reason      TEXT,
  snippet     TEXT,                      -- first 90 chars of transcribed audio
  ip_address  TEXT,
  timezone    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Call sessions (transcript + alerts saved on stop) ────────────────────────
CREATE TABLE IF NOT EXISTS call_sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER     DEFAULT 0,
  transcript       TEXT,                      -- full speech transcript
  alerts           JSONB       DEFAULT '[]',  -- array of {riskLevel, reason, snippet, timestamp}
  alert_count      INTEGER     DEFAULT 0,
  highest_risk     TEXT        DEFAULT 'none', -- 'none' | 'medium' | 'high' | 'critical'
  ip_address       TEXT,
  timezone         TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Community alerts (anonymized, for heatmap) ────────────────────────────────
CREATE TABLE IF NOT EXISTS community_alerts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  risk_level  TEXT NOT NULL,    -- 'high' | 'critical'
  scam_type   TEXT NOT NULL,    -- e.g. 'Crypto fraud', 'Bank impersonation'
  region      TEXT,             -- city/province, no personal info
  timezone    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS scans_user_id_idx             ON scans (user_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx          ON scans (created_at DESC);
CREATE INDEX IF NOT EXISTS live_alerts_user_id_idx       ON live_call_alerts (user_id);
CREATE INDEX IF NOT EXISTS live_alerts_created_at_idx    ON live_call_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS call_sessions_user_id_idx     ON call_sessions (user_id);
CREATE INDEX IF NOT EXISTS call_sessions_started_at_idx  ON call_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS community_alerts_created_at   ON community_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS community_alerts_scam_type    ON community_alerts (scam_type);

-- ── Row-level security (optional — uncomment if using Supabase Auth) ─────────
-- ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scans             ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE live_call_alerts  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE call_sessions     ENABLE ROW LEVEL SECURITY;
