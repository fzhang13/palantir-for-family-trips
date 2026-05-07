-- Migration: Add day range fields to locations and stay_items
-- This allows stays to reference day numbers within a trip instead of absolute dates
-- Example: A trip from May 10-15 (6 days), Stay 1 is days 1-3, Stay 2 is days 4-6

-- Add day ranges to locations table (for stay-category locations)
ALTER TABLE locations
ADD COLUMN start_day_number int,
ADD COLUMN end_day_number int;

-- Add a check constraint to ensure end_day >= start_day for locations
ALTER TABLE locations
ADD CONSTRAINT location_day_range_valid
CHECK (end_day_number IS NULL OR start_day_number IS NULL OR end_day_number >= start_day_number);

-- Add index for querying locations by day ranges
CREATE INDEX idx_locations_day_range ON locations(trip_id, category, start_day_number, end_day_number)
WHERE category = 'stay';

COMMENT ON COLUMN locations.start_day_number IS 'First day of stay (1-based, relative to trip start_date). Only used for category=stay';
COMMENT ON COLUMN locations.end_day_number IS 'Last day of stay (1-based, relative to trip start_date). Only used for category=stay';

-- Also add to stay_items for consistency (though currently not actively used)
ALTER TABLE stay_items
ADD COLUMN start_day_number int,
ADD COLUMN end_day_number int;

ALTER TABLE stay_items
ADD CONSTRAINT stay_day_range_valid
CHECK (end_day_number IS NULL OR start_day_number IS NULL OR end_day_number >= start_day_number);

CREATE INDEX idx_stay_items_day_range ON stay_items(trip_id, start_day_number, end_day_number);

COMMENT ON COLUMN stay_items.start_day_number IS 'First day of stay (1-based, relative to trip start_date)';
COMMENT ON COLUMN stay_items.end_day_number IS 'Last day of stay (1-based, relative to trip start_date)';
