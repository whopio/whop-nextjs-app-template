-- Giveaway Master Database Schema
-- Initial migration for Supabase

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE giveaway_status AS ENUM ('draft', 'active', 'ended');
CREATE TYPE winner_selection_method AS ENUM ('random_weighted', 'manual', 'milestone');
CREATE TYPE action_type AS ENUM (
  'follow_twitter',
  'join_discord',
  'subscribe_youtube',
  'follow_instagram',
  'follow_tiktok',
  'subscribe_product',
  'join_email_list',
  'refer_friend',
  'custom'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Giveaways table: Core giveaway configuration
CREATE TABLE giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  experience_id TEXT,
  whop_product_id TEXT,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  prize_details JSONB NOT NULL DEFAULT '{}',

  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status giveaway_status NOT NULL DEFAULT 'draft',

  -- Entry configuration
  entry_actions JSONB NOT NULL DEFAULT '[]',
  bonus_entries_per_referral INTEGER NOT NULL DEFAULT 5 CHECK (bonus_entries_per_referral >= 0 AND bonus_entries_per_referral <= 100),
  max_entries_per_user INTEGER DEFAULT NULL,
  allow_duplicate_prevention BOOLEAN NOT NULL DEFAULT true,

  -- Winner selection
  winner_selection_method winner_selection_method NOT NULL DEFAULT 'random_weighted',
  winner_count INTEGER NOT NULL DEFAULT 1 CHECK (winner_count >= 1),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Entries table: User participation in giveaways
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,

  -- User identification
  user_id TEXT NOT NULL,
  email TEXT,
  whop_membership_id TEXT,

  -- Entry tracking
  entry_count INTEGER NOT NULL DEFAULT 1 CHECK (entry_count >= 1),

  -- Referral system
  referral_code TEXT NOT NULL UNIQUE,
  referred_by UUID REFERENCES entries(id) ON DELETE SET NULL,
  referral_count INTEGER NOT NULL DEFAULT 0,

  -- Additional data
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one entry per user per giveaway
  CONSTRAINT unique_user_giveaway UNIQUE (giveaway_id, user_id)
);

-- Actions completed: Track which entry actions users have completed
CREATE TABLE actions_completed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,

  action_type action_type NOT NULL,
  action_config JSONB DEFAULT '{}',

  verified BOOLEAN NOT NULL DEFAULT false,
  verification_data JSONB DEFAULT '{}',

  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one action type per entry
  CONSTRAINT unique_action_per_entry UNIQUE (entry_id, action_type)
);

-- Winners table: Track selected winners
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id UUID NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,

  -- Winner status
  position INTEGER NOT NULL DEFAULT 1,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Notification & claiming
  notified BOOLEAN NOT NULL DEFAULT false,
  notified_at TIMESTAMPTZ,
  notification_method TEXT,

  prize_claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  claim_details JSONB DEFAULT '{}',

  -- Notes
  notes TEXT,

  -- Unique constraints
  CONSTRAINT unique_winner_per_giveaway UNIQUE (giveaway_id, entry_id),
  CONSTRAINT unique_position_per_giveaway UNIQUE (giveaway_id, position)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Giveaways indexes
CREATE INDEX idx_giveaways_company_id ON giveaways(company_id);
CREATE INDEX idx_giveaways_experience_id ON giveaways(experience_id);
CREATE INDEX idx_giveaways_status ON giveaways(status);
CREATE INDEX idx_giveaways_dates ON giveaways(start_date, end_date);
CREATE INDEX idx_giveaways_company_status ON giveaways(company_id, status);

-- Entries indexes
CREATE INDEX idx_entries_giveaway_id ON entries(giveaway_id);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_referral_code ON entries(referral_code);
CREATE INDEX idx_entries_referred_by ON entries(referred_by);
CREATE INDEX idx_entries_giveaway_entries ON entries(giveaway_id, entry_count DESC);

-- Actions completed indexes
CREATE INDEX idx_actions_entry_id ON actions_completed(entry_id);
CREATE INDEX idx_actions_type ON actions_completed(action_type);

-- Winners indexes
CREATE INDEX idx_winners_giveaway_id ON winners(giveaway_id);
CREATE INDEX idx_winners_entry_id ON winners(entry_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Increment referral count for referrer
CREATE OR REPLACE FUNCTION increment_referrer_entries()
RETURNS TRIGGER AS $$
DECLARE
  bonus_entries INTEGER;
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    -- Get bonus entries per referral from the giveaway
    SELECT g.bonus_entries_per_referral INTO bonus_entries
    FROM giveaways g
    JOIN entries e ON e.giveaway_id = g.id
    WHERE e.id = NEW.referred_by;

    -- Update referrer's entry count and referral count
    UPDATE entries
    SET
      entry_count = entry_count + COALESCE(bonus_entries, 5),
      referral_count = referral_count + 1
    WHERE id = NEW.referred_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for giveaways
CREATE TRIGGER trigger_giveaways_updated_at
  BEFORE UPDATE ON giveaways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment referrer entries when new entry with referral is created
CREATE TRIGGER trigger_increment_referrer
  AFTER INSERT ON entries
  FOR EACH ROW
  EXECUTE FUNCTION increment_referrer_entries();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions_completed ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Giveaways policies
CREATE POLICY "Companies can view own giveaways"
  ON giveaways FOR SELECT
  USING (company_id = current_setting('app.company_id', true));

CREATE POLICY "Companies can insert own giveaways"
  ON giveaways FOR INSERT
  WITH CHECK (company_id = current_setting('app.company_id', true));

CREATE POLICY "Companies can update own giveaways"
  ON giveaways FOR UPDATE
  USING (company_id = current_setting('app.company_id', true))
  WITH CHECK (company_id = current_setting('app.company_id', true));

CREATE POLICY "Companies can delete own giveaways"
  ON giveaways FOR DELETE
  USING (company_id = current_setting('app.company_id', true));

-- Public read access for active giveaways (for entry pages)
CREATE POLICY "Public can view active giveaways"
  ON giveaways FOR SELECT
  USING (status = 'active');

-- Entries policies
CREATE POLICY "Companies can view entries for own giveaways"
  ON entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM giveaways g
      WHERE g.id = entries.giveaway_id
      AND g.company_id = current_setting('app.company_id', true)
    )
  );

CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  USING (user_id = current_setting('app.user_id', true));

CREATE POLICY "Users can enter active giveaways"
  ON entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giveaways g
      WHERE g.id = giveaway_id
      AND g.status = 'active'
      AND NOW() BETWEEN g.start_date AND g.end_date
    )
  );

-- Actions completed policies
CREATE POLICY "Companies can view actions for own giveaways"
  ON actions_completed FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries e
      JOIN giveaways g ON g.id = e.giveaway_id
      WHERE e.id = actions_completed.entry_id
      AND g.company_id = current_setting('app.company_id', true)
    )
  );

CREATE POLICY "Users can view own actions"
  ON actions_completed FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.id = actions_completed.entry_id
      AND e.user_id = current_setting('app.user_id', true)
    )
  );

CREATE POLICY "Users can complete actions for own entries"
  ON actions_completed FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.id = entry_id
      AND e.user_id = current_setting('app.user_id', true)
    )
  );

-- Winners policies
CREATE POLICY "Companies can manage winners for own giveaways"
  ON winners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM giveaways g
      WHERE g.id = winners.giveaway_id
      AND g.company_id = current_setting('app.company_id', true)
    )
  );

CREATE POLICY "Public can view winners of ended giveaways"
  ON winners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM giveaways g
      WHERE g.id = winners.giveaway_id
      AND g.status = 'ended'
    )
  );

-- ============================================================================
-- SERVICE ROLE BYPASS
-- ============================================================================

CREATE POLICY "Service role full access to giveaways"
  ON giveaways FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role full access to entries"
  ON entries FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role full access to actions"
  ON actions_completed FOR ALL
  USING (current_setting('role', true) = 'service_role');

CREATE POLICY "Service role full access to winners"
  ON winners FOR ALL
  USING (current_setting('role', true) = 'service_role');
