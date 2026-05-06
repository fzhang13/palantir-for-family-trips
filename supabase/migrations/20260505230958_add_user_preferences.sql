-- Migration: add_user_preferences
-- Generated: 2026-05-06T03:09:58.572Z

-- =============================================================================
-- ADD_USER_PREFERENCES
-- =============================================================================

-- Migrations are run in a transaction by default
-- If you need to disable this, use: -- migrate:no-transaction

-- Write your SQL migration here

-- =============================================================================
-- Common Examples (delete what you don't need):
-- =============================================================================

-- -- Create a new table with timestamps and soft delete:
-- create table example_table (
--   id uuid primary key default gen_random_uuid(),
--   name text not null,
--   description text,
--   metadata jsonb default '{}',
--   created_at timestamptz default now(),
--   updated_at timestamptz default now(),
--   deleted_at timestamptz
-- );

-- -- Add updated_at trigger:
-- create trigger example_table_updated_at
--   before update on example_table
--   for each row execute function update_updated_at();

-- -- Add a new column to existing table:
-- alter table trips
--   add column example_field text;

-- -- Create an index:
-- create index idx_example_table_name on example_table(name);

-- -- Add foreign key constraint:
-- alter table example_table
--   add constraint fk_trip foreign key (trip_id) references trips(id) on delete cascade;

-- -- Enable RLS (Row Level Security):
-- alter table example_table enable row level security;

-- -- Create RLS policy:
-- create policy "Allow all access for now"
--   on example_table for all
--   using (true);
