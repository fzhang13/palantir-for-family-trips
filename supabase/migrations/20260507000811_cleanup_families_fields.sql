-- Migration: cleanup_families_fields
-- Generated: 2026-05-07

-- =============================================================================
-- CLEANUP_FAMILIES_FIELDS
-- =============================================================================

-- This migration removes the readiness column and transforms arrival_day_id
-- from weekday abbreviations (thu, fri, sat) to relative day numbers (day1, day2, day3)

-- Step 1: Transform arrival_day_id values from weekday abbreviations to day numbers
-- Query the days table to map day IDs to their sort_order
UPDATE families f
SET arrival_day_id = 'day' || (d.sort_order + 1)::text
FROM days d
WHERE f.trip_id = d.trip_id 
  AND LOWER(d.id) = LOWER(f.arrival_day_id)
  AND f.arrival_day_id IS NOT NULL;

-- Step 2: Drop the readiness column (no longer used in UI)
ALTER TABLE families DROP COLUMN IF EXISTS readiness;
