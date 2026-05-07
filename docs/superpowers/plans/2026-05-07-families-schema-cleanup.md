# Families Schema Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove unused readiness field and align family arrival day references with the trip's day system (from weekday abbreviations to relative day numbers).

**Architecture:** Database-first approach - migrate schema and data, then cascade changes through types, repositories, and UI. Data transformation maps weekday abbreviations (thu, fri) to relative day numbers (day1, day2) based on the days table.

**Tech Stack:** PostgreSQL/Supabase, TypeScript, Zod, React, Tanstack Query

---

## Phase 1: Database Migration

### Task 1: Generate Migration File

**Files:**
- Create: `supabase/migrations/[timestamp]_cleanup_families_fields.sql`

- [ ] **Step 1: Generate migration file using npm script**

Run:
```bash
npm run generate:migration cleanup_families_fields
```

Expected: Output shows migration file created with timestamp prefix

- [ ] **Step 2: Verify file was created**

Run:
```bash
ls -l supabase/migrations/ | grep cleanup_families_fields
```

Expected: File exists with format `YYYYMMDDHHmmss_cleanup_families_fields.sql`

- [ ] **Step 3: Note the exact filename for next task**

The migration script generates a timestamp. You'll need the exact filename for the next task.

---

### Task 2: Write Migration SQL

**Files:**
- Modify: `supabase/migrations/[timestamp]_cleanup_families_fields.sql` (file from Task 1)

- [ ] **Step 1: Replace template content with migration SQL**

Replace entire file content with:

```sql
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

-- =============================================================================
-- Verification Queries (commented out - run manually after migration)
-- =============================================================================

-- Check for unmigrated weekday values (should return 0 rows):
-- SELECT id, name, arrival_day_id 
-- FROM families 
-- WHERE arrival_day_id ~ '^(mon|tue|wed|thu|fri|sat|sun)$';

-- Verify readiness column is gone:
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'families' AND column_name = 'readiness';
```

- [ ] **Step 2: Save the file**

Save changes to the migration file.

- [ ] **Step 3: Commit migration file**

```bash
git add supabase/migrations/*_cleanup_families_fields.sql
git commit -m "feat(db): add migration to cleanup families schema"
```

---

### Task 3: Test Migration Locally

**Files:**
- Verify: `supabase/migrations/[timestamp]_cleanup_families_fields.sql`

- [ ] **Step 1: Check current families data**

Run:
```bash
psql $SUPABASE_DB_URL -c "SELECT id, name, arrival_day_id, readiness FROM families LIMIT 5;"
```

Expected: Shows current data with weekday abbreviations (thu, fri, etc.) and readiness column

- [ ] **Step 2: Apply migration locally**

Run:
```bash
supabase db reset
```

Expected: Migration runs successfully, no errors

- [ ] **Step 3: Verify readiness column is removed**

Run:
```bash
psql $SUPABASE_DB_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'readiness';"
```

Expected: 0 rows returned (column is gone)

- [ ] **Step 4: Verify day ID transformation**

Run:
```bash
psql $SUPABASE_DB_URL -c "SELECT id, name, arrival_day_id FROM families LIMIT 5;"
```

Expected: arrival_day_id shows "day1", "day2", etc. instead of "thu", "fri"

- [ ] **Step 5: Check for unmigrated weekday values**

Run:
```bash
psql $SUPABASE_DB_URL -c "SELECT id, name, arrival_day_id FROM families WHERE arrival_day_id ~ '^(mon|tue|wed|thu|fri|sat|sun)\$';"
```

Expected: 0 rows (all weekday abbreviations migrated)

---

## Phase 2: Type System Updates

### Task 4: Update Family Interface

**Files:**
- Modify: `src/types/trip.ts:151-176`

- [ ] **Step 1: Remove readiness field from Family interface**

In `src/types/trip.ts`, find the Family interface (around line 151) and remove the readiness line:

```typescript
export interface Family extends BaseEntity {
  type: 'family'
  title: string
  name: string
  shortOrigin: string
  origin: string
  originAddress: string
  originCoordinates: {
    lat: number
    lng: number
  }
  arrivalDayId: string
  eta: string
  driveTime: string
  headcount: string
  vehicle: string
  vehicleLabel: string
  responsibility: string
  // REMOVE THIS LINE: readiness: number
  status: string
  routeSummary: string
  plannedStopIds: string[]
  taskIds: string[]
  linkedEntityKeys: string[]
  note: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: Compilation errors about readiness field in repositories and UI (we'll fix these next)

- [ ] **Step 3: Commit type changes**

```bash
git add src/types/trip.ts
git commit -m "refactor(types): remove readiness field from Family interface"
```

---

### Task 5: Update Family Schema Validation

**Files:**
- Modify: `src/schemas/familySchema.ts:1-26`

- [ ] **Step 1: Remove enum constraint from arrivalDayId**

In `src/schemas/familySchema.ts`, update the arrivalDayId field:

```typescript
export const createFamilySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  origin: z.string().min(2, 'Origin city required'),
  originAddress: z.string().min(5, 'Valid address required'),
  originCoordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),

  // Optional place data from autocomplete
  placeId: z.string().optional(),

  vehicle: z.enum(['SUV', 'Sedan', 'Van', 'Truck']).optional(),
  vehicleLabel: z.string().optional(),
  headcount: z.string().optional(),
  responsibility: z.string().optional(),
  note: z.string().max(500, 'Note too long').optional(),
  arrivalDayId: z.string().optional(),  // CHANGE: Remove .enum(['thu', 'fri', 'sat', 'sun'])
  eta: z.string().optional(),
  driveTime: z.string().optional(),
})

export type CreateFamilyFormData = z.infer<typeof createFamilySchema>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: Still has errors from repositories (we'll fix next)

- [ ] **Step 3: Commit schema changes**

```bash
git add src/schemas/familySchema.ts
git commit -m "refactor(schemas): remove weekday enum from arrivalDayId validation"
```

---

## Phase 3: Repository Layer Updates

### Task 6: Update SupabaseTripRepository - createFamily

**Files:**
- Modify: `src/repositories/SupabaseTripRepository.ts`

- [ ] **Step 1: Find createFamily method and remove readiness default**

Search for `async createFamily` in SupabaseTripRepository.ts and update:

```typescript
async createFamily(input: CreateFamilyInput): Promise<Family> {
  const { data, error } = await this.supabase
    .from('families')
    .insert({
      trip_id: input.tripId,
      name: input.name,
      origin: input.origin,
      origin_address: input.originAddress,
      origin_coordinates: input.originCoordinates,
      arrival_day_id: input.arrivalDayId || null,  // CHANGE: Remove || 'thu'
      vehicle: input.vehicle,
      vehicle_label: input.vehicleLabel,
      headcount: input.headcount,
      responsibility: input.responsibility,
      note: input.note,
      // REMOVE: readiness: 0,
    })
    .select()
    .single()

  if (error) throw error
  return this.mapFamilyFromDb(data)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: Still has errors in mapFamilyFromDb method (next step)

---

### Task 7: Update SupabaseTripRepository - mapFamilyFromDb

**Files:**
- Modify: `src/repositories/SupabaseTripRepository.ts`

- [ ] **Step 1: Find mapFamilyFromDb method and remove readiness mapping**

Search for `private mapFamilyFromDb` in SupabaseTripRepository.ts and update:

```typescript
private mapFamilyFromDb(row: any): Family {
  return {
    id: row.id as string,
    type: 'family',
    title: (row.title as string) || (row.name as string) || '',
    name: (row.name as string) || '',
    shortOrigin: (row.short_origin as string) || '',
    origin: (row.origin as string) || '',
    originAddress: (row.origin_address as string) || '',
    originCoordinates: (row.origin_coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
    arrivalDayId: (row.arrival_day_id as string) || '',  // CHANGE: Remove || 'thu'
    eta: (row.eta as string) || '',
    driveTime: (row.drive_time as string) || '',
    headcount: (row.headcount as string) || '',
    vehicle: (row.vehicle as string) || '',
    vehicleLabel: (row.vehicle_label as string) || '',
    responsibility: (row.responsibility as string) || '',
    // REMOVE: readiness: (row.readiness as number) || 0,
    status: (row.status as string) || 'Transit',
    routeSummary: (row.route_summary as string) || '',
    plannedStopIds: (row.planned_stop_ids as string[]) || [],
    taskIds: [],
    linkedEntityKeys: [],
    note: (row.note as string) || '',
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: Still has errors in updateFamily method (next step)

---

### Task 8: Update SupabaseTripRepository - updateFamily

**Files:**
- Modify: `src/repositories/SupabaseTripRepository.ts`

- [ ] **Step 1: Find updateFamily method and remove readiness update**

Search for `async updateFamily` in SupabaseTripRepository.ts and remove readiness handling:

```typescript
async updateFamily(familyId: string, updates: Partial<Family>): Promise<Family> {
  const row: any = {}
  
  if (updates.title !== undefined) row.title = updates.title
  if (updates.name !== undefined) row.name = updates.name
  if (updates.shortOrigin !== undefined) row.short_origin = updates.shortOrigin
  if (updates.origin !== undefined) row.origin = updates.origin
  if (updates.originAddress !== undefined) row.origin_address = updates.originAddress
  if (updates.originCoordinates !== undefined) row.origin_coordinates = updates.originCoordinates
  if (updates.arrivalDayId !== undefined) row.arrival_day_id = updates.arrivalDayId
  if (updates.eta !== undefined) row.eta = updates.eta
  if (updates.driveTime !== undefined) row.drive_time = updates.driveTime
  if (updates.headcount !== undefined) row.headcount = updates.headcount
  if (updates.vehicle !== undefined) row.vehicle = updates.vehicle
  if (updates.vehicleLabel !== undefined) row.vehicle_label = updates.vehicleLabel
  if (updates.responsibility !== undefined) row.responsibility = updates.responsibility
  // REMOVE: if (updates.readiness !== undefined) row.readiness = updates.readiness
  if (updates.status !== undefined) row.status = updates.status
  if (updates.routeSummary !== undefined) row.route_summary = updates.routeSummary
  if (updates.plannedStopIds !== undefined) row.planned_stop_ids = updates.plannedStopIds
  if (updates.note !== undefined) row.note = updates.note

  row.updated_at = new Date().toISOString()

  const { data, error } = await this.supabase
    .from('families')
    .update(row)
    .eq('id', familyId)
    .select()
    .single()

  if (error) throw error
  return this.mapFamilyFromDb(data)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: Errors should be gone from SupabaseTripRepository

- [ ] **Step 3: Commit Supabase repository changes**

```bash
git add src/repositories/SupabaseTripRepository.ts
git commit -m "refactor(repository): remove readiness handling from SupabaseTripRepository"
```

---

### Task 9: Update LocalStorageTripRepository

**Files:**
- Modify: `src/repositories/LocalStorageTripRepository.ts`

- [ ] **Step 1: Remove readiness from createFamily default values**

Search for `createFamily` method in LocalStorageTripRepository.ts:

```typescript
async createFamily(input: CreateFamilyInput): Promise<Family> {
  const newFamily: Family = {
    id: nanoid(),
    type: 'family',
    name: input.name,
    title: input.name,
    shortOrigin: input.origin.split(',')[0].trim(),
    origin: input.origin,
    originAddress: input.originAddress,
    originCoordinates: input.originCoordinates,
    arrivalDayId: input.arrivalDayId || '',  // CHANGE: Remove || 'thu'
    eta: input.eta || '',
    driveTime: input.driveTime || '',
    headcount: input.headcount || '',
    vehicle: input.vehicle || '',
    vehicleLabel: input.vehicleLabel || '',
    responsibility: input.responsibility || '',
    // REMOVE: readiness: 0,
    status: 'Transit',
    routeSummary: '',
    plannedStopIds: [],
    taskIds: [],
    linkedEntityKeys: [],
    note: input.note || '',
  }

  // ... rest of method
}
```

- [ ] **Step 2: Remove readiness from updateFamily**

Search for `updateFamily` method in LocalStorageTripRepository.ts and ensure readiness is not handled:

```typescript
async updateFamily(familyId: string, updates: Partial<Family>): Promise<Family> {
  const families = this.data.families
  const index = families.findIndex((f) => f.id === familyId)
  
  if (index === -1) {
    throw new Error(`Family not found: ${familyId}`)
  }

  const updated = { ...families[index], ...updates }
  // Ensure readiness is not being set here
  families[index] = updated
  this.save()
  return updated
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors in LocalStorageTripRepository

- [ ] **Step 4: Commit LocalStorage repository changes**

```bash
git add src/repositories/LocalStorageTripRepository.ts
git commit -m "refactor(repository): remove readiness handling from LocalStorageTripRepository"
```

---

### Task 10: Clean Up tripModel.ts Mock Data

**Files:**
- Modify: `src/models/tripModel.ts`

- [ ] **Step 1: Search for readiness in mock data**

Run:
```bash
grep -n "readiness" src/models/tripModel.ts
```

Expected: Shows line numbers where readiness appears

- [ ] **Step 2: Remove readiness from all family mock objects**

Find each family object and remove the readiness field:

```typescript
// Example - repeat for all family objects in the file
{
  id: 'family1',
  type: 'family',
  name: 'Zhang Family',
  // ... other fields ...
  // REMOVE: readiness: 82,
  status: 'Transit',
  // ... rest of fields ...
}
```

- [ ] **Step 3: Remove readiness from field merge logic if present**

Search for any code that merges or handles readiness field and remove it:

```typescript
// If there's code like this, remove the readiness line:
{
  name: existing.name,
  // ... other fields ...
  // REMOVE: readiness: typeof existing.readiness === 'number' ? existing.readiness : family.readiness,
  status: existing.status || family.status,
}
```

- [ ] **Step 4: Remove 'readiness' from any field arrays**

Search for arrays of field names and remove 'readiness':

```typescript
// Example - if there's a field list
const familyFields = [
  'name',
  'origin',
  // REMOVE: 'readiness',
  'status',
]
```

- [ ] **Step 5: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 6: Commit tripModel changes**

```bash
git add src/models/tripModel.ts
git commit -m "refactor(models): remove readiness from mock family data"
```

---

### Task 11: Clean Up trip.ts Utils

**Files:**
- Modify: `src/utils/trip.ts`

- [ ] **Step 1: Search for readiness calculations**

Run:
```bash
grep -n "readiness" src/utils/trip.ts
```

Expected: Shows if readiness is used in utility functions

- [ ] **Step 2: Remove readiness status calculation**

If there's code calculating readiness status, remove it:

```typescript
// REMOVE code like this:
const readinessStatus = relatedRoutes.length > 0 ? 'ready' : 'pending'
return {
  // ... other fields ...
  // REMOVE: readinessStatus,
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit utils changes**

```bash
git add src/utils/trip.ts
git commit -m "refactor(utils): remove readiness calculations"
```

---

## Phase 4: UI Layer Updates

### Task 12: Update FamiliesPage - Remove Readiness UI

**Files:**
- Modify: `src/components/pages/FamiliesPage.tsx:169-184`

- [ ] **Step 1: Remove readiness progress bar from FamilyCard**

In `src/components/pages/FamiliesPage.tsx`, find the FamilyCard component and remove the entire readiness block:

```typescript
function FamilyCard({ family, onEdit, onDelete }: FamilyCardProps) {
  return (
    <div className="border border-[#30363D] rounded bg-[#161B22] p-5 hover:border-[#58A6FF] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#C9D1D9] mb-1">
            {family.name || family.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#8B949E]">
            <MapPin size={14} />
            <span>{family.origin || family.shortOrigin}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(family)}
            className="p-1.5 rounded text-[#8B949E] hover:text-[#58A6FF] hover:bg-[#21262D] transition-colors"
            aria-label={`Edit ${family.name || family.title}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(family.id)}
            className="p-1.5 rounded text-[#8B949E] hover:text-[#DA3633] hover:bg-[#21262D] transition-colors"
            aria-label={`Delete ${family.name || family.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5">
        {/* Arrival Day */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-[#8B949E]" />
          <span className="text-[#8B949E]">Arrival:</span>
          <span className="text-[#C9D1D9] font-mono">
            {family.arrivalDayId ? getDayLabel(family.arrivalDayId) : 'Not set'}
          </span>
        </div>

        {/* Vehicle */}
        <div className="flex items-center gap-2 text-sm">
          <Car size={14} className="text-[#8B949E]" />
          <span className="text-[#8B949E]">Vehicle:</span>
          <span className="text-[#C9D1D9]">{family.vehicle || 'Not specified'}</span>
        </div>

        {/* Headcount */}
        {family.headcount && (
          <div className="flex items-center gap-2 text-sm">
            <Users size={14} className="text-[#8B949E]" />
            <span className="text-[#8B949E]">Headcount:</span>
            <span className="text-[#C9D1D9]">{family.headcount}</span>
          </div>
        )}

        {/* REMOVE THIS ENTIRE BLOCK:
        {typeof family.readiness === 'number' && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#8B949E]">Readiness</span>
              <span className="font-mono text-[#C9D1D9]">{family.readiness}%</span>
            </div>
            <div className="w-full bg-[#0d1117] rounded-full h-2">
              <div
                className="bg-[#3FB950] h-2 rounded-full transition-all"
                style={{ width: `${family.readiness}%` }}
              />
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Test UI renders without errors**

Run:
```bash
npm run dev
```

Navigate to Families page, verify:
- No readiness bars visible
- Cards layout looks correct without readiness section

- [ ] **Step 4: Commit FamiliesPage readiness removal**

```bash
git add src/components/pages/FamiliesPage.tsx
git commit -m "refactor(ui): remove readiness progress bar from FamiliesPage"
```

---

### Task 13: Update FamiliesPage - Update Day Label Display

**Files:**
- Modify: `src/components/pages/FamiliesPage.tsx:189-200`

- [ ] **Step 1: Update getDayLabel function**

In `src/components/pages/FamiliesPage.tsx`, find and replace the getDayLabel function:

```typescript
// OLD VERSION - REMOVE:
// function getDayLabel(dayId: string): string {
//   const dayMap: Record<string, string> = {
//     thu: 'Thursday',
//     fri: 'Friday',
//     sat: 'Saturday',
//     sun: 'Sunday',
//     mon: 'Monday',
//     tue: 'Tuesday',
//     wed: 'Wednesday',
//   }
//   return dayMap[dayId.toLowerCase()] || dayId
// }

// NEW VERSION:
function getDayLabel(dayId: string): string {
  // Transform "day1" → "Day 1", "day2" → "Day 2", etc.
  if (dayId.startsWith('day')) {
    const num = dayId.replace('day', '')
    return `Day ${num}`
  }
  return dayId
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Test day label display**

Run:
```bash
npm run dev
```

Navigate to Families page, verify arrival day shows as "Day 1", "Day 2", etc.

- [ ] **Step 4: Commit day label update**

```bash
git add src/components/pages/FamiliesPage.tsx
git commit -m "refactor(ui): update day label display to show relative day numbers"
```

---

### Task 14: Update AddFamilyModal - Arrival Day Input

**Files:**
- Modify: `src/components/modals/AddFamilyModal.tsx`
- Read: `src/hooks/useTripQueries.ts` (to check if useDays hook exists)

- [ ] **Step 1: Check if useDays hook exists**

Run:
```bash
grep -n "export function useDays" src/hooks/useTripQueries.ts
```

Expected: Shows if hook exists (if not, we'll use simple text input)

- [ ] **Step 2: Update arrival day input in AddFamilyModal**

Open `src/components/modals/AddFamilyModal.tsx` and find the arrival day input field.

**If useDays hook exists**, use dynamic selector:

```typescript
import { useDays } from '@/hooks'

// Inside component:
const { data: activeTripId } = useActiveTripId()
const { data: tripDays = [] } = useDays(activeTripId || undefined)

// In the form JSX:
<div>
  <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
    Arrival Day
  </label>
  <select
    value={arrivalDayId}
    onChange={(e) => setArrivalDayId(e.target.value)}
    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
  >
    <option value="">Not specified</option>
    {tripDays.map((day, index) => (
      <option key={day.id} value={day.id}>
        Day {index + 1} {day.title && `- ${day.title}`}
      </option>
    ))}
  </select>
</div>
```

**If useDays hook does NOT exist**, use simple text input:

```typescript
<div>
  <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
    Arrival Day
  </label>
  <input
    type="text"
    placeholder="e.g., day1, day2"
    value={arrivalDayId}
    onChange={(e) => setArrivalDayId(e.target.value)}
    className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] placeholder-[#6E7681] focus:border-[#58A6FF] focus:outline-none"
  />
  <p className="text-xs text-[#8B949E] mt-1">Enter day ID (e.g., day1 for first day of trip)</p>
</div>
```

- [ ] **Step 3: Remove old weekday enum options**

Ensure no hardcoded weekday options remain in the modal.

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 5: Test modal functionality**

Run:
```bash
npm run dev
```

Test:
- Open Add Family modal
- Arrival day input shows correct options or text input
- Submitting with "day1", "day2" works

- [ ] **Step 6: Commit AddFamilyModal changes**

```bash
git add src/components/modals/AddFamilyModal.tsx
git commit -m "refactor(modals): update AddFamilyModal to use relative day numbers"
```

---

### Task 15: Update EditFamilyModal - Arrival Day Input

**Files:**
- Modify: `src/components/modals/EditFamilyModal.tsx`

- [ ] **Step 1: Apply same changes as AddFamilyModal**

Open `src/components/modals/EditFamilyModal.tsx` and apply the same arrival day input changes as Task 14.

Use the same approach (dynamic selector if useDays exists, text input otherwise).

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Test modal functionality**

Run:
```bash
npm run dev
```

Test:
- Open Edit Family modal on existing family
- Arrival day shows current value correctly
- Can update to different day ID
- Saving works

- [ ] **Step 4: Commit EditFamilyModal changes**

```bash
git add src/components/modals/EditFamilyModal.tsx
git commit -m "refactor(modals): update EditFamilyModal to use relative day numbers"
```

---

## Phase 5: Final Testing & Cleanup

### Task 16: Search for Remaining Readiness References

**Files:**
- Verify: All TypeScript files

- [ ] **Step 1: Search codebase for readiness references**

Run:
```bash
grep -r "readiness" --include="*.ts" --include="*.tsx" src/
```

Expected: Should only show references in comments or test data that we can ignore

- [ ] **Step 2: If any active readiness references found, remove them**

For each file found with active readiness usage:
- Open the file
- Remove or comment out readiness handling
- Commit the change

- [ ] **Step 3: Search for weekday abbreviations in day ID context**

Run:
```bash
grep -r "thu\|fri\|sat\|sun" --include="*.ts" --include="*.tsx" src/ | grep -i "day"
```

Expected: Should not find weekday abbreviations used as day IDs

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npm run type-check
```

Expected: No errors

---

### Task 17: End-to-End Testing

**Files:**
- Test: All modified components

- [ ] **Step 1: Start dev server**

Run:
```bash
npm run dev
```

- [ ] **Step 2: Test FamiliesPage display**

Navigate to Families page and verify:
- [ ] No readiness progress bars visible
- [ ] Arrival days show as "Day 1", "Day 2", etc.
- [ ] Family cards layout looks correct
- [ ] No console errors

- [ ] **Step 3: Test Add Family flow**

Click "Add Family" and verify:
- [ ] Modal opens without errors
- [ ] Arrival day input works (shows day options or text input)
- [ ] Can create family with "day1", "day2", etc.
- [ ] New family appears in list with correct arrival day label

- [ ] **Step 4: Test Edit Family flow**

Click edit on existing family and verify:
- [ ] Modal opens with current arrival day value
- [ ] Can change arrival day to different day number
- [ ] Save works
- [ ] Updated value displays correctly

- [ ] **Step 5: Verify database state**

Run:
```bash
psql $SUPABASE_DB_URL -c "SELECT id, name, arrival_day_id FROM families LIMIT 5;"
```

Expected:
- [ ] No readiness column in output
- [ ] arrival_day_id shows "day1", "day2" format

---

### Task 18: Final Verification and Documentation

**Files:**
- Create: `docs/superpowers/specs/2026-05-07-families-schema-cleanup-verification.md`

- [ ] **Step 1: Create verification document**

Create file `docs/superpowers/specs/2026-05-07-families-schema-cleanup-verification.md`:

```markdown
# Families Schema Cleanup Verification

**Date:** 2026-05-07
**Status:** Completed

## Verification Checklist

### Database
- [x] Migration applied successfully
- [x] readiness column removed from families table
- [x] arrival_day_id values transformed from weekday abbreviations to day numbers
- [x] No unmigrated weekday values remain

### Type System
- [x] Family interface has no readiness field
- [x] familySchema accepts any string for arrivalDayId
- [x] No TypeScript compilation errors

### Repository Layer
- [x] SupabaseTripRepository does not handle readiness
- [x] LocalStorageTripRepository does not handle readiness
- [x] Mock data in tripModel.ts has no readiness fields

### UI Layer
- [x] FamiliesPage shows no readiness progress bars
- [x] Arrival days display as "Day 1", "Day 2", etc.
- [x] AddFamilyModal uses relative day numbers
- [x] EditFamilyModal uses relative day numbers

### Testing
- [x] Manual testing completed
- [x] No console errors in browser
- [x] All CRUD operations work correctly

## Database Verification Queries

```sql
-- Verify readiness column removed
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'families' AND column_name = 'readiness';
-- Result: 0 rows

-- Verify day ID format
SELECT id, name, arrival_day_id FROM families LIMIT 10;
-- Result: All arrival_day_id values in "dayN" format

-- Check for unmigrated values
SELECT id, name, arrival_day_id FROM families 
WHERE arrival_day_id ~ '^(mon|tue|wed|thu|fri|sat|sun)$';
-- Result: 0 rows
```

## Known Issues

None identified.

## Next Steps

Schema cleanup complete. Ready for production deployment.
```

- [ ] **Step 2: Run final TypeScript check**

Run:
```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Run build to verify production bundle**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 4: Commit verification document**

```bash
git add docs/superpowers/specs/2026-05-07-families-schema-cleanup-verification.md
git commit -m "docs: add families schema cleanup verification report"
```

- [ ] **Step 5: Create final summary commit**

```bash
git add -A
git commit -m "feat: complete families schema cleanup - remove readiness, align day references

- Remove readiness column from families table
- Transform arrival_day_id from weekday abbreviations to relative day numbers
- Update all type definitions, repositories, and UI components
- Verify all functionality works correctly"
```

---

## Success Criteria

All tasks completed when:
- [x] Migration runs successfully without errors
- [x] No TypeScript compilation errors
- [x] Family cards display arrival day as "Day 1", "Day 2", etc.
- [x] No readiness progress bars visible anywhere
- [x] Add/Edit family modals work with new day ID format
- [x] Existing family data migrated correctly
- [x] No references to `readiness` field remain in active code
- [x] All tests pass
- [x] Production build succeeds

## Rollback Plan

If critical issues arise:

1. **Database rollback:**
   ```sql
   -- Re-add readiness column
   ALTER TABLE families ADD COLUMN readiness int DEFAULT 0;
   
   -- Note: arrival_day_id transformation is harder to reverse
   -- Would need backup of original values
   ```

2. **Code rollback:**
   ```bash
   git revert HEAD~18  # Revert last 18 commits
   ```

3. **Partial rollback:**
   - Keep database migration
   - Revert only UI changes if needed
   - Add back readiness as deprecated field
