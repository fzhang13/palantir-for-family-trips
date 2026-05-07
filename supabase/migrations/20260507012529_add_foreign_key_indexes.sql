-- Migration: add_foreign_key_indexes
-- Generated: 2026-05-07T05:25:29.085Z

-- =============================================================================
-- ADD_FOREIGN_KEY_INDEXES
-- =============================================================================

-- Add foreign key indexes for performance optimization
-- Prevents 10-100x performance degradation as data grows

-- itinerary_items foreign key indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_items_route_id ON itinerary_items(route_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_location_id ON itinerary_items(location_id);

-- meals foreign key index
CREATE INDEX IF NOT EXISTS idx_meals_location_id ON meals(location_id);

-- activities foreign key indexes
CREATE INDEX IF NOT EXISTS idx_activities_location_id ON activities(location_id);
CREATE INDEX IF NOT EXISTS idx_activities_backup_location_id ON activities(backup_location_id);

-- expenses composite index for common query pattern (filter by trip_id and settled status)
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id_settled ON expenses(trip_id, settled);

-- tasks composite index for common query pattern (filter by trip_id and status)
CREATE INDEX IF NOT EXISTS idx_tasks_trip_id_status ON tasks(trip_id, status);
