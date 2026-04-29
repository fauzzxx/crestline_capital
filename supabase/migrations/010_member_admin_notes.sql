-- Add admin_notes column to membership_requests for inline admin notes per applicant.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'membership_requests') THEN
    EXECUTE 'ALTER TABLE membership_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT';
  END IF;
END$$;
