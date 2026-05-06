#!/usr/bin/env node
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function generateTimestamp() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_')      // Replace spaces with underscores
    .replace(/_+/g, '_')       // Replace multiple underscores with single
    .trim()
}

function createMigration(name) {
  if (!name) {
    console.error('❌ Error: Migration name is required')
    console.log('\nUsage:')
    console.log('  npm run generate:migration <migration-name>')
    console.log('\nExample:')
    console.log('  npm run generate:migration add_user_preferences')
    process.exit(1)
  }

  const timestamp = generateTimestamp()
  const slug = slugify(name)
  const filename = `${timestamp}_${slug}.sql`
  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')
  const filepath = join(migrationsDir, filename)

  // Ensure migrations directory exists
  if (!existsSync(migrationsDir)) {
    mkdirSync(migrationsDir, { recursive: true })
  }

  // Check if file already exists (unlikely but possible)
  if (existsSync(filepath)) {
    console.error(`❌ Error: Migration file already exists: ${filename}`)
    process.exit(1)
  }

  // Create migration file with template
  const template = `-- Migration: ${slug}
-- Generated: ${new Date().toISOString()}

-- =============================================================================
-- ${name.toUpperCase()}
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
`

  writeFileSync(filepath, template, 'utf-8')

  console.log('✅ Migration created successfully!')
  console.log(`📄 ${filename}`)
  console.log(`📍 ${filepath}`)
  console.log('\nNext steps:')
  console.log('1. Edit the migration file with your SQL')
  console.log('2. Apply it to your local database: supabase db reset')
  console.log('3. Or push to remote: supabase db push')
}

// Get migration name from command line arguments
const migrationName = process.argv[2]
createMigration(migrationName)
