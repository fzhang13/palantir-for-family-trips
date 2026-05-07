# Review Scope

## Target

**LocalStorage Removal Implementation** - A comprehensive refactoring to remove all LocalStorage infrastructure and make Supabase the only data source.

**Git Range:** 08d1f66..0a4d312 (10 commits)

**Implementation Plan:** `docs/superpowers/plans/2026-05-07-remove-localstorage.md`

## Objectives

1. Remove ~3,000 lines of LocalStorage infrastructure code
2. Extract helper functions from tripModel.ts to utils/trip.ts
3. Refactor TripContext to use React Query hooks directly
4. Update all hooks to remove `onUpdateDoc` parameters
5. Add Supabase validation at app startup
6. Delete obsolete files (tripModel.ts, LocalStorageTripRepository.ts, usePersistedTripState.ts)

## Statistics

- **Files Changed:** 32
- **Insertions:** 207 lines
- **Deletions:** 5,404 lines  
- **Net:** -5,197 lines removed

## Files

### Created
- `src/components/SupabaseRequired.tsx` - Error component for missing Supabase config

### Modified (Core Changes)
- `src/utils/trip.ts` - Added helper functions extracted from tripModel
- `src/hooks/useTripSelection.ts` - Removed onUpdateDoc, uses useState for ephemeral selection
- `src/context/TripContext.tsx` - Replaced usePersistedTripState with React Query
- `src/hooks/useTimelineSimulation.ts` - Removed onUpdateDoc, uses useState for timeline state
- `src/hooks/useExpenseCalculations.ts` - Removed onUpdateDoc and updateExpense function
- `src/hooks/index.ts` - Removed usePersistedTripState export
- `src/repositories/index.ts` - Removed LocalStorage fallback logic
- `src/App.tsx` - Added Supabase configuration validation
- `src/types/trip.ts` - Removed tripModel.js references from comments

### Deleted
- `src/models/tripModel.ts` (~2,722 lines) - Old trip model with LocalStorage logic
- `src/repositories/LocalStorageTripRepository.ts` (~250 lines) - LocalStorage repository
- `src/hooks/usePersistedTripState.ts` (~40 lines) - LocalStorage persistence hook
- `src/models/` directory - Removed after tripModel.ts deletion

### Modified (Pre-existing Changes - Not Part of Review Scope)
These files had uncommitted changes before the LocalStorage removal started:
- CLAUDE.md, tsconfig.json, src/data/tripData.ts
- Modal components (AddActivityModal, AddFamilyModal, etc.)
- Form components (AtHomeToggle, TimePeriodPicker)
- src/schemas/familySchema.ts, src/types/inputs.ts
- src/repositories/SupabaseTripRepository.ts

## Flags

- **Security Focus:** No (not a security-focused change)
- **Performance Critical:** No (primarily removing code, not optimizing)
- **Strict Mode:** No
- **Framework:** React + TypeScript + React Query + Supabase

## Review Phases

1. **Code Quality & Architecture** - Verify refactoring quality, hook design, state management patterns
2. **Security & Performance** - Check for introduced vulnerabilities, performance regressions from React Query migration
3. **Testing & Documentation** - Assess test coverage for refactored code, documentation updates
4. **Best Practices & Standards** - React hooks best practices, React Query patterns, migration completeness
5. **Consolidated Report** - Final findings and recommendations

## Key Review Focus Areas

1. **Migration Completeness:** Were all LocalStorage references removed?
2. **State Management:** Is the React Query migration correct? Are hooks using useState properly?
3. **Error Handling:** Does the Supabase validation provide clear error messages?
4. **Breaking Changes:** Are there any unintended breaking changes in hook signatures?
5. **Type Safety:** Are TypeScript types still correct after refactoring?
6. **Code Deletion Safety:** Were the deleted files truly obsolete, with no remaining dependencies?
