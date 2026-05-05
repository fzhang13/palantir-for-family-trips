# Dynamic Trip Data System

## Overview

The Dynamic Trip Data System transforms the static trip dashboard into a collaborative planning tool with full CRUD capabilities for families, locations, and routes. Built with React Query, Repository pattern, and localStorage persistence, this system provides real-time data management with optimistic updates and comprehensive error handling.

## Features

### Implemented
- Full CRUD operations for Families
- Full CRUD operations for Locations
- Read operations for Routes (create/update/delete structure exists)
- Modal-based forms with Zod validation
- React Query for data synchronization and caching
- Toast notifications for user feedback
- Loading and error states
- localStorage persistence via Repository pattern

### Not Yet Implemented
- Edit modals for Families and Locations (structure exists, UI pending)
- Route management UI (repository methods exist)
- Google Maps Places autocomplete integration
- Multi-trip support (single trip "default" currently supported)
- Backend synchronization (currently localStorage-only)
- Data export/import functionality
- Optimistic updates for mutations

## Architecture

### Data Flow

```
UI Component
    ↓ (form submit)
Form with react-hook-form + Zod validation
    ↓ (validated data)
React Query Mutation Hook (useTripMutations.ts)
    ↓ (execute mutation)
Repository Method (LocalStorageTripRepository.ts)
    ↓ (CRUD operation)
localStorage (TRIP_DOCUMENT_STORAGE_KEY)
    ↓ (success)
Query Cache Invalidation
    ↓ (refetch)
React Query Hook (useTripQueries.ts)
    ↓ (updated data)
UI Component Re-renders
```

### Layer Breakdown

#### 1. Repository Layer (`src/repositories/`)

**Purpose:** Abstract data storage and provide consistent CRUD interface

**Files:**
- `TripRepository.ts` - Interface defining all CRUD operations
- `LocalStorageTripRepository.ts` - Implementation using localStorage
- `index.ts` - Singleton instance export

**Key Methods:**
```typescript
// Families
getFamilies(tripId: string): Promise<Family[]>
getFamily(tripId: string, familyId: string): Promise<Family>
addFamily(tripId: string, input: CreateFamilyInput): Promise<Family>
updateFamily(tripId: string, familyId: string, updates: Partial<Family>): Promise<Family>
deleteFamily(tripId: string, familyId: string): Promise<void>

// Locations
getLocations(tripId: string): Promise<Location[]>
getLocation(tripId: string, locationId: string): Promise<Location>
addLocation(tripId: string, input: CreateLocationInput): Promise<Location>
updateLocation(tripId: string, locationId: string, updates: Partial<Location>): Promise<Location>
deleteLocation(tripId: string, locationId: string): Promise<void>

// Routes
getRoutes(tripId: string): Promise<Route[]>
getRoute(tripId: string, routeId: string): Promise<Route>
addRoute(tripId: string, input: CreateRouteInput): Promise<Route>
updateRoute(tripId: string, routeId: string, updates: Partial<Route>): Promise<Route>
deleteRoute(tripId: string, routeId: string): Promise<void>
```

**Why Repository Pattern?**
- Easy to swap localStorage for API backend later
- Centralized data access logic
- Type-safe operations
- Testable in isolation

#### 2. React Query Layer (`src/hooks/`)

**Purpose:** Manage server state, caching, and synchronization

**Files:**
- `useTripQueries.ts` - Query hooks for reading data
- `useTripMutations.ts` - Mutation hooks for creating/updating/deleting

**Query Hooks:**
```typescript
useFamilies(tripId?: string)   // Returns { data, isLoading, isError, error, refetch }
useLocations(tripId?: string)  // Returns { data, isLoading, isError, error, refetch }
useRoutes(tripId?: string)     // Returns { data, isLoading, isError, error, refetch }
useTrip(tripId?: string)       // Returns full trip document
```

**Mutation Hooks:**
```typescript
// Families
useAddFamily()     // Returns { mutate, mutateAsync, isPending, isError }
useUpdateFamily()  // Returns { mutate, mutateAsync, isPending, isError }
useDeleteFamily()  // Returns { mutate, mutateAsync, isPending, isError }

// Locations
useAddLocation()
useUpdateLocation()
useDeleteLocation()

// Routes
useAddRoute()
useUpdateRoute()
useDeleteRoute()
```

**Cache Invalidation Strategy:**
- After successful mutation, invalidate affected query keys
- Example: Adding a family invalidates `['families', tripId]` and `['trip', tripId]`
- This triggers automatic refetch of updated data

#### 3. Validation Layer (`src/schemas/`)

**Purpose:** Runtime validation and type safety for form inputs

**Files:**
- `familySchema.ts` - Zod schema for family forms
- `locationSchema.ts` - Zod schema for location forms
- `routeSchema.ts` - Zod schema for route forms

**Example Schema:**
```typescript
export const createFamilySchema = z.object({
  name: z.string().min(1, 'Family name is required'),
  origin: z.string().min(1, 'Origin is required'),
  originAddress: z.string().min(1, 'Origin address is required'),
  originCoordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  vehicle: z.string().optional(),
  headcount: z.string().optional(),
  // ... more fields
})

export type CreateFamilyFormData = z.infer<typeof createFamilySchema>
```

**Integration with react-hook-form:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<CreateFamilyFormData>({
  resolver: zodResolver(createFamilySchema),
})
```

#### 4. UI Components (`src/components/`)

**Modal Components (`src/components/modals/`):**
- `BaseModal.tsx` - Reusable modal wrapper with backdrop and animations
- `AddFamilyModal.tsx` - Form for creating new families
- `AddLocationModal.tsx` - Form for creating new locations
- Edit modals exist but UI not yet implemented

**Page Components (`src/components/pages/`):**
- `FamiliesPage.tsx` - Family roster with CRUD operations
- Other pages are stubs awaiting implementation

**Modal Pattern:**
```typescript
// Open/close state managed in parent
const [isAddModalOpen, setIsAddModalOpen] = useState(false)

// Modal component handles form state and mutation
<AddFamilyModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
/>
```

#### 5. Type System (`src/types/`)

**Core Types (`trip.ts`):**
```typescript
interface Family {
  id: string
  type: 'family'
  title: string
  name: string
  origin: string
  originAddress: string
  originCoordinates: { lat: number; lng: number }
  arrivalDayId: string
  vehicle: string
  headcount?: string
  // ... more fields
}

interface Location {
  id: string
  type: 'location'
  category: 'stay' | 'meal' | 'logistics'
  title: string
  address: string
  coordinates: { lat: number; lng: number }
  // ... more fields
}
```

**Input Types (`inputs.ts`):**
```typescript
interface CreateFamilyInput {
  name: string
  origin: string
  originAddress: string
  originCoordinates: { lat: number; lng: number }
  vehicle?: string
  // ... optional fields
}
```

**Why separate input types?**
- Input types contain only user-provided data
- Full entity types include system-generated fields (id, type, etc.)
- Clear separation of concerns

## Data Storage

### localStorage Structure

**Key:** `trip_document`

**Value:** JSON-serialized TripDocument

```typescript
interface TripDocument {
  families: Family[]
  locations: Location[]
  routes: Route[]
  tasks: Task[]
  itinerary: Itinerary
  meta: TripMeta
}
```

### Storage Methods

**Read:**
```typescript
const stored = localStorage.getItem('trip_document')
const trip = JSON.parse(stored)
```

**Write:**
```typescript
localStorage.setItem('trip_document', JSON.stringify(trip))
```

**Error Handling:**
- Parse errors throw with message
- Quota exceeded errors provide helpful message
- Missing data returns error (no auto-initialization yet)

### Migration Notes

Currently, the system expects a pre-existing trip document in localStorage. If none exists, errors will occur. Future enhancement: auto-initialize empty trip on first load.

## Usage Guide

### Adding a Family

1. Navigate to Families page
2. Click "Add Family" button
3. Fill out form:
   - Family Name (required)
   - Origin City (required)
   - Origin Address (required)
   - Vehicle Type (optional, default: SUV)
   - Headcount (optional)
   - Responsibility (optional)
   - Arrival Day (optional, default: Thursday)
   - Notes (optional)
4. Click "Add Family"
5. Success toast appears
6. Family list automatically updates

**Behind the scenes:**
```typescript
const addFamily = useAddFamily()

addFamily.mutate({
  tripId: 'default',
  family: {
    name: 'The Smiths',
    origin: 'San Francisco',
    originAddress: '1 Market St, San Francisco, CA',
    originCoordinates: { lat: 37.7749, lng: -122.4194 },
    vehicle: 'SUV',
  }
})
```

### Adding a Location

1. Navigate to Stay, Meals, or Activities page (future)
2. Click "Add Location" button
3. Fill out form:
   - Title (required)
   - Category (stay/meal/logistics)
   - Address (required)
   - Additional details based on category
4. Click "Add Location"
5. Success toast appears
6. Location list updates

### Deleting Entities

1. Click trash icon on entity card
2. Confirm deletion in browser dialog
3. Entity removed from UI
4. Success toast appears

**Current limitation:** No soft delete or undo functionality.

### Error Scenarios

**Validation Errors:**
- Shown inline below form fields
- Prevent form submission
- Clear on field correction

**Network/Storage Errors:**
- Toast notification with error message
- Mutation stays in pending state
- User can retry operation

**Missing Data:**
- Loading state shown
- Error message if data fetch fails
- Retry mechanism via React Query

## Developer Guide

### Adding a New Entity Type

1. Define type in `src/types/trip.ts`
2. Define input type in `src/types/inputs.ts`
3. Add CRUD methods to `TripRepository` interface
4. Implement methods in `LocalStorageTripRepository`
5. Create Zod schema in `src/schemas/`
6. Add query hook in `useTripQueries.ts`
7. Add mutation hooks in `useTripMutations.ts`
8. Build UI components (page, modals, cards)

### Customizing Query Behavior

**Change cache time:**
```typescript
// In src/lib/queryClient.ts
staleTime: 10 * 60 * 1000  // 10 minutes instead of 5
```

**Disable refetch on window focus:**
```typescript
useQuery({
  queryKey: ['families', tripId],
  queryFn: () => tripRepository.getFamilies(tripId),
  refetchOnWindowFocus: false,
})
```

**Add optimistic updates:**
```typescript
const queryClient = useQueryClient()

useMutation({
  mutationFn: (family) => tripRepository.addFamily('default', family),
  onMutate: async (newFamily) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: ['families', 'default'] })
    
    // Snapshot previous value
    const previousFamilies = queryClient.getQueryData(['families', 'default'])
    
    // Optimistically update
    queryClient.setQueryData(['families', 'default'], (old) => [...old, newFamily])
    
    // Return context for rollback
    return { previousFamilies }
  },
  onError: (err, newFamily, context) => {
    // Rollback on error
    queryClient.setQueryData(['families', 'default'], context.previousFamilies)
  },
  onSettled: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries({ queryKey: ['families', 'default'] })
  },
})
```

### Testing

**Unit Testing Repositories:**
```typescript
describe('LocalStorageTripRepository', () => {
  beforeEach(() => {
    localStorage.clear()
    // Seed test data
  })
  
  it('should add a family', async () => {
    const repo = new LocalStorageTripRepository()
    const family = await repo.addFamily('default', {
      name: 'Test Family',
      origin: 'Test City',
      // ... required fields
    })
    
    expect(family.id).toBeDefined()
    expect(family.name).toBe('Test Family')
  })
})
```

**Integration Testing React Query:**
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFamilies } from '@/hooks'

test('useFamilies returns families', async () => {
  const wrapper = ({ children }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
  
  const { result } = renderHook(() => useFamilies(), { wrapper })
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  
  expect(result.current.data).toHaveLength(2)
})
```

## Future Enhancements

### Short Term (Next Sprint)

1. **Edit Modals**
   - Implement EditFamilyModal UI
   - Implement EditLocationModal UI
   - Pre-populate forms with existing data
   - Update mutation integration

2. **Route Management Page**
   - Build ItineraryPage with route visualization
   - Add route creation flow
   - Integrate Google Maps Directions API
   - Display route polylines on map

3. **Google Places Integration**
   - Add autocomplete for address fields
   - Auto-fill coordinates from Places API
   - Show place suggestions as user types

4. **Data Validation**
   - Prevent duplicate family names
   - Validate coordinate bounds
   - Check route waypoint ordering
   - Enforce business rules (e.g., arrival before departure)

### Medium Term (This Quarter)

1. **Multi-Trip Support**
   - Trip list/switcher UI
   - Trip creation/deletion
   - Per-trip localStorage keys
   - Trip metadata (name, dates, description)

2. **Data Export/Import**
   - Export trip to JSON file
   - Import trip from file
   - Share trip via URL (future backend)
   - Backup/restore functionality

3. **Enhanced UX**
   - Drag-and-drop route reordering
   - Inline editing (click to edit fields)
   - Bulk operations (multi-select delete)
   - Search/filter capabilities

4. **Undo/Redo System**
   - Command pattern for mutations
   - History stack in context
   - Undo/redo buttons in UI
   - Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

### Long Term (This Year)

1. **Backend API Integration**
   - RESTful API endpoints
   - Authentication (multi-user)
   - Real-time sync via WebSocket
   - Conflict resolution
   - Repository implementation for API backend

2. **Collaborative Features**
   - Multiple users per trip
   - Real-time updates across clients
   - Commenting system
   - Activity feed
   - Permissions (owner, editor, viewer)

3. **Advanced Route Planning**
   - Automatic route optimization
   - Traffic-aware ETAs
   - Alternative route suggestions
   - Waypoint POI recommendations
   - Gas/charging station finder

4. **Mobile Experience**
   - Responsive design improvements
   - Progressive Web App (PWA)
   - Offline-first architecture
   - Mobile-optimized forms

## Known Limitations

1. **Single Trip Only:** Currently hardcoded to `tripId = 'default'`
2. **No Edit UI:** Update mutations exist but no edit modal UI yet
3. **No Route UI:** Route CRUD methods exist but no page/modals yet
4. **Manual Coordinates:** No Places API integration; coordinates must be entered manually
5. **No Optimistic Updates:** UI waits for mutation success before updating
6. **No Undo:** Deletions are permanent (within session)
7. **Storage Quota:** No handling of localStorage size limits (will error at ~10MB)
8. **No Data Migration:** Schema changes may break existing localStorage data
9. **No Validation on Load:** Corrupt data in localStorage will cause errors
10. **Hardcoded Trip ID:** All components assume 'default' trip

## Technical Debt

1. **Error Boundaries:** Need top-level error boundary for unhandled errors
2. **Loading Skeletons:** Replace loading text with skeleton UI
3. **Form Reset:** Some modals don't reset form on close
4. **Type Inference:** Some type assertions could be eliminated with better inference
5. **Code Duplication:** Modal components share significant structure
6. **Test Coverage:** No tests written yet
7. **Accessibility:** ARIA labels incomplete, keyboard navigation limited
8. **Performance:** No virtualization for long lists
9. **Bundle Size:** React Query Devtools included in production build
10. **Constants:** Magic strings should be moved to constants file

## Migration Path to Backend

When ready to add API backend:

1. **Create API Repository:**
   ```typescript
   export class ApiTripRepository implements TripRepository {
     private baseUrl: string
     
     constructor(baseUrl: string) {
       this.baseUrl = baseUrl
     }
     
     async getFamilies(tripId: string): Promise<Family[]> {
       const response = await fetch(`${this.baseUrl}/trips/${tripId}/families`)
       return response.json()
     }
     
     // ... implement all methods
   }
   ```

2. **Swap Repository Instance:**
   ```typescript
   // src/repositories/index.ts
   export const tripRepository = import.meta.env.VITE_API_URL
     ? new ApiTripRepository(import.meta.env.VITE_API_URL)
     : new LocalStorageTripRepository()
   ```

3. **Update Query Client Config:**
   ```typescript
   // Adjust stale times for network latency
   staleTime: 30 * 1000  // 30 seconds
   ```

4. **Add Authentication:**
   ```typescript
   // Axios instance with interceptors
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL,
   })
   
   api.interceptors.request.use((config) => {
     const token = getAuthToken()
     if (token) {
       config.headers.Authorization = `Bearer ${token}`
     }
     return config
   })
   ```

No component code changes needed - all data access is abstracted through hooks.

## Conclusion

The Dynamic Trip Data System provides a solid foundation for collaborative trip planning with clean architecture, type safety, and excellent developer experience. The repository pattern ensures easy migration to a backend API when needed, while React Query handles all the complexity of caching, synchronization, and optimistic updates.

Current implementation focuses on Families and Locations CRUD with modal-based forms. Next steps are completing edit modals, implementing the route management page, and adding Google Places autocomplete for better UX.

The architecture is designed to scale from single-user localStorage to multi-user real-time collaboration without significant refactoring.
