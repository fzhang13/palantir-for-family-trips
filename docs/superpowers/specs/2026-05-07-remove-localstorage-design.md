# Remove LocalStorage Fallback - Design Specification

**Date:** 2026-05-07  
**Status:** Approved  
**Author:** Claude + Felix

## Overview

Remove all LocalStorage infrastructure from the trip dashboard app and make Supabase the only data source. This eliminates ~3,000 lines of legacy code while simplifying the architecture to use React Query as the single state management layer.

## Background

The app currently has dual data storage:
- **LocalStorage mode**: `tripModel.ts` contains hardcoded seed data (2,722 lines), `usePersistedTripState` manages a monolithic `TripDocument` in localStorage
- **Supabase mode**: React Query hooks fetch from database via repository pattern

The system switches between modes via `getTripRepository()` based on environment variables. Now that Supabase is fully working, the LocalStorage fallback is dead weight.

## Goals

1. **Delete dead code**: Remove ~3,000 lines of unused LocalStorage infrastructure
2. **Single source of truth**: Supabase only, no dual mode complexity
3. **Better patterns**: Force all state through React Query instead of mixing with `usePersistedTripState`
4. **Clear errors**: If Supabase isn't configured, show actionable error message

## Non-Goals

- **Not adding localStorage cache**: React Query already handles caching
- **Not preserving backward compat**: Breaking change, requires Supabase
- **Not migrating data**: Users must use Supabase (no migration path from localStorage)

## Architecture

### Current State

```
Components → TripContext → usePersistedTripState → localStorage
                         ↘ React Query hooks (side channel)
```

### Target State

```
Components → TripContext → React Query hooks → Supabase
```

**Data flow changes:**
- Remove `updateDoc` callback pattern entirely
- All mutations go through React Query hooks (`useUpdateFamily`, `useAddMeal`, etc.)
- `TripContext` becomes a lightweight coordination layer over React Query
- No dual mode switching logic

## File Changes

### Deletions (Complete Removal)

1. **`src/models/tripModel.ts`** (2,722 lines)
   - Contains hardcoded seed trip data for localStorage mode
   - Only 4 helper functions are actually used (extract these first)
   - Everything else is dead weight

2. **`src/repositories/LocalStorageTripRepository.ts`** (~250 lines)
   - Implements `TripRepository` interface against localStorage
   - No longer needed

3. **`src/hooks/usePersistedTripState.ts`** (~40 lines)
   - Manages monolithic `TripDocument` in localStorage
   - Replaced by React Query hooks

**Total deletion: ~3,000 lines**

### Helper Function Extraction

Before deleting `tripModel.ts`, extract these 4 functions to `src/utils/trip.ts`:

```typescript
export const COLLECTION_BY_TYPE: Record<string, string> = {
  family: 'families',
  location: 'locations',
  route: 'routes',
  itineraryItem: 'itineraryItems',
  meal: 'meals',
  activity: 'activities',
  stayItem: 'stayItems',
  expense: 'expenses',
  task: 'tasks',
}

export function getCollection(doc: TripDocument, type: string) {
  const collectionName = COLLECTION_BY_TYPE[type]
  return collectionName ? doc[collectionName] || [] : []
}

export function getEntityById(doc: TripDocument, type: string, id: string) {
  return getCollection(doc, type).find((item) => item.id === id) || null
}

export function getEntityBySelection(doc: TripDocument, selection: EntitySelection | null) {
  if (!selection?.type || !selection?.id) return null
  return getEntityById(doc, selection.type, selection.id)
}
```

**Why:** These are the ONLY parts of `tripModel.ts` actually used in the codebase. Everything else (2,700+ lines) is seed data for localStorage mode.

### New Component: Supabase Validation

**File:** `src/components/SupabaseRequired.tsx`

```typescript
export function SupabaseRequired() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#0A0C10]">
      <div className="max-w-md p-8 border border-[#30363D] bg-[#0D1117] rounded">
        <h1 className="text-xl font-semibold text-[#E6EDF3] mb-4">
          Supabase Configuration Required
        </h1>
        <p className="text-[#8B949E] mb-4">
          This application requires Supabase to be configured.
        </p>
        <div className="space-y-2 text-sm text-[#8B949E]">
          <p>Add these environment variables to your <code>.env</code> file:</p>
          <pre className="bg-[#0A0C10] p-3 rounded font-mono text-xs">
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
          </pre>
        </div>
      </div>
    </div>
  )
}
```

**Why:** Fail fast with actionable error message instead of cryptic runtime failures.

### Repository Simplification

**File:** `src/repositories/index.ts`

**Before:**
```typescript
export function getTripRepository(): TripRepository {
  if (supabase) {
    return supabaseTripRepository
  }
  return localRepo // LocalStorage fallback
}
```

**After:**
```typescript
export function getTripRepository(): TripRepository {
  // No fallback - Supabase is required
  return supabaseTripRepository
}
```

**Also remove:**
- `export * from './LocalStorageTripRepository'`
- `import { tripRepository as localRepo } from './LocalStorageTripRepository'`

### TripContext Refactoring

**File:** `src/context/TripContext.tsx`

**Current structure:**
```typescript
const [doc, updateDoc] = usePersistedTripState()  // localStorage
const selection = useTripSelection(doc, currentPage, updateDoc)
const timeline = useTimelineSimulation(doc, updateDoc)
const expenses = useExpenseCalculations(doc, updateDoc)
```

**New structure:**
```typescript
const { data: activeTripId } = useActiveTripId()
const { data: doc, isLoading } = useTrip(activeTripId)  // React Query

if (isLoading) {
  return <LoadingSpinner />
}

if (!doc) {
  return <ErrorState />
}

const selection = useTripSelection(doc, currentPage)  // no updateDoc
const timeline = useTimelineSimulation(doc)  // no updateDoc
const expenses = useExpenseCalculations(doc)  // no updateDoc
```

**Key changes:**
1. Remove `updateDoc` callback - mutations happen through React Query hooks
2. Handle loading and error states from React Query
3. Child hooks no longer need `updateDoc` parameter

**Impact on child hooks:**
- **`useTripSelection`**: Remove `onUpdateDoc` param, selection updates become mutations
- **`useTimelineSimulation`**: Remove `updateDoc`, timeline state stays ephemeral
- **`useExpenseCalculations`**: Remove `updateDoc`, already uses mutation hooks

### App.tsx Startup Validation

**File:** `src/App.tsx`

**Add at top of App component:**
```typescript
import { supabase } from '@/lib/supabase'
import { SupabaseRequired } from '@/components/SupabaseRequired'

function App() {
  // Check Supabase first
  if (!supabase) {
    return <SupabaseRequired />
  }
  
  // Then check for active trip
  const { data: activeTripId, isLoading } = useActiveTripId()
  
  // ... rest of existing logic
}
```

### Import Updates

**Files with import changes:**

1. **`src/hooks/useTripSelection.ts`**
   ```typescript
   // Before:
   import { getEntityById, getEntityBySelection } from '@/models/tripModel'
   
   // After:
   import { getEntityById, getEntityBySelection } from '@/utils/trip'
   ```

2. **`src/context/TripContext.tsx`**
   ```typescript
   // Remove:
   import { usePersistedTripState } from '@/hooks'
   
   // Add:
   import { useTrip } from '@/hooks/useTripQueries'
   ```

3. **`src/hooks/index.ts`**
   ```typescript
   // Remove:
   export { usePersistedTripState } from './usePersistedTripState'
   ```

4. **`src/types/trip.ts`**
   - Remove documentation comments referencing "tripModel.js"
   - These are just code comments, safe to delete

## UI State Handling

**Current UI state in `TripDocument`:**
- `selection: EntitySelection | null` - which entity is selected
- `pageNotes: Record<PageType, string>` - notes per page
- Timeline cursor position (managed by `useTimelineSimulation`)

**After LocalStorage removal:**
- **Selection state**: Ephemeral, lives in React state only
- **Page notes**: Not persisted to Supabase (feature lost, acceptable)
- **Timeline cursor**: Ephemeral, lives in React state only

**Rationale:** These are session-only UI states. They were never persisted to Supabase, only localStorage. Losing them on refresh is acceptable for this app.

**No database schema changes needed.**

## Testing Strategy

**Manual verification checklist:**

1. ✅ App starts with Supabase configured → works normally
2. ✅ App starts without Supabase → shows `SupabaseRequired` error page
3. ✅ Family CRUD operations → use React Query mutations
4. ✅ Entity selection → works without `updateDoc`
5. ✅ Timeline simulation → cursor state works ephemerally
6. ✅ Page navigation → no localStorage errors in console
7. ✅ No import errors for deleted files

**No new automated tests needed** - this is a refactor, existing tests continue to work.

## Migration Path

**For developers:**
1. Ensure `.env` has Supabase credentials
2. Pull latest code
3. App will fail with clear error if Supabase missing

**For users:**
- If using localStorage mode: must switch to Supabase (no migration tool)
- Data in localStorage is abandoned
- This is acceptable - app is in development phase

## Rollout Plan

**Phase 1: Preparation**
1. Extract helper functions to `utils/trip.ts`
2. Update imports in `useTripSelection.ts`
3. Verify no import errors

**Phase 2: Deletions**
1. Delete `tripModel.ts`
2. Delete `LocalStorageTripRepository.ts`
3. Delete `usePersistedTripState.ts`
4. Remove exports from `index.ts` files

**Phase 3: Refactoring**
1. Refactor `TripContext` to use React Query
2. Update child hooks (`useTripSelection`, etc.)
3. Simplify `getTripRepository()`

**Phase 4: Validation**
1. Add `SupabaseRequired` component
2. Update `App.tsx` with startup check
3. Test both success and failure cases

**Phase 5: Cleanup**
1. Remove dead imports
2. Remove code comments referencing deleted files
3. Run TypeScript check
4. Manual smoke test

## Success Metrics

- ✅ ~2,900 net lines deleted
- ✅ Zero localStorage references in codebase
- ✅ Single data source (Supabase only)
- ✅ Clear error when Supabase unconfigured
- ✅ All existing features continue working

## Edge Cases

**Q: What if someone has data in localStorage?**  
A: Lost. Acceptable for development-phase app.

**Q: What about offline support?**  
A: Out of scope. React Query handles background refetching. True offline would need Service Workers + IndexedDB + sync queue.

**Q: Page notes lost on refresh?**  
A: Yes. Not persisted to Supabase. Could add later if needed.

**Q: Selection state lost on refresh?**  
A: Yes. Acceptable - users don't expect selection to persist.

## Future Considerations

**Not in this spec, but could add later:**
- Persist page notes to Supabase `trips` table
- Persist selection state to URL query params
- Offline-first with Service Workers
- React Query persistence plugin for cross-session cache

None of these require LocalStorage - better solutions exist when we need them.
