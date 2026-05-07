# Families Schema Cleanup Design

**Date:** 2026-05-07  
**Status:** Approved  
**Author:** Claude Code

## Overview

Clean up the `families` table schema by removing redundant/unused fields and aligning day references with the rest of the system.

### Problems Being Solved

1. **Inconsistent day referencing**: Families use weekday abbreviations ("thu", "fri", "sat") while meals, activities, and stay items use relative day IDs ("day1", "day2", "day3")
2. **Unused readiness field**: The 0-100% readiness progress bar provides no clear value and clutters the UI
3. **Redundant arrival tracking**: No need for separate `arrival_date` when we have `arrival_day_id`

### Goals

- Standardize day references across all entities
- Remove unused UI elements and database columns
- Maintain data integrity during migration
- Keep the schema simpler and more maintainable

## Database Migration Design

### Migration Generation

Use the existing migration script to create a timestamped migration file:

```bash
npm run generate:migration cleanup_families_fields
```

This will create: `supabase/migrations/YYYYMMDDHHmmss_cleanup_families_fields.sql`

### Migration SQL

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
-- Edge Cases Handled
-- =============================================================================

-- NULL arrival_day_id values: Left as NULL (no update needed)
-- Mismatched day IDs: Left unchanged (will be visible for manual cleanup)
-- Multiple trips: Handled via trip_id join in UPDATE statement

-- =============================================================================
-- Verification Queries (run after migration)
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

### Rollback Plan

If migration fails or needs to be reversed:

```sql
-- Add readiness column back
ALTER TABLE families ADD COLUMN readiness int DEFAULT 0;

-- Reverse day ID transformation (requires backup of original values)
-- This assumes you have a backup table or have noted the original mappings
```

**Recommendation**: Test migration on local database first with `supabase db reset` before pushing to remote.

## Type System Updates

### File: `src/types/trip.ts`

**Current Family interface:**
```typescript
export interface Family extends BaseEntity {
  type: 'family'
  title: string
  name: string
  shortOrigin: string
  origin: string
  originAddress: string
  originCoordinates: { lat: number; lng: number }
  arrivalDayId: string
  eta: string
  driveTime: string
  headcount: string
  vehicle: string
  vehicleLabel: string
  responsibility: string
  readiness: number        // REMOVE THIS
  status: string
  routeSummary: string
  plannedStopIds: string[]
  taskIds: string[]
  linkedEntityKeys: string[]
  note: string
}
```

**Updated Family interface:**
```typescript
export interface Family extends BaseEntity {
  type: 'family'
  title: string
  name: string
  shortOrigin: string
  origin: string
  originAddress: string
  originCoordinates: { lat: number; lng: number }
  arrivalDayId: string     // Now expects "day1", "day2", etc.
  eta: string
  driveTime: string
  headcount: string
  vehicle: string
  vehicleLabel: string
  responsibility: string
  // readiness removed
  status: string
  routeSummary: string
  plannedStopIds: string[]
  taskIds: string[]
  linkedEntityKeys: string[]
  note: string
}
```

### File: `src/schemas/familySchema.ts`

**Current schema:**
```typescript
export const createFamilySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  origin: z.string().min(2, 'Origin city required'),
  originAddress: z.string().min(5, 'Valid address required'),
  originCoordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  placeId: z.string().optional(),
  vehicle: z.enum(['SUV', 'Sedan', 'Van', 'Truck']).optional(),
  vehicleLabel: z.string().optional(),
  headcount: z.string().optional(),
  responsibility: z.string().optional(),
  note: z.string().max(500, 'Note too long').optional(),
  arrivalDayId: z.enum(['thu', 'fri', 'sat', 'sun']).optional(),  // CHANGE THIS
  eta: z.string().optional(),
  driveTime: z.string().optional(),
})
```

**Updated schema:**
```typescript
export const createFamilySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  origin: z.string().min(2, 'Origin city required'),
  originAddress: z.string().min(5, 'Valid address required'),
  originCoordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  placeId: z.string().optional(),
  vehicle: z.enum(['SUV', 'Sedan', 'Van', 'Truck']).optional(),
  vehicleLabel: z.string().optional(),
  headcount: z.string().optional(),
  responsibility: z.string().optional(),
  note: z.string().max(500, 'Note too long').optional(),
  arrivalDayId: z.string().optional(),  // Accept any string (day1, day2, etc.)
  eta: z.string().optional(),
  driveTime: z.string().optional(),
})
```

## Repository Layer Updates

### File: `src/repositories/SupabaseTripRepository.ts`

**createFamily method - remove readiness default:**

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
      arrival_day_id: input.arrivalDayId || null,  // Remove default 'thu'
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

**mapFamilyFromDb method - remove readiness mapping:**

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
    arrivalDayId: (row.arrival_day_id as string) || '',  // Remove default 'thu'
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

**updateFamily method - remove readiness update:**

```typescript
async updateFamily(familyId: string, updates: Partial<Family>): Promise<Family> {
  const row: any = {}
  
  // ... other field mappings ...
  
  if (updates.arrivalDayId !== undefined) row.arrival_day_id = updates.arrivalDayId
  // REMOVE: if (updates.readiness !== undefined) row.readiness = updates.readiness
  
  // ... rest of method
}
```

### File: `src/repositories/LocalStorageTripRepository.ts`

Apply the same changes to maintain consistency:
- Remove `readiness: 0` from createFamily default values
- Remove readiness mapping in mapFamilyFromStorage
- Remove readiness update handling in updateFamily

### File: `src/models/tripModel.ts`

Remove readiness from mock/seed data:
- Remove readiness field from demo family objects
- Remove readiness from field merge logic if present

## UI Layer Updates

### File: `src/components/pages/FamiliesPage.tsx`

**Remove readiness progress bar from FamilyCard component:**

```typescript
function FamilyCard({ family, onEdit, onDelete }: FamilyCardProps) {
  return (
    <div className="border border-[#30363D] rounded bg-[#161B22] p-5 hover:border-[#58A6FF] transition-colors">
      {/* ... header ... */}
      
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

        {/* REMOVE ENTIRE READINESS BLOCK:
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

**Update getDayLabel function:**

```typescript
// OLD: Weekday mapping
function getDayLabel(dayId: string): string {
  const dayMap: Record<string, string> = {
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
  }
  return dayMap[dayId.toLowerCase()] || dayId
}

// NEW: Day number display
function getDayLabel(dayId: string): string {
  // Transform "day1" → "Day 1", "day2" → "Day 2", etc.
  if (dayId.startsWith('day')) {
    const num = dayId.replace('day', '')
    return `Day ${num}`
  }
  return dayId
}
```

### File: `src/components/modals/AddFamilyModal.tsx`

**Update arrival day input** (if modal has this field):

Current approach: Hardcoded weekday dropdown  
New approach: Query trip's days to build dynamic options

```typescript
// Option 1: Dynamic day selector from trip's days table
const { data: tripDays = [] } = useDays(tripId)

<select 
  value={arrivalDayId}
  onChange={(e) => setArrivalDayId(e.target.value)}
  className="..."
>
  <option value="">Not specified</option>
  {tripDays.map((day, index) => (
    <option key={day.id} value={day.id}>
      Day {index + 1} - {day.title || day.shortLabel}
    </option>
  ))}
</select>

// Option 2: Simple text input (if days aren't loaded yet)
<input
  type="text"
  placeholder="e.g., day1, day2"
  value={arrivalDayId}
  onChange={(e) => setArrivalDayId(e.target.value)}
  className="..."
/>
```

**Recommendation**: Use Option 1 (dynamic selector) for better UX and data validation.

### File: `src/components/modals/EditFamilyModal.tsx`

Apply the same arrival day input changes as AddFamilyModal.

## Testing Approach

### Database Migration Testing

1. **Local testing:**
   ```bash
   # Reset local database with new migration
   supabase db reset
   
   # Verify readiness column is gone
   psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'families' AND column_name = 'readiness';"
   
   # Verify day ID transformation
   psql $DATABASE_URL -c "SELECT id, name, arrival_day_id FROM families LIMIT 5;"
   ```

2. **Check for unmigrated values:**
   ```sql
   SELECT id, name, arrival_day_id 
   FROM families 
   WHERE arrival_day_id ~ '^(mon|tue|wed|thu|fri|sat|sun)$';
   -- Should return 0 rows
   ```

### Type System Testing

1. **TypeScript compilation:**
   ```bash
   npm run type-check
   ```
   Should have no errors related to Family.readiness

2. **Zod schema validation:**
   Test that familySchema accepts "day1", "day2" values and rejects old "thu", "fri" if validation is added

### UI Testing

1. **FamiliesPage rendering:**
   - Verify no readiness bars are shown
   - Verify arrival day displays as "Day 1", "Day 2", etc.
   - Verify layout doesn't break with removed readiness section

2. **Add/Edit modals:**
   - Verify arrival day selector shows trip days
   - Verify submitting form with "day1", "day2" works
   - Verify old "thu", "fri" values display correctly in edit mode

3. **Manual testing checklist:**
   - [ ] Create new family with arrival day
   - [ ] Edit existing family's arrival day
   - [ ] View family card - no readiness bar
   - [ ] Arrival day displays correctly as "Day X"

## Files Affected Summary

### Database
- `supabase/migrations/YYYYMMDDHHmmss_cleanup_families_fields.sql` (new)

### Type Definitions
- `src/types/trip.ts` (modify Family interface)
- `src/schemas/familySchema.ts` (modify createFamilySchema)

### Repository Layer
- `src/repositories/SupabaseTripRepository.ts` (remove readiness handling)
- `src/repositories/LocalStorageTripRepository.ts` (remove readiness handling)
- `src/models/tripModel.ts` (remove readiness from seed data)

### UI Components
- `src/components/pages/FamiliesPage.tsx` (remove readiness UI, update day labels)
- `src/components/modals/AddFamilyModal.tsx` (update arrival day input)
- `src/components/modals/EditFamilyModal.tsx` (update arrival day input)

### Utilities
- `src/utils/trip.ts` (remove readiness calculations if present)

## Implementation Order

1. **Phase 1: Database** - Create and run migration
2. **Phase 2: Types** - Update TypeScript interfaces and Zod schemas
3. **Phase 3: Repository** - Update database access layer
4. **Phase 4: UI** - Update components and modals
5. **Phase 5: Testing** - Verify all changes work together
6. **Phase 6: Cleanup** - Remove any remaining readiness references

## Success Criteria

- [ ] Migration runs successfully without errors
- [ ] No TypeScript compilation errors
- [ ] Family cards display arrival day as "Day 1", "Day 2", etc.
- [ ] No readiness progress bars visible anywhere
- [ ] Add/Edit family modals work with new day ID format
- [ ] Existing family data migrated correctly (old "thu" → "day1", etc.)
- [ ] No references to `readiness` field remain in codebase

## Rollback Strategy

If issues arise:

1. **Before migration push:**
   - Local database can be reset: `supabase db reset` (will lose local data)
   - Code changes can be reverted via git

2. **After migration push:**
   - Requires manual rollback migration
   - Requires reverting code changes
   - Data transformation is lossy (weekday names lost, need backup)

**Recommendation**: Keep a backup of production data before running migration on remote database.
