# Location-Entity Dual-Record Schema Design

**Date:** 2026-05-05  
**Status:** Approved  
**Author:** Claude (brainstorming with user)

## Problem Statement

When adding a meal via AddLocationModal (with `category='meal'`), only a `locations` record is created. The Meals tab queries the `meals` table, which remains empty, so the newly added meal doesn't appear.

The same issue exists for activities and stay items - the specialized tables (`meals`, `activities`, `stay_items`) are never populated when locations are created via AddLocationModal.

## Solution Overview

Implement a dual-record creation pattern at the repository layer:
- When `addLocation()` is called, automatically create both a `locations` record AND the corresponding entity record (`meal`, `activity`, or `stay_item`) based on the location's category
- Use repository-layer orchestration with transaction semantics
- Simplify location categories to three: `stay`, `meal`, `activity`

## Design Decisions

### 1. Dual-Record Creation Pattern

**Approach:** Repository layer orchestration (Approach A from brainstorming)

**Why:**
- Centralized logic in one place (`SupabaseTripRepository.addLocation()`)
- Transaction safety - both records created atomically
- Simple for callers - no API changes needed
- Consistent behavior across the app

**Rejected alternatives:**
- Hook/service layer orchestration - no transaction safety, orphaned records possible
- Database triggers - logic hidden in DB, harder to debug and test

### 2. Category Simplification

**Current categories:** `['stay', 'meal', 'logistics', 'park']`  
**New categories:** `['stay', 'meal', 'activity']`

**Rationale:**
- `logistics` and `park` both map to the `activities` table
- Simpler mental model - three categories, three specialized tables
- Reduces cognitive load in UI dropdowns

**Migration requirement:**
- Existing locations with `category='logistics'` or `category='park'` must be migrated to `category='activity'`

### 3. Default Values for Auto-Created Entities

When a location is created, the corresponding entity record gets sensible defaults:

**Meals:**
- `status`: `'Pending'`
- `owner`: `''` (empty string)
- `day_id`: inherited from `location.day_id`
- `start_slot`: `0`
- `location_id`: the newly created location's ID

**Activities:**
- `status`: `'Go'`
- `day_id`: inherited from `location.day_id`
- `window`: `''` (empty string)
- `location_id`: the newly created location's ID

**Stay Items:**
- `day_id`: inherited from `location.day_id`
- `category`: `''` (empty string)
- `summary`: `''` (empty string)
- `location_id`: the newly created location's ID

**Design principle:** Create minimal valid records. Users can edit entity-specific fields later via the tab-specific edit modals.

### 4. API Changes

**Repository method signature change:**

```typescript
// Before
async addLocation(tripId: string, input: CreateLocationInput): Promise<Location>

// After
async addLocation(tripId: string, input: CreateLocationInput): Promise<{
  location: Location
  entityId?: string  // ID of created meal/activity/stay_item
}>
```

**Rationale:**
- Callers need to know what entity was created for potential navigation or refresh logic
- Optional `entityId` because it only exists for stay/meal/activity categories

## Architecture

### Component Interaction

```
┌─────────────────────┐
│ AddLocationModal    │
│                     │
│ category='meal'     │
└──────────┬──────────┘
           │
           │ calls addLocation()
           ▼
┌─────────────────────────────────────┐
│ SupabaseTripRepository              │
│                                     │
│ addLocation(tripId, input) {        │
│   1. Insert into locations          │
│   2. Get new location.id            │
│   3. Switch on category:            │
│      - 'meal' → insert meals        │
│      - 'activity' → insert activities│
│      - 'stay' → insert stay_items   │
│   4. Return { location, entityId }  │
│ }                                   │
└─────────────────────────────────────┘
           │
           │
           ▼
┌─────────────────────┐    ┌──────────────────┐
│ locations table     │    │ meals table      │
│                     │    │                  │
│ id, title, address, │◄───│ location_id (FK) │
│ category='meal'     │    │ status, owner... │
└─────────────────────┘    └──────────────────┘
```

### Data Flow

1. User fills AddLocationModal form with category='meal'
2. Form submits → `useAddLocation()` hook → `addLocation(tripId, formData)`
3. Repository:
   - Inserts location record
   - Detects `category='meal'`
   - Inserts meal record with `location_id` FK and defaults
4. Returns `{ location, entityId: mealId }`
5. React Query invalidates both `locations` and `meals` queries
6. Meals tab re-renders with new meal visible

## Database Schema Changes

### Migration: Update location category enum

```sql
-- Migration: 20260505_simplify_location_categories.sql

-- Step 1: Update existing records
UPDATE locations 
SET category = 'activity' 
WHERE category IN ('logistics', 'park');

-- Step 2: Drop old constraint and add new one
ALTER TABLE locations 
DROP CONSTRAINT IF EXISTS locations_category_check;

ALTER TABLE locations 
ADD CONSTRAINT locations_category_check 
CHECK (category IN ('stay', 'meal', 'activity'));
```

### TypeScript Schema Update

**File:** `src/schemas/locationSchema.ts`

```typescript
export const createLocationSchema = z.object({
  title: z.string().min(1, 'Location name is required').max(200, 'Name too long'),
  category: z.enum(['stay', 'meal', 'activity']).catch('activity'), // Changed
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }),
  placeId: z.string().optional(),
  summary: z.string().max(1000, 'Summary too long').optional(),
})
```

## Implementation Details

### Repository Method: `addLocation()`

**Pseudocode:**

```typescript
async addLocation(tripId: string, input: CreateLocationInput): Promise<{
  location: Location
  entityId?: string
}> {
  await this.ensureTrip(tripId)
  
  // 1. Insert location
  const locationRow = { /* map input to DB columns */ }
  const { data: location, error: locErr } = await this.client
    .from('locations')
    .insert(locationRow)
    .select()
    .single()
  
  if (locErr) throw new Error(locErr.message)
  
  // 2. Create corresponding entity based on category
  let entityId: string | undefined
  
  switch (input.category) {
    case 'meal': {
      const mealRow = {
        trip_id: tripId,
        location_id: location.id,
        title: input.title,
        day_id: input.dayId || 'all',
        start_slot: 0,
        status: 'Pending',
        owner: '',
      }
      const { data: meal, error: mealErr } = await this.client
        .from('meals')
        .insert(mealRow)
        .select('id')
        .single()
      
      if (mealErr) throw new Error(mealErr.message)
      entityId = meal.id
      break
    }
    
    case 'activity': {
      const activityRow = {
        trip_id: tripId,
        location_id: location.id,
        title: input.title,
        day_id: input.dayId || 'all',
        status: 'Go',
        window: '',
      }
      const { data: activity, error: actErr } = await this.client
        .from('activities')
        .insert(activityRow)
        .select('id')
        .single()
      
      if (actErr) throw new Error(actErr.message)
      entityId = activity.id
      break
    }
    
    case 'stay': {
      const stayRow = {
        trip_id: tripId,
        location_id: location.id,
        title: input.title,
        day_id: input.dayId || 'all',
        category: '',
        summary: input.summary || '',
      }
      const { data: stayItem, error: stayErr } = await this.client
        .from('stay_items')
        .insert(stayRow)
        .select('id')
        .single()
      
      if (stayErr) throw new Error(stayErr.message)
      entityId = stayItem.id
      break
    }
  }
  
  return {
    location: this.mapLocationFromDb(location),
    entityId,
  }
}
```

### Hook Update: `useAddLocation()`

**File:** `src/hooks/useTripMutations.ts`

The hook should invalidate both `locations` and the relevant entity query:

```typescript
export function useAddLocation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ tripId, location }: { tripId: string; location: CreateLocationInput }) =>
      supabaseTripRepository.addLocation(tripId, location),
    onSuccess: (data, variables) => {
      const { location } = data
      
      // Invalidate locations query
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId, 'locations'] })
      
      // Invalidate entity-specific query based on category
      switch (location.category) {
        case 'meal':
          queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId, 'meals'] })
          break
        case 'activity':
          queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId, 'activities'] })
          break
        case 'stay':
          queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId, 'stay_items'] })
          break
      }
    },
  })
}
```

## UI Changes

### AddLocationModal

**File:** `src/components/modals/AddLocationModal.tsx`

Update category dropdown options:

```tsx
<select {...register('category')} className="...">
  <option value="stay">Stay</option>
  <option value="meal">Meal</option>
  <option value="activity">Activity</option> {/* Changed from 'logistics' */}
</select>
```

No other changes needed - form submission already uses `addLocation()`.

### Tab-Specific "Add" Modals

**Requirement:** When adding a meal/activity/stay from the respective tab, user must select an existing location.

**Example: AddMealModal (new component)**

```tsx
interface AddMealModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddMealModal({ isOpen, onClose }: AddMealModalProps) {
  const { data: locations } = useLocations(DEFAULT_TRIP_ID)
  const addMeal = useAddMeal()
  
  // Form with:
  // - Location selector (dropdown or autocomplete)
  // - Owner field
  // - Status field (Pending/Assigned/Confirmed)
  // - Time label
  // - Reservation type
  // - Day selector
  // - Start slot (time)
  
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Add Meal">
      <form onSubmit={handleSubmit}>
        {/* Location dropdown */}
        <select {...register('locationId')} required>
          <option value="">Select location...</option>
          {locations?.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.title}</option>
          ))}
        </select>
        
        {/* Meal-specific fields */}
        {/* ... */}
      </form>
    </BaseModal>
  )
}
```

**Same pattern applies to:**
- `AddActivityModal` - select location + activity fields
- `AddStayModal` - select location + stay fields

## Query Changes

### Meals Tab

**Current (broken):**
```typescript
// Queries meals table, but it's empty
const { data: meals } = useMeals(tripId)
```

**After implementation:**
```typescript
// Queries meals table (now populated via dual-record creation)
// Joined with locations for address/coordinates
const { data: meals } = useMeals(tripId) // Already correct!
```

No query changes needed - the `meals` table will now be populated.

## Testing Strategy

### Unit Tests

1. **Repository tests:**
   - Test `addLocation()` with `category='meal'` creates both location and meal
   - Test `addLocation()` with `category='activity'` creates both location and activity
   - Test `addLocation()` with `category='stay'` creates both location and stay_item
   - Test transaction rollback on entity insert failure

2. **Hook tests:**
   - Test `useAddLocation()` invalidates correct queries based on category

### Integration Tests

1. **User flow test:**
   - Open AddLocationModal
   - Fill form with category='meal'
   - Submit
   - Navigate to Meals tab
   - Verify meal appears in table

2. **Edge cases:**
   - Test adding meal with same location title (should create separate records)
   - Test editing meal after creation (via Meals tab)

### Migration Testing

1. **Data migration:**
   - Create test data with `category='logistics'` and `category='park'`
   - Run migration
   - Verify all converted to `category='activity'`
   - Verify no data loss

## Rollout Plan

### Phase 1: Database Migration
1. Create migration file `20260505_simplify_location_categories.sql`
2. Test migration on local Supabase instance
3. Run migration on production

### Phase 2: Backend Implementation
1. Update `locationSchema.ts` category enum
2. Modify `SupabaseTripRepository.addLocation()` to implement dual-record creation
3. Update `useAddLocation()` hook to invalidate correct queries
4. Add repository unit tests

### Phase 3: UI Updates
1. Update AddLocationModal category dropdown
2. Create AddMealModal component (if doesn't exist)
3. Create AddActivityModal component (if doesn't exist)
4. Update Meals/Activities/Stay tabs to use new modals

### Phase 4: Testing & Verification
1. Manual testing of all flows
2. Verify meals/activities/stays appear in respective tabs
3. Verify location editing doesn't break entity associations

## Success Criteria

- ✅ Adding a meal via AddLocationModal creates both location and meal records
- ✅ Meal appears in Meals tab immediately after creation
- ✅ Same behavior for activities and stays
- ✅ Category dropdown shows only 3 options: Stay, Meal, Activity
- ✅ No orphaned locations or entities
- ✅ Existing locations with old categories successfully migrated
- ✅ Tab-specific "Add" modals require selecting existing locations

## Future Considerations

### Orphan Cleanup

**Question:** What happens to a meal/activity/stay_item when its location is deleted?

**Current behavior:** `ON DELETE SET NULL` for `location_id` FK

**Recommendation:** Consider `ON DELETE CASCADE` instead - if the venue is deleted, the associated meal/activity/stay should also be deleted. Otherwise you have meals pointing to non-existent locations.

### Bulk Operations

If users need to create many locations at once (e.g., importing from spreadsheet), consider:
- Batch insert endpoint that uses the same dual-record logic
- Transaction wrapping for all-or-nothing semantics

### Location Reuse

**Current design:** Every meal/activity/stay gets its own location record.

**Alternative:** Allow multiple meals to reference the same location (e.g., "McDonald's Moab" can have breakfast and dinner meals).

**Trade-off:** Simplicity (current) vs. normalization (alternative). Current design is simpler for MVP. Can refactor later if location duplication becomes a problem.

## Open Questions

None - all questions resolved during brainstorming session.
