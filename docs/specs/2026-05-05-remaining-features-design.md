# Remaining Features Design Specification

**Date:** 2026-05-05  
**Status:** Approved  
**Author:** Claude + User Collaboration

## Overview

This specification covers the implementation of the three remaining feature sets for the Family Trip Command Center:

1. **Route Management** - Map-first route visualization with full CRUD
2. **Google Places Autocomplete** - Address autocomplete in all forms
3. **Edit Modals** - Complete edit functionality for Families and Locations

**Implementation Strategy:** Sequential waves (Route Management → Autocomplete → Edit Modals)

## Background

The TypeScript migration is complete, and the dynamic trip data system is 60% done:
- ✅ Full CRUD for Families (Add + Delete working)
- ✅ Full CRUD for Locations (Add + Delete working)
- ✅ Repository pattern + React Query + Zod validation
- ⏳ Routes (repository methods exist, UI needed)
- ⏳ Edit modals (structure exists, UI needed)
- ⏳ Google Places integration (not started)

## Architecture & Data Flow

### Overall Architecture

The implementation builds on the existing architecture:

```
Components (ItineraryPage, modals)
    ↓
Hooks (useTripQueries, useTripMutations, useGoogleMaps)
    ↓
Repository (LocalStorageTripRepository - already has route methods)
    ↓
localStorage
```

### New Components

**Wave 1 (Route Management):**
- `ItineraryPage.tsx` - Map-first route management UI
- `MapContainer.tsx` - Google Maps wrapper component
- `RouteRenderer.tsx` - Draws route polylines on map
- `AddRouteModal.tsx` - Route creation form
- `EditRouteModal.tsx` - Route editing form
- `useDirections.ts` hook - Wraps Google Directions API calls

**Wave 2 (Google Places):**
- `AddressAutocomplete.tsx` - Reusable Places autocomplete component

**Wave 3 (Edit Modals):**
- `EditFamilyModal.tsx` - Full implementation (structure already exists)
- `EditLocationModal.tsx` - Full implementation (structure already exists)

### Data Flow for Route Management

**Creating a route:**
1. User clicks "Add Route" → `AddRouteModal` opens
2. User selects family (dropdown) → origin auto-fills from family data
3. User selects destination location (dropdown)
4. User sets departure time and day
5. Form submits → `useAddRoute` mutation (from `useTripMutations`)
6. Mutation calls `repository.addRoute()`
7. Background: Call Google Directions API to calculate distance/duration
8. Store route with calculated data in localStorage
9. React Query invalidates cache → UI re-renders with new route
10. `MapContainer` receives updated routes → `RouteRenderer` draws new polyline

**Displaying routes:**
1. `ItineraryPage` renders on mount
2. `useRoutes()` hook fetches routes from repository
3. Sidebar renders route list (scrollable)
4. `MapContainer` receives routes array
5. `RouteRenderer` draws polylines for each route
6. User can click route in sidebar → map centers on that route

## Component Specifications

### Wave 1: Route Management

#### ItineraryPage.tsx

```typescript
interface ItineraryPageProps {}
```

**Layout:**
- Flex container with two sections:
  - **Left sidebar (320px fixed):** Route list + "Add Route" button
  - **Right main area (flex-1):** MapContainer component

**Responsibilities:**
- Fetch routes using `useRoutes()` hook
- Manage selected route state
- Handle "Add Route" button click
- Pass routes to MapContainer for rendering
- Render route list in sidebar with edit/delete actions

**Key Features:**
- Route cards show: family name, origin → destination, distance, duration, departure time, day
- Selected route highlighted in sidebar
- Click route in sidebar → map centers on that route
- Empty state: "No routes yet" with "Add Route" CTA

---

#### MapContainer.tsx

```typescript
interface MapContainerProps {
  routes: Route[]
  selectedRouteId?: string
  onRouteSelect?: (routeId: string) => void
}
```

**Responsibilities:**
- Initialize Google Maps instance using `useGoogleMaps` hook
- Manage map state (center, zoom)
- Pass routes to RouteRenderer component
- Handle route selection clicks on polylines
- Auto-fit bounds to show all routes

**Map Configuration:**
- Initial center: US default if no routes, otherwise fit all routes
- Default zoom: 7
- Map styles: Use existing map style from `constants.ts`
- Controls: zoom, map type (roadmap/satellite)

**Error Handling:**
- If Google Maps fails to load: Show fallback UI
- Message: "Map unavailable. Check your API key configuration."
- Note: "Routes can still be managed via the sidebar."

---

#### RouteRenderer.tsx

```typescript
interface RouteRendererProps {
  map: google.maps.Map
  routes: Route[]
  selectedRouteId?: string
}
```

**Responsibilities:**
- For each route, call Directions API to get polyline
- Render polylines on the map
- Apply different colors/styles per route/family
- Highlight selected route (thicker stroke, different color)
- Clean up polylines on unmount

**Polyline Styling:**
- **Default route:** `#58A6FF` (Info blue), stroke weight 4
- **Selected route:** `#3FB950` (Success green), stroke weight 6
- **Hover:** Increase opacity
- Optional: Family-specific colors for multi-family trips

**Why:** The RouteRenderer handles all map drawing logic, keeping MapContainer focused on map initialization and state management.

---

#### AddRouteModal.tsx

```typescript
interface AddRouteModalProps {
  isOpen: boolean
  onClose: () => void
}
```

**Form Fields (Standard - Option B):**
1. **Family** (select, required)
   - Dropdown of all families from `useFamilies()`
   - On selection, auto-fill origin from family's origin coordinates
   
2. **Origin** (select or auto-fill, required)
   - Dropdown of all locations + family origins
   - Default: Selected family's origin
   - Allow override for custom starting points
   
3. **Destination** (select, required)
   - Dropdown of all locations from `useLocations()`
   - Filter by category if needed (e.g., only "stay" locations)
   
4. **Departure Time** (time input, required)
   - Format: HH:MM (24-hour or 12-hour with AM/PM)
   - Validation: Valid time format
   
5. **Day** (select, required)
   - Dropdown: Day 1, Day 2, Day 3, ... Day 30
   - Integer value stored
   
6. **Notes** (textarea, optional)
   - Max 1000 characters
   - Placeholder: "Optional route notes..."

**Validation:**
- Uses `createRouteSchema` from Zod
- Show inline errors below each field
- Disable submit until form is valid

**Behavior:**
- On submit: Call `useAddRoute()` mutation
- Show loading state: "Adding..."
- On success: Close modal, show toast "Route added successfully"
- On error: Show toast with error message, keep modal open
- Background: Fetch route details from Directions API (distance, duration, polyline)

**Why:** Wave 1 uses text inputs and dropdowns. Google Places autocomplete is added in Wave 2.

---

#### EditRouteModal.tsx

```typescript
interface EditRouteModalProps {
  isOpen: boolean
  onClose: () => void
  route: Route
}
```

**Form Fields:**
- Same as AddRouteModal, but pre-populated with existing route data

**Pre-population:**
- Use `defaultValues` in `useForm({ defaultValues: route })`
- All fields auto-fill from the route object

**Dirty Form Detection:**
- Track form state with `useFormState({ control })`
- If `isDirty` is true and user clicks Cancel/X:
  - Show confirmation: `window.confirm("You have unsaved changes. Discard them?")`
  - If user confirms: Close modal
  - If user cancels: Keep modal open

**Behavior:**
- On submit: Call `useUpdateRoute()` mutation
- On success: Close modal, show toast "Route updated successfully"
- If origin or destination changed: Re-fetch Directions API data

---

#### useDirections Hook

```typescript
interface UseDirectionsOptions {
  origin: { lat: number; lng: number } | string
  destination: { lat: number; lng: number } | string
  travelMode?: google.maps.TravelMode // Default: DRIVING
}

interface DirectionsResult {
  distance: string  // "178 mi"
  duration: string  // "3h 15m"
  polyline: google.maps.LatLng[]
  isLoading: boolean
  error: Error | null
}

function useDirections(options: UseDirectionsOptions): DirectionsResult
```

**Responsibilities:**
- Call Google Directions API when origin/destination change
- Parse response for distance, duration, polyline coordinates
- Cache results to avoid duplicate API calls (use React Query)
- Handle API errors gracefully

**Caching Strategy:**
- Use React Query with cache key based on origin + destination
- Cache for 24 hours (routes don't change frequently)
- Refetch on window focus if data is stale

**Error Handling:**
- No route found: Return error "No route found between these locations"
- API quota exceeded: Return error "Maps quota exceeded"
- Invalid coordinates: Return validation error

**Why:** Separating Directions logic into a hook makes it reusable and testable.

---

### Wave 2: Google Places Autocomplete

#### AddressAutocomplete.tsx

```typescript
interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void
  onCoordinatesChange?: (lat: number, lng: number) => void
  placeholder?: string
  error?: string
}
```

**Responsibilities:**
- Render text input with Google Places Autocomplete
- Show dropdown suggestions as user types
- On place selection:
  - Update address value
  - Extract coordinates (lat, lng)
  - Call `onCoordinatesChange` callback
- Integrate with react-hook-form

**Implementation:**
- Use `@react-google-maps/api` or vanilla Google Places Autocomplete
- Autocomplete options: `types: ['address']` to filter results
- Debounce requests (300ms) to avoid excessive API calls

**Fallback:**
- If Places API fails to load: Render as plain text input
- Show warning message: "Address autocomplete unavailable"
- User can still manually enter address

**Styling:**
- Match existing design system (dark theme, green accents)
- Dropdown suggestions styled to match app aesthetic
- Error state: red border + error message below

**Integration Points:**
- `AddFamilyModal` - origin address field
- `EditFamilyModal` - origin address field
- `AddLocationModal` - address field
- `EditLocationModal` - address field
- `AddRouteModal` - origin field (if manual override)
- `EditRouteModal` - origin field (if manual override)

**Why:** A reusable component ensures consistent autocomplete UX across all forms.

---

### Wave 3: Edit Modals

#### EditFamilyModal.tsx

```typescript
interface EditFamilyModalProps {
  isOpen: boolean
  onClose: () => void
  family: Family
}
```

**Form Fields:**
- Same as `AddFamilyModal`, pre-populated with `family` data
- All fields from `createFamilySchema`:
  - Name, origin, originAddress, vehicleType, headcount, responsibility, arrivalDay, notes

**Pre-population:**
```typescript
const form = useForm({
  defaultValues: {
    name: family.name,
    origin: family.origin,
    originAddress: family.originAddress,
    // ... all other fields
  }
})
```

**Dirty Form Detection:**
```typescript
const { isDirty } = useFormState({ control: form.control })

const handleClose = () => {
  if (isDirty) {
    const confirmed = window.confirm(
      'You have unsaved changes. Discard them?'
    )
    if (!confirmed) return
  }
  onClose()
}
```

**Behavior:**
- Uses `AddressAutocomplete` for origin address (Wave 2 integration)
- On submit: Call `useUpdateFamily()` mutation
- On success: Close modal, show toast "Family updated successfully"
- On error: Show toast, keep modal open

**Why:** Standard edit pattern with dirty-form confirmation prevents accidental data loss.

---

#### EditLocationModal.tsx

```typescript
interface EditLocationModalProps {
  isOpen: boolean
  onClose: () => void
  location: Location
}
```

**Form Fields:**
- Same as `AddLocationModal`, pre-populated with `location` data
- All fields from `createLocationSchema`:
  - Title, address, category, lat, lng, summary, day, checkIn, checkOut, host

**Implementation:**
- Same pattern as EditFamilyModal
- Pre-populate fields
- Dirty form detection
- Uses `AddressAutocomplete` for address field
- On place selection: Auto-fill lat/lng

**Behavior:**
- On submit: Call `useUpdateLocation()` mutation
- On success: Close modal, show toast "Location updated successfully"

---

## Data Models

### Route Data Structure

```typescript
interface Route {
  id: string  // UUID
  familyId: string
  originLocationId?: string  // Optional if using family origin
  destinationLocationId: string
  departureTime: string  // "08:00" or ISO timestamp
  day: number  // 1, 2, 3, etc.
  
  // Calculated from Directions API:
  distance?: string  // "178 mi"
  duration?: string  // "3h 15m"
  polyline?: Array<{ lat: number; lng: number }>  // For offline rendering
  
  notes?: string
  createdAt: string  // ISO timestamp
  updatedAt: string  // ISO timestamp
}
```

**Why store polyline?**
- Avoids repeated Directions API calls
- Enables offline rendering
- Only re-fetch if origin/destination changes

---

### Validation Schemas

#### createRouteSchema

```typescript
import { z } from 'zod'

export const createRouteSchema = z.object({
  familyId: z.string().uuid('Invalid family selected'),
  
  originLocationId: z.string().uuid().optional(),
  // If not provided, use family's origin coordinates
  
  destinationLocationId: z.string().uuid('Destination is required'),
  
  departureTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time format: HH:MM'),
  
  day: z.number()
    .int()
    .min(1, 'Day must be at least 1')
    .max(30, 'Day must be less than 30'),
  
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
})

export type CreateRouteInput = z.infer<typeof createRouteSchema>
```

#### Updated Schemas (Wave 2)

**Family schema enhancements:**
```typescript
export const createFamilySchema = z.object({
  name: z.string().min(2),
  origin: z.string().min(2),
  originAddress: z.string().min(5),
  
  // NEW: Optional place data from autocomplete
  placeId: z.string().optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional(),
  
  // ... rest of existing fields
})
```

**Why optional coordinates?**
- Wave 1: No autocomplete, coordinates not available
- Wave 2: Autocomplete provides coordinates
- Backward compatible with existing data

---

## Google Maps Integration

### APIs Required

1. **Maps JavaScript API** - Already in use via `useGoogleMaps` hook
2. **Directions API** - Calculate routes, distance, duration (Wave 1)
3. **Places API** - Address autocomplete (Wave 2)

**API Key Configuration:**
- Use `VITE_GOOGLE_MAPS_API_KEY` from `.env`
- Enable all three APIs in Google Cloud Console
- Set usage quotas and billing alerts

### Route Data Storage Strategy

**When creating a route:**
1. User submits form
2. Call `repository.addRoute()` with form data
3. Asynchronously call Directions API
4. Store result (distance, duration, polyline) in route object
5. Update localStorage

**Why async?**
- Don't block modal close on API call
- Show "Calculating route..." in route card
- Update in place when API responds

**Caching:**
- Store polyline in route object (localStorage)
- Render from cache (no API call needed)
- Re-fetch only when origin/destination changes

### Map Styling

**Route polylines:**
- Default: `#58A6FF` (Info blue), stroke weight 4
- Selected: `#3FB950` (Success green), stroke weight 6
- Hover: Increase stroke weight by 1, opacity 0.9

**Map style:**
- Use existing `GOOGLE_MAP_STYLES` from `constants.ts`
- Dark theme to match dashboard aesthetic

### Error Handling

#### Google Maps API Not Loaded

```typescript
if (!window.google) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted">
      <MapPin size={48} className="mb-4 opacity-50" />
      <p className="text-lg">Map unavailable</p>
      <p className="text-sm">Check your API key configuration</p>
      <p className="text-xs mt-2">Routes can still be managed via the sidebar</p>
    </div>
  )
}
```

**Why:** Allow app to function without map if API fails.

---

#### Directions API Failures

**Scenario 1: No route found**
- Toast: "Could not find route between these locations"
- Save route without distance/duration/polyline
- Show "Route calculation failed" in route card
- Provide "Retry" button

**Scenario 2: API quota exceeded**
- Toast: "Maps quota exceeded. Route saved without distance/duration."
- Allow user to continue using app
- Log error for monitoring

**Scenario 3: Invalid coordinates**
- Show validation error in form
- Prevent form submission until fixed

---

#### Places API Failures (Wave 2)

**Scenario 1: Autocomplete fails to load**
- Fallback to regular text input
- Show warning: "Address autocomplete unavailable"
- User can still enter address manually

**Scenario 2: No suggestions returned**
- Show "No results found" in dropdown
- Allow user to type full address manually

**Scenario 3: API key issue**
- Show warning toast
- Allow manual address entry
- Log error for debugging

---

## Edge Cases & Data Integrity

### 1. Deleting a Family with Routes

**Problem:** Family has associated routes. What happens to routes?

**Solution:** Cascade delete with warning

```typescript
// In useDeleteFamily mutation
const routeCount = routes.filter(r => r.familyId === familyId).length

if (routeCount > 0) {
  const confirmed = window.confirm(
    `This family has ${routeCount} route(s). Delete anyway? Routes will also be deleted.`
  )
  if (!confirmed) return
}

// Delete family + all associated routes
await repository.deleteFamily(tripId, familyId)
routes
  .filter(r => r.familyId === familyId)
  .forEach(r => repository.deleteRoute(tripId, r.id))
```

**Why:** Prevents orphaned routes. Clear user communication.

---

### 2. Deleting a Location Used in Routes

**Problem:** Location is destination for routes. What happens?

**Solution:** Same as above - cascade delete with warning

```typescript
const routeCount = routes.filter(
  r => r.destinationLocationId === locationId || r.originLocationId === locationId
).length

if (routeCount > 0) {
  const confirmed = window.confirm(
    `This location is used in ${routeCount} route(s). Delete anyway?`
  )
  if (!confirmed) return
}
```

---

### 3. No Families Exist

**Problem:** Can't create route without a family.

**Solution:**
- Disable "Add Route" button
- Show message: "Add families first to create routes"
- Provide "Add Family" button shortcut

---

### 4. No Locations Exist

**Problem:** Can't create route without a destination.

**Solution:**
- Show message in modal: "Add locations first"
- Disable destination dropdown
- Provide "Add Location" button shortcut in modal

---

### 5. Route with Missing Family/Location (Data Inconsistency)

**Problem:** Data corruption - route references deleted family/location.

**Solution:**
- Display route with "(Deleted)" label
- Disable edit button (can't edit without valid references)
- Allow delete button (cleanup)
- Show warning icon

```typescript
const family = families.find(f => f.id === route.familyId)
const familyName = family ? family.name : '(Deleted Family)'
```

---

### 6. Map Initial Bounds

**Scenario A: No routes exist**
- Center map on US (default coordinates)
- Zoom level 4

**Scenario B: Routes exist**
- Auto-fit bounds to show all route polylines
- Use `map.fitBounds()` with route polyline bounds
- Add padding for visual comfort

```typescript
if (routes.length > 0) {
  const bounds = new google.maps.LatLngBounds()
  routes.forEach(route => {
    route.polyline?.forEach(point => {
      bounds.extend(point)
    })
  })
  map.fitBounds(bounds, { padding: 50 })
}
```

---

### 7. Multiple Routes Same Origin/Destination

**Problem:** Is this valid?

**Solution:** Yes, allow it
- Different departure times are valid
- Example: Two families leaving same origin at different times
- Differentiate in UI with departure time label

---

## Testing Strategy

### Manual Testing (Primary Approach)

User will manually test all functionality. Automated tests can be added later.

**Wave 1 Testing Checklist:**
- [ ] Add route with all fields
- [ ] Route appears in sidebar
- [ ] Route polyline renders on map
- [ ] Click route in sidebar → map centers
- [ ] Edit route → changes save
- [ ] Delete route → confirmation + removed
- [ ] Map error state when API unavailable
- [ ] Directions API error handling
- [ ] Empty state when no routes
- [ ] No families exist → disabled Add Route button
- [ ] Cascade delete warning when deleting family with routes

**Wave 2 Testing Checklist:**
- [ ] Type in address field → suggestions appear
- [ ] Select suggestion → coordinates auto-fill
- [ ] Fallback to text input if API fails
- [ ] All modals have autocomplete (Family, Location, Route)

**Wave 3 Testing Checklist:**
- [ ] Edit family → fields pre-populated
- [ ] Edit location → fields pre-populated
- [ ] Modify field → dirty state detected
- [ ] Cancel with changes → confirmation dialog
- [ ] Cancel without changes → closes immediately
- [ ] Save changes → updates persist
- [ ] All validations work in edit modals

### Future Automated Tests

**Unit tests** (to be added later):
- `useDirections` hook - Mock Directions API
- Route schema validation
- Form validation logic

**Integration tests** (to be added later):
- Route CRUD flow
- Map integration
- Cross-entity relationships (cascade deletes)

---

## Implementation Waves (Summary)

### **Wave 1: Route Management** 🎯 Top Priority

**Components:**
- ItineraryPage.tsx
- MapContainer.tsx
- RouteRenderer.tsx
- AddRouteModal.tsx
- EditRouteModal.tsx
- useDirections.ts hook

**Success Criteria:**
- ✅ User can add routes with family, origin, destination, time, day
- ✅ Routes appear in sidebar list
- ✅ Routes render as polylines on map
- ✅ Distance/duration calculated from Directions API
- ✅ User can edit and delete routes
- ✅ Map centers on selected route
- ✅ Error handling for API failures

**Estimated Complexity:** High (Google Maps integration, Directions API, polyline rendering)

---

### **Wave 2: Google Places Autocomplete** 🔍

**Components:**
- AddressAutocomplete.tsx

**Integration Points:**
- AddFamilyModal (origin address)
- AddLocationModal (address)
- AddRouteModal (origin, if manual override)
- EditFamilyModal (origin address)
- EditLocationModal (address)
- EditRouteModal (origin, if manual override)

**Success Criteria:**
- ✅ All address fields show autocomplete suggestions
- ✅ Selecting a place auto-fills coordinates
- ✅ Graceful fallback to text input on API errors
- ✅ Works in all modals (add and edit)

**Estimated Complexity:** Medium (Reusable component + 6 integration points)

---

### **Wave 3: Edit Modals** ✏️

**Components:**
- EditFamilyModal.tsx (full implementation)
- EditLocationModal.tsx (full implementation)

**Success Criteria:**
- ✅ Edit buttons open modals with pre-populated data
- ✅ Changes save correctly
- ✅ Dirty form warning on cancel/close
- ✅ All validations work
- ✅ Toast notifications on success/error
- ✅ AddressAutocomplete integration from Wave 2

**Estimated Complexity:** Low (Structure exists, just need UI + dirty-form logic)

---

## Out of Scope (Future Enhancements)

These features are mentioned in project docs but not part of this implementation:

- Multi-trip support (currently single trip "default")
- Export/import JSON functionality
- Undo/redo system
- Optimistic updates for mutations
- Backend API integration
- Real-time collaboration (WebSocket sync)
- Advanced route features:
  - Waypoints/multiple stops
  - Route alternatives (scenic vs fastest)
  - Traffic-aware ETAs
  - Turn-by-turn navigation
- Mobile PWA optimizations
- Offline-first capabilities

**Why out of scope?**
- Focus on completing core CRUD functionality first
- These are advanced features that can be layered on later
- Current implementation provides 80% of value with 20% of complexity

---

## Success Metrics

**Wave 1 Complete When:**
- User can create, view, edit, delete routes
- Routes display on map with polylines
- Directions API integration working
- All error cases handled gracefully

**Wave 2 Complete When:**
- All address fields have autocomplete
- Coordinates auto-fill from Places API
- Fallback to text input works

**Wave 3 Complete When:**
- Edit modals fully functional
- Dirty-form warnings working
- All CRUD operations complete for all entities

**Overall Success:**
- No placeholder alerts ("Edit functionality coming soon")
- All three main entities (Families, Locations, Routes) have full CRUD
- Professional UX with autocomplete and validations
- User can plan entire trip in the dashboard

---

## Design System Compliance

All UI follows the existing design system from `DESIGN.md`:

**Colors:**
- Background: `#0A0C10`
- Surface: `#161B22`
- Border: `#30363D`
- Text Primary: `#C9D1D9`
- Text Muted: `#8B949E`
- Success: `#238636` (buttons), `#3FB950` (accents)
- Info: `#58A6FF`
- Critical: `#F85149`, `#DA3633`

**Typography:**
- Body: Inter (Regular/Medium)
- Data: Geist Mono (route distance, duration, coordinates)
- Labels: Inter Semi-Bold, all-caps for status

**Spacing:**
- Base unit: 4px
- Compact density for information-rich UI

**Motion:**
- Minimal-functional (transitions only for state changes)
- Duration: 150-250ms
- Easing: ease-out for entrances

---

## Dependencies

**Existing:**
- `@react-google-maps/api` or vanilla Google Maps JS API
- `react-hook-form` ✅ Already in use
- `zod` ✅ Already in use
- `@tanstack/react-query` ✅ Already in use
- `lucide-react` ✅ Already in use

**New (if needed):**
- No new dependencies required
- All functionality achievable with existing stack

---

## Conclusion

This design provides a clear, incremental path to completing the remaining features:

1. **Wave 1** delivers the highest-impact feature (route management) first
2. **Wave 2** enhances UX across all forms with autocomplete
3. **Wave 3** completes the CRUD functionality

Each wave is independently shippable, testable, and provides user value. The architecture builds on existing patterns, minimizing complexity and rework.

**Next Step:** Create implementation plan with detailed file-by-file tasks.
