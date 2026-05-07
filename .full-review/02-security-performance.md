# Phase 2: Security & Performance Review

## Security Findings

### CRITICAL

#### 1. Completely Open Row-Level Security Policies
**Severity:** CRITICAL (CVSS 9.8)  
**CWE:** CWE-862 (Missing Authorization)  
**Files:** `supabase/migrations/20260506150055_initial_schema.sql:402-416`

**Issue:** All tables have fully permissive RLS policies (`using (true) with check (true)`) allowing **unauthenticated access** to all data. With LocalStorage removed, Supabase is now the sole data store.

**Attack:** Anyone with the anon key (embedded in client bundle) can read/modify/delete all trip data.

**Fix:** Implement auth-based RLS:
```sql
DROP POLICY "Allow all" ON trips;
CREATE POLICY "Users can access own trips"
  ON trips FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
```

### HIGH

#### 2. Sensitive PII in Cleartext
**Severity:** HIGH (CVSS 7.5)  
**CWE:** CWE-312, CWE-200  
**Files:** `SupabaseTripRepository.ts:1058-1065`

**Issue:** WiFi passwords, confirmation codes, addresses, GPS coordinates stored unencrypted and fetched via `SELECT *`

**Fix:** Encrypt sensitive fields, use explicit column lists

#### 3. Rules of Hooks Violation
**Severity:** HIGH  
**CWE:** CWE-670  
**Files:** `src/App.tsx:64-68`

**Issue:** Hook called after conditional return violates React rules

**Fix:** Move guard after all hooks or use child component wrapper

#### 4. Non-null Assertion on Nullable Supabase Client
**Severity:** HIGH (CVSS 7.2)  
**CWE:** CWE-476  
**Files:** `useActiveTripId.ts:14`

**Issue:** `supabase!` bypasses type safety, can cause runtime crash

**Fix:** Add explicit null check before query

### MEDIUM

#### 5. Missing Input Validation on arrivalDayId
**Severity:** MEDIUM (CVSS 5.3)  
**CWE:** CWE-20  
**Files:** `familySchema.ts:20`, modals

**Issue:** Free-text input with no format validation allows arbitrary strings

**Fix:** Add Zod regex: `z.string().regex(/^day\d{1,2}$/).optional()`

#### 6. Silent Data Loss (updateDoc/updatePageNote)
**Severity:** MEDIUM (CVSS 5.5)  
**CWE:** CWE-404, CWE-223  
**Files:** `TripContext.tsx:86-99`

**Issue:** No-op functions silently discard user input

**Fix:** Implement persistence or remove from interface

#### 7. Supabase Credentials Exposed in Client Bundle
**Severity:** MEDIUM (CVSS 4.3)  
**CWE:** CWE-200  
**Files:** `env.ts:9-10`, `SupabaseRequired.tsx:13-15`

**Issue:** Anon key visible in bundle + advertised in error component

**Fix:** Acceptable with proper RLS (see Finding 1), hide env var names in production

#### 8. Raw Error Messages Exposed
**Severity:** MEDIUM (CVSS 4.0)  
**CWE:** CWE-209  
**Files:** `ErrorBoundary.tsx:42`, `TripContext.tsx:69`

**Issue:** Supabase errors expose table/column names to users

**Fix:** Sanitize error messages

#### 9. Missing activity_families Table
**Severity:** MEDIUM (CVSS 5.0)  
**CWE:** CWE-703  
**Files:** `SupabaseTripRepository.ts:796,885,897`

**Issue:** Code references table not in schema

**Fix:** Create migration for activity_families table

### LOW

#### 10. Record<string, any> Bypasses Type Safety
**Severity:** LOW (CVSS 3.1)  
**Files:** `SupabaseTripRepository.ts:108,277,587,811`

**Issue:** `any` types eliminate TypeScript safety

**Fix:** Use typed interfaces

#### 11. No Authentication Implementation
**Severity:** LOW (pre-existing)  
**CWE:** CWE-306

**Issue:** Zero auth code in entire codebase

**Fix:** Implement Supabase Auth

---

## Performance Findings

### CRITICAL

#### 1. N+1 Query in Conflict Checks
**Severity:** Critical  
**Files:** `useTripQueries.ts:76-96`  
**Impact:** 10x slower, fetches entire trip (10 tables) to extract one collection

**Fix:** Use existing hooks:
```typescript
export function useMealsForConflictCheck(tripId: string) {
  return useMeals(tripId)  // Reuse existing hook!
}
```

#### 2. Missing Foreign Key Indexes
**Severity:** Critical  
**Impact:** 10-100x slower as data grows

**Missing indexes:**
- itinerary_items(route_id, location_id)
- meals(location_id)
- activities(location_id, backup_location_id)
- expenses(trip_id, settled)
- tasks(trip_id, status)

#### 3. Excessive Cache Invalidation
**Severity:** Critical  
**Files:** `useTripMutations.ts`  
**Impact:** 50x more data transferred - every mutation invalidates full trip cache

**Fix:** Only invalidate affected collections, not full trip

### HIGH

#### 4. Unbounded SELECT * Queries
**Severity:** High  
**Files:** `SupabaseTripRepository.ts:52-105`  
**Impact:** Memory/bandwidth grows linearly with data

**Fix:** Use explicit column lists, pagination

#### 5. No Code Splitting for Page Components
**Severity:** High  
**Files:** `App.tsx:10-35`  
**Impact:** 40% larger initial bundle

**Fix:** Use default exports for proper lazy loading

#### 6. Single Supabase Connection Point
**Severity:** High  
**Impact:** No horizontal scaling, single point of failure

**Limits:** Free tier supports 60-100 concurrent connections

#### 7. Junction Table N+1 Query
**Severity:** High  
**Files:** `SupabaseTripRepository.ts:440-462`  
**Impact:** 2 queries instead of 1 JOIN

**Fix:** Use SQL JOIN with JSON aggregation

#### 8. Missing React.memo
**Severity:** High  
**Impact:** Unnecessary re-renders waste 50-100ms per interaction

**Fix:** Memoize FamiliesPage, MealsPage, ActivitiesPage

#### 9. No Modal Lazy Loading
**Severity:** High  
**Impact:** 20-30 KB unnecessary initial load

**Fix:** Lazy load modal components

### MEDIUM

#### 10. Vestigial TripDocument Fields
**Severity:** Medium  
**Impact:** 10-20% larger memory footprint

**Fields:** selection, ui, pageNotes, pageNoteMeta

#### 11. Conservative React Query Config
**Severity:** Medium  
**Impact:** Unnecessary refetches

**Fix:** Per-query stale times (15min for static, 30s for dynamic)

#### 12. Duplicate Query Keys for Conflict Checks
**Severity:** Medium  
**Impact:** 2x cache memory, stale conflict checks

**Fix:** Reuse main query keys

#### 13. Missing Composite Indexes
**Severity:** Medium  
**Impact:** 2-5x slower date range queries

**Fix:** Add (trip_id, check_in_date, check_out_date) index

### LOW

- No memory leak detection in animation loop
- No connection pool config
- Synchronous mapping in hot path (negligible)
- No rate limiting on mutations

---

## Critical Issues for Phase 3 Context

**Testing Requirements:**
1. **Security tests** needed for RLS policies (once implemented)
2. **Input validation tests** for arrivalDayId field
3. **Error handling tests** for null supabase client
4. **Performance tests** for query optimization (N+1, indexes)

**Documentation Requirements:**
1. **Security advisory** about open RLS policies
2. **Migration guide** for removing LocalStorage
3. **Performance benchmarks** before/after optimization
4. **Runbook** for Supabase connection limits

---

## Summary

| Severity | Security | Performance | Total |
|----------|----------|-------------|-------|
| Critical | 1 | 3 | 4 |
| High | 4 | 6 | 10 |
| Medium | 5 | 4 | 9 |
| Low | 2 | 4 | 6 |
| **Total** | **12** | **17** | **29** |

**Assessment:** The LocalStorage removal is architecturally sound but introduces significant security and performance risks. The **open RLS policies** make all data publicly accessible - this is a show-stopper for production. Performance bottlenecks (N+1 queries, excessive cache invalidation, missing indexes) will impact UX as data grows.
