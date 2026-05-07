# Phase 1: Code Quality & Architecture Review

## Code Quality Findings

### CRITICAL

#### 1. React Rules of Hooks Violation in App.tsx
**File:** `src/App.tsx:62-68`  
**Issue:** Hook called after conditional return  
**Impact:** Violates React's Rules of Hooks - hooks must always be called in the same order

```tsx
function App() {
  if (!supabase) {            // early return
    return <SupabaseRequired />
  }
  const { data: activeTripId, isLoading } = useActiveTripId()  // hook after conditional!
}
```

**Fix:** Move hook before guard or extract wrapper component:
```tsx
function App() {
  const { data: activeTripId, isLoading } = useActiveTripId()
  if (!supabase) return <SupabaseRequired />
  // ... rest of logic
}
```

### HIGH

#### 2. Deprecated updateDoc Kept in Public API
**File:** `src/context/TripContext.tsx:14,91-99`  
**Issue:** Dead API with runtime warning spam - silently drops data if called  
**Fix:** Remove from `TripContextValue` interface entirely

#### 3. Stale TripDocument.selection and TripDocument.ui Properties
**Files:** `src/types/trip.ts:247,250-263`  
**Issue:** These fields are ephemeral React state but still in TripDocument type  
**Fix:** Add JSDoc marking them as "initial defaults only, not persisted"

#### 4. Missing Input Validation on arrivalDayId Field
**Files:** `AddFamilyModal.tsx:165-172`, `EditFamilyModal.tsx:177-183`  
**Issue:** Changed from dropdown to free-text with no validation - users can enter anything  
**Fix:** Add Zod pattern validation or restore dropdown

### MEDIUM

#### 5. Missing Whitespace Before || Operator (5 instances)
**Files:** AddActivityModal, AddMealModal, EditActivityModal  
**Issue:** `place?.name|| address` missing space  
**Fix:** `place?.name || address`

#### 6. getTripRepository() Indirection Unnecessary
**File:** `src/repositories/index.ts:1-13`  
**Issue:** Factory function with single implementation adds no value  
**Fix:** Consider direct export of supabaseTripRepository

#### 7. Excessive any Usage in utils/trip.ts
**File:** `src/utils/trip.ts:57,60,66-67,73,105`  
**Issue:** Six `any` types undermine TypeScript safety  
**Fix:** Use `Entity` union return types with generics

#### 8. console.warn Used for Control Flow
**File:** `src/context/TripContext.tsx:89,98`  
**Issue:** Production console warnings for dead code paths  
**Fix:** Remove functions or gate with `if (import.meta.env.DEV)`

#### 9. Stale Console Warning in supabase.ts
**File:** `src/lib/supabase.ts:7-10`  
**Issue:** Says "features disabled" but app is now unusable without Supabase  
**Fix:** Change to console.error with updated message

### LOW

#### 10. Blank Line Artifact in FamiliesPage
**File:** `src/components/pages/FamiliesPage.tsx:168-169`  
**Issue:** Double blank line  
**Fix:** Remove extra line

#### 11. canSelectEntity Exposed But Never Consumed
**File:** `src/hooks/useTripSelection.ts:11,43-48,57`  
**Issue:** Dead code  
**Fix:** Remove if not planned for use

#### 12. setPlaybackSpeed is No-Op
**File:** `src/hooks/useTimelineSimulation.ts:43-45`  
**Issue:** Hardcoded to 1, setter does nothing  
**Fix:** Document or remove if feature not planned

#### 13. Migration Lacks Explicit Transaction
**File:** `supabase/migrations/20260507000811_cleanup_families_fields.sql`  
**Issue:** No explicit BEGIN/COMMIT  
**Fix:** Wrap in transaction for clarity

#### 14. pageNotes and pageNoteMeta Are Vestigial
**File:** `src/types/trip.ts:248-249`  
**Issue:** Read from DB but can never be written (updatePageNote is no-op)  
**Fix:** Remove if unused

---

## Architecture Findings

### HIGH

#### 1. Deprecated updateDoc Retained in TripContext Interface
**File:** `src/context/TripContext.tsx:14`  
**Impact:** Leaky abstraction signals incomplete migration  
**Issue:** Silent data loss if called - mutations vanish without error  
**Fix:** Remove from `TripContextValue` interface

#### 2. updatePageNote Silently Drops Data
**File:** `src/context/TripContext.tsx:87-90`  
**Impact:** Feature regression masked as deprecation  
**Issue:** User input silently discarded  
**Fix:** Implement Supabase mutation or remove from interface

#### 3. Non-null Assertion on Nullable Supabase Client
**File:** `src/hooks/useActiveTripId.ts:14`  
**Impact:** Runtime crash path despite guard at App level  
**Issue:** `supabase!` bypasses type safety  
**Fix:** Add proper null check or route through getTripRepository()

#### 11. Removed mapMealToDb/mapActivityToDb May Break Updates
**File:** `SupabaseTripRepository.ts`  
**Impact:** Type mismatch between interface and implementation  
**Issue:** Interface expects `Partial<Meal>`, implementation takes `Partial<CreateMealInput>`  
**Fix:** Align method signatures

### MEDIUM

#### 4. TripDocument Contains Vestigial UI-only Fields
**File:** `src/types/trip.ts:246-262`  
**Impact:** Domain model pollution  
**Issue:** Fields like selection, ui, pageNotes are ephemeral but in domain type  
**Fix:** Split into TripData (domain) and ephemeral UI state

#### 5. getTripRepository() Factory Trivially Unnecessary
**File:** `src/repositories/index.ts`  
**Impact:** Over-abstraction adds indirection  
**Issue:** Single implementation makes factory pointless  
**Fix:** Direct export or document future intent

#### 6. Residual localStorage in ActiveTripContext
**File:** `src/context/ActiveTripContext.tsx:23,33,35`  
**Impact:** Contradicts stated goal  
**Issue:** Still uses localStorage for active trip ID  
**Fix:** Document as intentional cache or remove

#### 9. useTripSelection Initializes from Stale doc.selection
**File:** `src/hooks/useTripSelection.ts:19`  
**Impact:** Subtle stale state bug  
**Issue:** useState initial value not reset when doc changes  
**Fix:** Add effect to reset or validate entity still exists

#### 10. Conflict Check Hooks Bypass Repository Pattern
**File:** `useTripQueries.ts:80-95`  
**Impact:** Breaks architectural layering  
**Issue:** Direct instantiation + fetching full doc to extract one collection  
**Fix:** Use repository methods (getMeals, getActivities)

### LOW

#### 8. Inconsistent Google Places API Migration
**Files:** AddActivityModal, AddMealModal, EditActivityModal  
**Impact:** Mixed API surface  
**Issue:** Uses older geometry.location pattern vs newer location pattern  
**Fix:** Standardize on one API version

#### 12. Seed Data File Still Referenced
**File:** `src/data/tripData.ts`  
**Impact:** Lingering dead code  
**Issue:** LocalStorage-era seed data still imported  
**Fix:** Extract needed constants, deprecate rest

---

## Critical Issues for Phase 2 Context

**Security Implications:**
- Non-null assertion on supabase client could mask initialization failures
- Missing input validation on arrivalDayId allows arbitrary strings
- Silent data loss paths (updateDoc, updatePageNote) could hide security-relevant mutations

**Performance Implications:**
- useMealsForConflictCheck/useActivitiesForConflictCheck fetch entire trip doc wastefully
- Vestigial TripDocument fields increase payload size unnecessarily

---

## Summary

| Severity | Code Quality | Architecture | Total |
|----------|--------------|--------------|-------|
| Critical | 1 | 0 | 1 |
| High | 3 | 4 | 7 |
| Medium | 5 | 4 | 9 |
| Low | 5 | 2 | 7 |
| **Total** | **14** | **10** | **24** |

**Assessment:** The refactoring successfully removes ~5,200 lines of LocalStorage infrastructure. However, the Rules of Hooks violation in App.tsx must be fixed immediately, and the silent data loss paths (updateDoc, updatePageNote) should be addressed before merge.
