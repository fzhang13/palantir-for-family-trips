-- Supabase Migration: Initial Schema for Trip Command Center
-- Created: 2026-05-05

-- =============================================================================
-- UTILITY: updated_at trigger function
-- =============================================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================================
-- TABLE: trips
-- =============================================================================
create table trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  start_date date,
  end_date date,
  timezone text default 'America/Los_Angeles',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trips_updated_at
  before update on trips
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: days
-- =============================================================================
create table days (
  id text not null,
  trip_id uuid not null references trips(id) on delete cascade,
  short_label text,
  title text,
  date date,
  sort_order int not null default 0,
  weather text,
  temperature text,
  caution text,
  primary key (trip_id, id)
);

-- =============================================================================
-- TABLE: families
-- =============================================================================
create table families (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  title text,
  short_origin text,
  origin text,
  origin_address text,
  origin_coordinates jsonb, -- {lat, lng}
  arrival_day_id text,
  eta text,
  drive_time text,
  headcount text,
  vehicle text,
  vehicle_label text,
  responsibility text,
  readiness int default 0,
  status text default 'Transit',
  route_summary text,
  planned_stop_ids text[] default '{}',
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_families_trip on families(trip_id);

create trigger families_updated_at
  before update on families
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: locations
-- =============================================================================
create table locations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text not null,
  category text check (category in ('stay', 'meal', 'logistics', 'park')),
  day_id text,
  address text,
  coordinates jsonb, -- {lat, lng}
  external_url text,
  summary text,
  parking_note text,
  access_note text,
  directions_note text,
  lock_note text,
  check_in text,
  check_out text,
  wifi_network text,
  wifi_password text,
  host_name text,
  co_host_name text,
  guest_summary text,
  confirmation_code text,
  vehicle_fee text,
  manual_url text,
  photos jsonb default '[]', -- [{id, label, imageUrl, sourceUrl}]
  stop_type text,
  places_query text,
  reservation_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_locations_trip on locations(trip_id);
create index idx_locations_category on locations(trip_id, category);

create trigger locations_updated_at
  before update on locations
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: routes
-- =============================================================================
create table routes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  day_id text,
  family_id uuid references families(id) on delete set null,
  tone text,
  origin_coordinates jsonb, -- {lat, lng}
  stop_location_ids uuid[] default '{}',
  destination_location_id uuid references locations(id) on delete set null,
  simulation_start_slot int,
  simulation_end_slot int,
  duration_seconds int,
  simulation_milestones jsonb, -- [{t, progress}]
  path jsonb, -- [{lat, lng}] or encoded polyline
  dashed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_routes_trip on routes(trip_id);
create index idx_routes_family on routes(family_id);

create trigger routes_updated_at
  before update on routes
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: itinerary_items
-- =============================================================================
create table itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  row_id text,
  day_id text,
  start_slot int,
  span int,
  color text,
  family_ids uuid[] default '{}',
  route_id uuid references routes(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  status text,
  risk_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_itinerary_items_trip on itinerary_items(trip_id);
create index idx_itinerary_items_day on itinerary_items(trip_id, day_id);

create trigger itinerary_items_updated_at
  before update on itinerary_items
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: meals
-- =============================================================================
create table meals (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  day_id text,
  start_slot int,
  status text check (status in ('Assigned', 'Pending', 'Confirmed')),
  owner text,
  reservation_type text,
  time_label text,
  location_id uuid references locations(id) on delete set null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_meals_trip on meals(trip_id);

create trigger meals_updated_at
  before update on meals
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: activities
-- =============================================================================
create table activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  day_id text,
  "window" text,
  status text check (status in ('Go', 'Watch')),
  risk_level text,
  weather_sensitivity text,
  location_id uuid references locations(id) on delete set null,
  description text,
  backup text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_activities_trip on activities(trip_id);

create trigger activities_updated_at
  before update on activities
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: stay_items
-- =============================================================================
create table stay_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  day_id text,
  location_id uuid references locations(id) on delete set null,
  category text,
  summary text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_stay_items_trip on stay_items(trip_id);

create trigger stay_items_updated_at
  before update on stay_items
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: expenses
-- =============================================================================
create table expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  payer text,
  amount numeric(10, 2) default 0,
  split text,
  allocation_mode text check (allocation_mode in ('equal', 'manual', 'individual')),
  allocations jsonb default '{}', -- {familyName: amount}
  settled boolean default false,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_expenses_trip on expenses(trip_id);

create trigger expenses_updated_at
  before update on expenses
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: tasks
-- =============================================================================
create table tasks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text,
  day_id text,
  status text check (status in ('done', 'open', 'blocked')),
  owner_family_id uuid references families(id) on delete set null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_tasks_trip on tasks(trip_id);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: page_notes (collaborative notes per page per trip)
-- =============================================================================
create table page_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  page text not null check (page in ('itinerary', 'stay', 'meals', 'activities', 'expenses', 'families')),
  content text default '',
  meta jsonb default '{}',
  updated_at timestamptz default now(),
  unique(trip_id, page)
);

create trigger page_notes_updated_at
  before update on page_notes
  for each row execute function update_updated_at();

-- =============================================================================
-- TABLE: entity_links (cross-entity references, replaces linkedEntityKeys[])
-- =============================================================================
create table entity_links (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  source_type text not null,
  source_id uuid not null,
  target_type text not null,
  target_id uuid not null,
  unique(source_type, source_id, target_type, target_id)
);

create index idx_entity_links_source on entity_links(source_type, source_id);
create index idx_entity_links_target on entity_links(target_type, target_id);

-- =============================================================================
-- TABLE: entity_tasks (task assignments to entities, replaces taskIds[])
-- =============================================================================
create table entity_tasks (
  entity_type text not null,
  entity_id uuid not null,
  task_id uuid not null references tasks(id) on delete cascade,
  primary key (entity_type, entity_id, task_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY: Permissive policies (no auth for now)
-- =============================================================================
alter table trips enable row level security;
alter table days enable row level security;
alter table families enable row level security;
alter table locations enable row level security;
alter table routes enable row level security;
alter table itinerary_items enable row level security;
alter table meals enable row level security;
alter table activities enable row level security;
alter table stay_items enable row level security;
alter table expenses enable row level security;
alter table tasks enable row level security;
alter table page_notes enable row level security;
alter table entity_links enable row level security;
alter table entity_tasks enable row level security;

-- Allow all operations (no auth enforcement yet)
create policy "Allow all" on trips for all using (true) with check (true);
create policy "Allow all" on days for all using (true) with check (true);
create policy "Allow all" on families for all using (true) with check (true);
create policy "Allow all" on locations for all using (true) with check (true);
create policy "Allow all" on routes for all using (true) with check (true);
create policy "Allow all" on itinerary_items for all using (true) with check (true);
create policy "Allow all" on meals for all using (true) with check (true);
create policy "Allow all" on activities for all using (true) with check (true);
create policy "Allow all" on stay_items for all using (true) with check (true);
create policy "Allow all" on expenses for all using (true) with check (true);
create policy "Allow all" on tasks for all using (true) with check (true);
create policy "Allow all" on page_notes for all using (true) with check (true);
create policy "Allow all" on entity_links for all using (true) with check (true);
create policy "Allow all" on entity_tasks for all using (true) with check (true);

-- =============================================================================
-- REALTIME: Enable for all entity tables
-- =============================================================================
alter publication supabase_realtime add table families;
alter publication supabase_realtime add table locations;
alter publication supabase_realtime add table routes;
alter publication supabase_realtime add table itinerary_items;
alter publication supabase_realtime add table meals;
alter publication supabase_realtime add table activities;
alter publication supabase_realtime add table stay_items;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table page_notes;
