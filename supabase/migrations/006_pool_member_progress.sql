ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS payment_stage TEXT DEFAULT 'not_started';
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS documentation_status TEXT DEFAULT 'not_started';
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS builder_meeting_at TIMESTAMPTZ;
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS member_notes TEXT;
CREATE INDEX IF NOT EXISTS idx_pool_members_payment_stage ON pool_members(payment_stage);
