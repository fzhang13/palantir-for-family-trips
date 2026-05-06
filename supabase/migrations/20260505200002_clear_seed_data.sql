-- Migration: Remove all seed data
-- Deletes the demo trip and all child rows (cascades via FK)

delete from trips where id = '00000000-0000-0000-0000-000000000001';
