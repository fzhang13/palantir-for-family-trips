-- Migration: Add trip status for archiving
-- Date: 2026-05-06

BEGIN;

-- Add status column to trips
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'archived'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);

-- Set all existing trips to 'active'
UPDATE trips SET status = 'active' WHERE status IS NULL;

COMMIT;
