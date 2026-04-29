ALTER TABLE builders ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS established_year INTEGER;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS past_projects_count INTEGER DEFAULT 0;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS total_units_delivered INTEGER DEFAULT 0;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS rera_numbers TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'builders' AND column_name = 'trust_score'
  ) THEN
    BEGIN
      ALTER TABLE builders DROP CONSTRAINT IF EXISTS builders_trust_score_check;
      ALTER TABLE builders ADD CONSTRAINT builders_trust_score_check
        CHECK (trust_score IS NULL OR (trust_score >= 0 AND trust_score <= 100));
    EXCEPTION WHEN others THEN NULL;
    END;
  ELSE
    ALTER TABLE builders ADD COLUMN trust_score INTEGER CHECK (trust_score IS NULL OR (trust_score >= 0 AND trust_score <= 100));
  END IF;
END$$;
