-- Migration: expense_fields_phase1
-- Add expense_date, category, payer_family_id
-- Remove split field

BEGIN;

-- Add new columns with defaults for backfill
ALTER TABLE expenses
  ADD COLUMN expense_date date DEFAULT CURRENT_DATE,
  ADD COLUMN category text DEFAULT 'other',
  ADD COLUMN payer_family_id uuid;

-- Backfill payer_family_id with first family in trip (CRITICAL fix)
UPDATE expenses
SET payer_family_id = (
  SELECT id FROM families
  WHERE trip_id = expenses.trip_id
  LIMIT 1
)
WHERE payer_family_id IS NULL;

-- Add NOT NULL constraints
ALTER TABLE expenses
  ALTER COLUMN expense_date SET NOT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN payer_family_id SET NOT NULL;

-- Add category constraint
ALTER TABLE expenses
  ADD CONSTRAINT expenses_category_check
  CHECK (category IN ('food', 'accommodation', 'transport', 'activities', 'other'));

-- Add foreign key
ALTER TABLE expenses
  ADD CONSTRAINT expenses_payer_family_id_fkey
  FOREIGN KEY (payer_family_id) REFERENCES families(id) ON DELETE RESTRICT;

-- Rename split column to deprecated (preserve data for recovery)
ALTER TABLE expenses RENAME COLUMN split TO _deprecated_split;

-- Backfill allocation_mode 'individual' to 'manual' before constraint change
UPDATE expenses
SET allocation_mode = 'manual'
WHERE allocation_mode = 'individual';

-- Update allocation_mode constraint (remove 'individual')
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_allocation_mode_check;
ALTER TABLE expenses
  ADD CONSTRAINT expenses_allocation_mode_check
  CHECK (allocation_mode IN ('equal', 'manual'));

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(trip_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_payer ON expenses(trip_id, payer_family_id);

COMMIT;
