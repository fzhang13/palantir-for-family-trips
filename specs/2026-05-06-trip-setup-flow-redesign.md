# Trip Setup Flow Redesign

**Date:** 2026-05-06  
**Status:** Approved

## Overview

Redesign the trip initialization flow to move trip setup from the Settings modal to a dedicated setup page. Implement active trip management with localStorage caching, database validation, and support for archiving completed trips.

## Goals

1. **Improved UX**: First-time users see a clean setup form instead of an empty dashboard with a hidden settings modal
2. **Active trip management**: Support multiple trips over time with one "active" trip at a time
3. **Archive functionality**: Allow users to archive completed trips and start new ones
4. **Performance**: Lazy-load page components and heavy dependencies (Google Maps) on-demand
5. **Data persistence**: Use localStorage for quick resume with database validation

## Non-Goals

- Multi-trip selector or trip browser UI (future enhancement)
- User authentication system (remains single-user/single-family)
- Viewing archived trips (data preserved but no UI to browse)
- Trip sharing or collaboration features

## Design Decisions

### Initial App State

**Approved approach: Centered Setup Form (Option A)**

When no active trip exists, show a clean centered form without AppShell. After submission, transition to full dashboard.

**Why this approach:**
- Focused first-time experience
- No visual clutter or disabled UI elements
- Clean mental model: Setup → Dashboard transition

### Active Trip Management

**Approach: Hybrid localStorage + Database (Option B)**

- **Quick resume**: Check localStorage for `activeTrip_id`
- **Validation**: Always verify against database that trip exists and `status='active'`
- **Fallback**: If localStorage is invalid, query DB for most recent active trip
- **No trip found**: Show setup page

**Why hybrid:**
- Fast app load (no DB query if localStorage is valid)
- Resilient to external changes (trip archived elsewhere)
- No constant DB fetching for every page load

### Lazy Loading Strategy

**Approach: Page-level code splitting (Option C)**

Each page component lazy-loads with `React.lazy()` and `Suspense`:
- Itinerary page → includes Google Maps
- Stay, Meals, Activities, Expenses, Families → load on first visit
- Subsequent navigation is instant (bundler caches)

**Why page-level:**
- Fast initial transition from setup to dashboard
- Map library only loads when needed (significant savings)
- Natural loading boundaries (users expect brief load when switching tabs)
- Vite makes this trivial to implement

### Archive Functionality

**Location**: Settings modal only (not in header)
**Post-archive behavior**: Redirect to setup page (clean slate)

**Why this approach:**
- Archiving is rare and significant (end of trip)
- Settings is where trip metadata lives
- Prevents accidental clicks
- Simple circular flow: Setup → Use → Archive → Setup

## Architecture

### Component Structure

**New Components:**
```
src/components/pages/TripSetupPage.tsx
```
Centered form for creating new trips. Shown when `activeTripId === null`.

**New Context:**
```
src/context/ActiveTripContext.tsx
```
Manages active trip state, localStorage sync, and DB validation.

**New Hooks:**
```
src/hooks/useActiveTripId.ts      // Returns current active trip ID or null
src/hooks/useCreateTrip.ts        // Mutation to create + set active
src/hooks/useArchiveTrip.ts       // Mutation to archive + clear active
```

**Modified Components:**
```
src/App.tsx                       // Conditional render: Setup vs AppShell
src/components/ui/AppShell.tsx    // Use useActiveTripId() instead of constant
src/components/modals/TripSettingsModal.tsx  // Add archive button
src/components/pages/*.tsx        // Wrap with React.lazy()
```

### File Structure

```
src/
├── context/
│   ├── index.ts
│   ├── TripContext.tsx            (existing)
│   └── ActiveTripContext.tsx      (NEW)
├── components/
│   ├── pages/
│   │   ├── TripSetupPage.tsx      (NEW)
│   │   ├── ItineraryPage.tsx      (lazy-loaded)
│   │   ├── StayPage.tsx           (lazy-loaded)
│   │   ├── MealsPage.tsx          (lazy-loaded)
│   │   ├── ActivitiesPage.tsx     (lazy-loaded)
│   │   ├── ExpensesPage.tsx       (lazy-loaded)
│   │   └── FamiliesPage.tsx       (lazy-loaded)
│   └── modals/
│       └── TripSettingsModal.tsx  (modified: add archive button)
├── hooks/
│   ├── useActiveTripId.ts         (NEW)
│   ├── useCreateTrip.ts           (NEW)
│   ├── useArchiveTrip.ts          (NEW)
│   └── useTripQueries.ts          (modified: remove DEFAULT_TRIP_ID)
├── lib/
│   └── constants.ts               (remove DEFAULT_TRIP_ID constant)
└── App.tsx                        (modified: conditional rendering)
```

## Data Flow

### Active Trip Resolution (App Load)

```
1. ActiveTripProvider initializes
2. Check localStorage for 'activeTrip_id'
3. If found:
   a. Query DB: SELECT * FROM trips WHERE id = ? AND status = 'active'
   b. If valid → use it, set in context
   c. If invalid → clear localStorage, proceed to step 4
4. If not found:
   a. Query DB: SELECT id FROM trips WHERE status = 'active' ORDER BY start_date DESC LIMIT 1
   b. If found → set in localStorage + context
   c. If not found → activeTripId = null (show setup page)
```

### Creating a New Trip

```
1. User fills TripSetupPage form
2. Submit → useCreateTrip() mutation
3. Repository.createTrip(input) → INSERT INTO trips
4. On success:
   a. Set localStorage 'activeTrip_id' = new trip ID
   b. Update ActiveTripContext.activeTripId
   c. Invalidate React Query cache for ['trips', 'active']
5. Context change triggers App re-render → shows AppShell
```

### Archiving a Trip

```
1. User opens Settings modal → clicks "Archive Trip"
2. Confirmation dialog: "Archive [Trip Name]?"
3. Confirm → useArchiveTrip() mutation
4. Repository.archiveTrip(id) → UPDATE trips SET status = 'archived'
5. On success:
   a. Clear localStorage 'activeTrip_id'
   b. Set ActiveTripContext.activeTripId = null
   c. Invalidate all trip-related queries
6. Context change triggers App re-render → shows TripSetupPage
7. Show toast: "[Trip Name] archived"
```

### Lazy Loading Flow

```
1. User navigates to a page (e.g., clicks "Itinerary" in sidebar)
2. React.lazy() triggers dynamic import
3. Suspense boundary shows <PageLoadingSpinner /> (~100-200ms)
4. Page component + dependencies load
5. Bundler caches chunk in browser
6. Subsequent visits to same page → instant (no spinner)
```

## UI/UX Behavior

### Initial Load States

**No active trip exists:**
- Render `TripSetupPage` immediately (no loading spinner)
- Centered form with clean background
- No AppShell chrome visible

**Active trip exists:**
- Show brief loading spinner (validating from DB)
- Transition to AppShell with last visited page (default: Itinerary)
- Pages lazy-load on first navigation

### Trip Setup Form

**Fields:**
- Trip Name (text input, required)
- Start Date (date picker, required)
- End Date (date picker, required, must be >= start date)
- Timezone (dropdown, default: America/Los_Angeles)

**Validation:**
- All fields required
- End date must be after start date
- Trip name must be non-empty after trim

**Submit button:**
- Label: "Create Trip"
- Shows loading state during mutation (spinner + disabled)
- On success: Smooth transition to dashboard (no page reload)
- On error: Show inline error message in form, keep modal open

### Archive Flow

**Trigger:** Settings modal → "Archive Trip" button (bottom section, danger style)

**Confirmation:**
- Dialog: "Archive [Trip Name]? You can view it later in archived trips."
- Buttons: "Cancel" (secondary), "Archive" (danger)

**Success:**
- Brief loading state
- Redirect to TripSetupPage
- Toast notification: "[Trip Name] archived"
- All trip data preserved in database with `status='archived'`

### Error Handling

**Database connection fails:**
- Show error boundary with retry button
- Message: "Unable to connect to database. Check your connection and try again."

**Active trip deleted externally:**
- Detect on validation (404 from DB)
- Clear localStorage
- Fall back to setup page
- No error shown (graceful degradation)

**Create trip mutation fails:**
- Show inline error in form
- Keep form values (don't reset)
- Allow user to retry

**Archive trip mutation fails:**
- Show error dialog
- Don't close Settings modal
- Allow user to retry or cancel

## Database Layer

### Schema

**No migration needed** - trips table already has `status` column from migration `20260506150055_initial_schema.sql`.

**Trip record:**
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT DEFAULT 'active',  -- 'active' | 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Repository Interface

**Add to TripRepository interface:**

```typescript
interface TripRepository {
  // ... existing methods

  // New methods:
  createTrip(input: CreateTripInput): Promise<Trip>
  getActiveTripId(): Promise<string | null>
  archiveTrip(tripId: string): Promise<void>
}
```

**CreateTripInput type:**

```typescript
interface CreateTripInput {
  title: string
  start_date: string    // ISO 8601 date
  end_date: string      // ISO 8601 date
  timezone: string
}
```

### Repository Implementation (Supabase)

**createTrip:**
```typescript
async createTrip(input: CreateTripInput): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      title: input.title,
      start_date: input.start_date,
      end_date: input.end_date,
      timezone: input.timezone,
      status: 'active'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

**getActiveTripId:**
```typescript
async getActiveTripId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('id')
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error) throw error
  return data?.id || null
}
```

**archiveTrip:**
```typescript
async archiveTrip(tripId: string): Promise<void> {
  const { error } = await supabase
    .from('trips')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', tripId)
  
  if (error) throw error
}
```

### React Query Integration

**New Queries:**

```typescript
// useActiveTripId.ts
export function useActiveTripId() {
  const [localStorageId, setLocalStorageId] = useState<string | null>(
    () => localStorage.getItem('activeTrip_id')
  )

  return useQuery({
    queryKey: ['trips', 'active', localStorageId],
    queryFn: async () => {
      // Validate localStorage ID if it exists
      if (localStorageId) {
        const { data } = await supabase
          .from('trips')
          .select('id')
          .eq('id', localStorageId)
          .eq('status', 'active')
          .maybeSingle()
        
        if (data) return localStorageId
        
        // Invalid - clear and fall through
        localStorage.removeItem('activeTrip_id')
      }

      // Query for any active trip
      const repo = getTripRepository()
      const tripId = await repo.getActiveTripId()
      
      if (tripId) {
        localStorage.setItem('activeTrip_id', tripId)
        setLocalStorageId(tripId)
      }
      
      return tripId
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

**New Mutations:**

```typescript
// useCreateTrip.ts
export function useCreateTrip() {
  const queryClient = useQueryClient()
  const { setActiveTripId } = useActiveTripContext()

  return useMutation({
    mutationFn: async (input: CreateTripInput) => {
      const repo = getTripRepository()
      return repo.createTrip(input)
    },
    onSuccess: (trip) => {
      // Set localStorage and context
      localStorage.setItem('activeTrip_id', trip.id)
      setActiveTripId(trip.id)
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

// useArchiveTrip.ts
export function useArchiveTrip() {
  const queryClient = useQueryClient()
  const { setActiveTripId } = useActiveTripContext()

  return useMutation({
    mutationFn: async (tripId: string) => {
      const repo = getTripRepository()
      return repo.archiveTrip(tripId)
    },
    onSuccess: () => {
      // Clear localStorage and context
      localStorage.removeItem('activeTrip_id')
      setActiveTripId(null)
      
      // Invalidate all trip queries
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['families'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['routes'] })
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
```

## localStorage

**Key:** `activeTrip_id`  
**Value:** UUID string or null (removed when no active trip)

**Read operations:**
- App initialization (ActiveTripProvider mount)
- Validation before using cached ID

**Write operations:**
- After successful trip creation
- After successful DB validation of existing trip

**Delete operations:**
- When DB validation fails (trip not found or archived)
- After archiving current trip
- When user clears browser data (automatic)

## Migration Path

### Phase 1: Add new infrastructure (non-breaking)
1. Create ActiveTripContext
2. Create TripSetupPage component
3. Add repository methods (createTrip, getActiveTripId, archiveTrip)
4. Add hooks (useActiveTripId, useCreateTrip, useArchiveTrip)

### Phase 2: Replace DEFAULT_TRIP_ID constant
1. Update all hooks to use `useActiveTripId()` instead of hardcoded constant
2. Update AppShell to use active trip ID from context
3. Test with existing hardcoded trip ID (should work transparently)

### Phase 3: Update App.tsx conditional rendering
1. Add conditional: `activeTripId ? <AppShell /> : <TripSetupPage />`
2. Wrap pages with React.lazy() and Suspense
3. Test setup → dashboard transition

### Phase 4: Add archive functionality
1. Add "Archive Trip" button to TripSettingsModal
2. Wire up mutation and confirmation dialog
3. Test archive → setup page flow

### Phase 5: Cleanup
1. Remove DEFAULT_TRIP_ID constant from constants.ts
2. Update any remaining hardcoded references
3. Add toast notifications for success states

## Testing Strategy

### Manual Testing Scenarios

**First-time user:**
1. Launch app with no localStorage
2. Verify TripSetupPage is shown
3. Fill form with valid data → submit
4. Verify transition to dashboard
5. Verify trip data is saved in DB

**Returning user:**
1. Launch app with valid localStorage ID
2. Verify quick load to dashboard (no DB query delay)
3. Verify correct trip data is shown

**Invalid localStorage:**
1. Set localStorage to non-existent trip ID
2. Launch app
3. Verify fallback to DB query
4. Verify TripSetupPage shown if no active trips

**Archive flow:**
1. Open Settings → Archive Trip
2. Confirm dialog
3. Verify redirect to TripSetupPage
4. Verify localStorage cleared
5. Verify trip status='archived' in DB

**Lazy loading:**
1. Load dashboard → measure network tab
2. Verify map chunk only loads when visiting Itinerary
3. Navigate between pages → verify subsequent loads are instant

### Edge Cases

**Multiple browser tabs:**
- Tab A archives trip → Tab B should detect on next interaction
- Solution: React Query refetch on window focus

**DB schema changes:**
- Old clients with new schema (status column didn't exist before)
- Backward compatible: `status IS NULL` treated as active

**Network failures:**
- Create trip fails → show error, keep form
- Archive fails → show error, don't redirect
- Validation query times out → show loading state, retry

## Success Criteria

1. ✅ First-time users see setup form, not empty dashboard
2. ✅ Setup → dashboard transition is smooth (no page reload)
3. ✅ Active trip persists across browser sessions via localStorage
4. ✅ Invalid localStorage gracefully falls back to DB query
5. ✅ Map only loads when user visits Itinerary page
6. ✅ Archive functionality works and redirects to setup
7. ✅ Archived trip data is preserved in database
8. ✅ All existing functionality remains intact (no regressions)

## Future Enhancements (Out of Scope)

- Trip browser UI to view archived trips
- Multi-trip support with trip selector
- Search/filter archived trips
- Export trip data
- Trip templates
- User authentication and multi-user support
