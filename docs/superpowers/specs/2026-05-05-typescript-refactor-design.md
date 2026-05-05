# TypeScript Refactor & Component Architecture Design

**Date:** 2026-05-05  
**Objective:** Migrate codebase to TypeScript with improved component architecture, custom hooks, and React Context for state management.

## Overview

This design refactors the existing React JavaScript codebase into TypeScript with better separation of concerns. The project currently has a 5000-line App.jsx with ~15 components and dozens of utility functions mixed together. This refactor will:

1. Migrate all code to TypeScript with strict mode
2. Split components into focused, type-safe modules grouped by type
3. Extract complex logic into custom hooks
4. Implement React Context to eliminate prop drilling
5. Organize utilities by domain
6. Split the large CommandMap component
7. Add performance optimizations and code quality improvements

**Approach:** Moderate refactor (Approach B) - balances meaningful architectural improvements with manageable risk.

## 1. TypeScript Configuration & Setup

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Strict Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    /* Additional Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path Mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Dependencies to Add

```json
{
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/google.maps": "^3.55.0"
  }
}
```

### Vite Configuration Update

Update `vite.config.js` → `vite.config.ts`:
- Add path alias resolution for `@/` → `src/`
- Ensure `.ts` and `.tsx` file handling
- Maintain existing React plugin configuration

### Build Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

## 2. Folder Structure & File Organization

### New Directory Structure

```
src/
├── components/
│   ├── pages/
│   │   ├── ItineraryPage.tsx
│   │   ├── StayPage.tsx
│   │   ├── MealsPage.tsx
│   │   ├── ActivitiesPage.tsx
│   │   ├── ExpensesPage.tsx
│   │   ├── FamiliesPage.tsx
│   │   └── index.ts
│   ├── modals/
│   │   ├── DailyBriefingModal.tsx
│   │   ├── MissionLaunchModal.tsx
│   │   └── index.ts
│   ├── cards/
│   │   ├── SelectableCard.tsx
│   │   ├── PageNotesCard.tsx
│   │   ├── ActivityResearchCard.tsx
│   │   ├── TransitStopCard.tsx
│   │   └── index.ts
│   ├── ui/
│   │   ├── StatusPill.tsx
│   │   ├── SectionTitle.tsx
│   │   ├── NotesBox.tsx
│   │   ├── AppShell.tsx
│   │   └── index.ts
│   ├── timeline/
│   │   ├── TimelineBoard.tsx
│   │   ├── ScenarioControls.tsx
│   │   ├── SituationBoard.tsx
│   │   ├── MissionFeedTray.tsx
│   │   ├── FamilyList.tsx
│   │   └── index.ts
│   ├── map/
│   │   ├── MapContainer.tsx
│   │   ├── RouteRenderer.tsx
│   │   ├── WeatherOverlay.tsx
│   │   ├── MapControls.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useTimelineSimulation.ts
│   ├── useRoutePlayback.ts
│   ├── useExpenseCalculations.ts
│   ├── useTripSelection.ts
│   ├── usePersistedTripState.ts
│   ├── useGoogleMaps.ts
│   └── index.ts
├── context/
│   ├── TripContext.tsx
│   └── index.ts
├── utils/
│   ├── currency.ts
│   ├── timeline.ts
│   ├── formatting.ts
│   ├── trip.ts
│   └── index.ts
├── types/
│   ├── trip.ts
│   ├── ui.ts
│   ├── weather.ts
│   └── index.ts
├── lib/
│   ├── cn.ts
│   ├── constants.ts
│   └── env.ts
├── data/
│   ├── tripData.ts
│   └── publishConfig.ts
├── models/
│   └── tripModel.ts
├── services/
│   └── weather.ts
├── assets/
│   └── palantir-logo.svg
├── App.tsx
├── InspectorRail.tsx
├── index.css
└── main.tsx
```

### Component Splitting Strategy

**Pages (6 files):**
- Extract each page component from App.jsx into its own file
- Each receives context via `useTripContext()` hook
- Prop drilling eliminated

**Modals (2 files):**
- `DailyBriefingModal` - Day briefing overlay
- `MissionLaunchModal` - Mission launch countdown overlay

**Cards (4 files):**
- `SelectableCard` - Generic selectable card wrapper
- `PageNotesCard` - Notes card with convert-to-entity action
- `ActivityResearchCard` - Activity research display card
- `TransitStopCard` - Transit stop information card

**UI (4 files):**
- `StatusPill` - Colored status indicator
- `SectionTitle` - Section header with eyebrow/meta
- `NotesBox` - Text area for notes
- `AppShell` - Main application shell/layout

**Timeline (5 files):**
- `TimelineBoard` - Main timeline visualization
- `ScenarioControls` - Playback controls and cursor
- `SituationBoard` - Mission context display
- `MissionFeedTray` - Live mission feed
- `FamilyList` - Family status sidebar

**Map (4 files):**
- `MapContainer` - Google Maps orchestrator
- `RouteRenderer` - Route polylines and convoy markers
- `WeatherOverlay` - Weather visualization layer
- `MapControls` - Layer toggles and controls

### Barrel Exports

Each subdirectory includes an `index.ts` for clean imports:

```typescript
// components/pages/index.ts
export { ItineraryPage } from './ItineraryPage'
export { StayPage } from './StayPage'
export { MealsPage } from './MealsPage'
export { ActivitiesPage } from './ActivitiesPage'
export { ExpensesPage } from './ExpensesPage'
export { FamiliesPage } from './FamiliesPage'

// Usage:
import { ItineraryPage, StayPage } from '@/components/pages'
```

## 3. Custom Hooks Extraction

### `useTimelineSimulation`

**Purpose:** Manages timeline cursor, playback state, and mission launch logic.

**Interface:**
```typescript
interface UseTimelineSimulationReturn {
  cursorSlot: number
  isPlaying: boolean
  playbackSpeed: number
  play: () => void
  pause: () => void
  jumpToCursor: (slot: number) => void
  resetToLive: () => void
  setPlaybackSpeed: (speed: number) => void
}

function useTimelineSimulation(
  doc: TripDocument,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseTimelineSimulationReturn
```

**Responsibilities:**
- Timeline cursor state management
- Playback animation loop (requestAnimationFrame)
- Speed control (1x, 2x, 4x, 8x)
- Mission gate detection and launch triggers
- Auto-pause on mission launch or end of timeline

**Extracted from:** ~200 lines of playback logic in App.jsx

### `useRoutePlayback`

**Purpose:** Calculates route progress and convoy positioning for map visualization.

**Interface:**
```typescript
interface RouteProgress {
  routeId: string
  progress: number // 0-1
  currentPosition: google.maps.LatLng
  estimatedArrival: string
  isActive: boolean
}

interface UseRoutePlaybackReturn {
  activeRoutes: RouteProgress[]
  isAnyRouteActive: boolean
}

function useRoutePlayback(
  doc: TripDocument,
  cursorSlot: number
): UseRoutePlaybackReturn
```

**Responsibilities:**
- Calculate route progress based on cursor
- Determine active routes at current time
- Interpolate convoy positions along route paths
- Calculate ETAs and arrival times

**Extracted from:** Route animation logic scattered across App.jsx and CommandMap.jsx

### `useExpenseCalculations`

**Purpose:** Centralizes all expense calculation logic.

**Interface:**
```typescript
interface UseExpenseCalculationsReturn {
  familyBurdens: Record<string, number>
  calculateAllocation: (amount: number, families: Family[]) => ExpenseAllocation[]
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void
  getTotalExpenses: () => number
}

function useExpenseCalculations(
  doc: TripDocument,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseExpenseCalculationsReturn
```

**Responsibilities:**
- Family expense burden calculations
- Equal and manual allocation generation
- Expense CRUD operations
- Total expense aggregation

**Extracted from:** ~150 lines of expense logic in App.jsx

### `useTripSelection`

**Purpose:** Manages entity selection and navigation state.

**Interface:**
```typescript
interface UseTripSelectionReturn {
  selection: EntitySelection | null
  selectEntity: (entityType: string, entityId: string) => void
  selectEntityByRef: (entity: Entity) => void
  clearSelection: () => void
  canSelectEntity: (entityType: string, entityId: string) => boolean
  selectedEntity: Entity | null
}

function useTripSelection(
  doc: TripDocument,
  currentPage: PageType,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseTripSelectionReturn
```

**Responsibilities:**
- Selection state management
- Entity validation for current page
- Auto-selection enforcement (ensureSelectionForPage)
- Derived selectedEntity lookup

**Extracted from:** Selection logic scattered throughout App.jsx

### `useGoogleMaps`

**Purpose:** Encapsulates Google Maps API initialization and lifecycle.

**Interface:**
```typescript
interface UseGoogleMapsReturn {
  map: google.maps.Map | null
  isLoaded: boolean
  error: Error | null
}

function useGoogleMaps(
  containerRef: RefObject<HTMLDivElement>,
  options: google.maps.MapOptions
): UseGoogleMapsReturn
```

**Responsibilities:**
- Google Maps API library loading
- Map instance initialization
- Error handling for API failures
- Cleanup on unmount

**Extracted from:** Map initialization in CommandMap.jsx

### Benefits of Hook Extraction

- **Testability:** Hooks can be tested in isolation with custom test harness
- **Reusability:** Logic can be shared across components
- **Separation of concerns:** Components focus on presentation, hooks handle state/logic
- **Reduced component complexity:** App.tsx goes from 5000 → ~800 lines
- **Type safety:** Hook interfaces provide clear contracts

## 4. React Context for State Management

### `TripContext` Provider

**Purpose:** Provides trip document state and common actions to all components, eliminating prop drilling.

**Context Interface:**
```typescript
interface TripContextValue {
  // Core state
  doc: TripDocument
  updateDoc: (updater: (doc: TripDocument) => TripDocument) => void
  
  // Selection state
  selection: EntitySelection | null
  selectEntity: (entityType: string, entityId: string) => void
  clearSelection: () => void
  selectedEntity: Entity | null
  
  // Page state
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
  
  // Timeline state (from useTimelineSimulation)
  cursorSlot: number
  isPlaying: boolean
  playbackSpeed: number
  play: () => void
  pause: () => void
  jumpToCursor: (slot: number) => void
  resetToLive: () => void
  
  // Common mutations
  updatePageNote: (page: PageType, note: string) => void
  convertPageNoteToEntity: (page: PageType) => void
  toggleMealStatus: (mealId: string) => void
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void
  updateItineraryItem: (itemId: string, updates: Partial<ItineraryItem>) => void
  // ... other common actions
}
```

**Provider Implementation:**

```typescript
// context/TripContext.tsx
export function TripProvider({ children }: { children: ReactNode }) {
  const [doc, updateDoc] = usePersistedTripState()
  const [currentPage, setCurrentPage] = useState<PageType>('itinerary')
  
  const selection = useTripSelection(doc, currentPage, updateDoc)
  const timeline = useTimelineSimulation(doc, updateDoc)
  const expenses = useExpenseCalculations(doc, updateDoc)
  
  const updatePageNote = useCallback((page: PageType, note: string) => {
    updateDoc(doc => ({
      ...doc,
      ui: {
        ...doc.ui,
        pageNotes: { ...doc.ui.pageNotes, [page]: note }
      }
    }))
  }, [updateDoc])
  
  // ... other common action implementations
  
  const value: TripContextValue = {
    doc,
    updateDoc,
    ...selection,
    currentPage,
    setCurrentPage,
    ...timeline,
    updatePageNote,
    // ... other actions
  }
  
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTripContext() {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error('useTripContext must be used within TripProvider')
  }
  return context
}
```

**Usage in Components:**

```typescript
// Before (prop drilling)
function ExpensesPage({ 
  doc, 
  selection, 
  onSelectEntity, 
  onUpdateExpense, 
  onUpdatePageNote, 
  onConvertPageNote,
  // ... 10 more props
}) { ... }

// After (context)
function ExpensesPage() {
  const { doc, selection, selectEntity, updateExpense, updatePageNote } = useTripContext()
  // Clean, no prop drilling
}
```

**Benefits:**
- Eliminates 15+ props per page component
- Components consume only what they need
- Actions are centralized and consistently typed
- Easy to add new shared state/actions
- Reduces App.tsx complexity significantly

## 5. Type Definitions

### `types/trip.ts` - Core Trip Types

```typescript
// Main trip document
export interface TripDocument {
  meta: TripMeta
  entities: TripEntities
  ui: UIState
  weather?: WeatherBundle
}

export interface TripMeta {
  tripName: string
  startDate: string
  endDate: string
  basecamp: Location
  timezone: string
}

export interface TripEntities {
  routes: Route[]
  locations: Location[]
  activities: Activity[]
  meals: Meal[]
  expenses: Expense[]
  families: Family[]
  itinerary: ItineraryItem[]
}

// Entity discriminated union
export type Entity = 
  | Route 
  | Location 
  | Activity 
  | Meal 
  | Expense 
  | Family 
  | ItineraryItem

// Base entity interface
export interface BaseEntity {
  id: string
  type: string
}

// Route entity
export interface Route extends BaseEntity {
  type: 'route'
  familyId: string
  origin: string
  destination: string
  departureTime: string
  path?: google.maps.LatLng[]
  durationMinutes?: number
  distanceMeters?: number
  status?: 'pending' | 'active' | 'completed'
}

// Location entity
export interface Location extends BaseEntity {
  type: 'location'
  name: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  category: 'stay' | 'activity' | 'meal' | 'transit'
  metadata?: Record<string, unknown>
}

// Activity entity
export interface Activity extends BaseEntity {
  type: 'activity'
  name: string
  description?: string
  locationId?: string
  scheduledTime?: string
  duration?: number
  category?: string
  status?: 'planned' | 'confirmed' | 'completed'
}

// Meal entity
export interface Meal extends BaseEntity {
  type: 'meal'
  name: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  scheduledTime: string
  locationId?: string
  assignedTo?: string[]
  status: 'planned' | 'shopped' | 'prepped' | 'served'
  notes?: string
}

// Expense entity
export interface Expense extends BaseEntity {
  type: 'expense'
  description: string
  amount: number
  category: string
  paidBy?: string
  allocations: ExpenseAllocation[]
  date?: string
  notes?: string
}

export interface ExpenseAllocation {
  familyId: string
  amount: number
}

// Family entity
export interface Family extends BaseEntity {
  type: 'family'
  name: string
  members: FamilyMember[]
  contactInfo?: {
    phone?: string
    email?: string
  }
}

export interface FamilyMember {
  name: string
  role?: string
  dietaryRestrictions?: string[]
}

// Itinerary item entity
export interface ItineraryItem extends BaseEntity {
  type: 'itinerary'
  itemType: 'travel' | 'activity' | 'meal' | 'gate'
  linkedEntityId?: string
  startTime: string
  endTime?: string
  label: string
  familyId?: string
  status?: string
}
```

### `types/ui.ts` - UI State Types

```typescript
export type PageType = 
  | 'itinerary' 
  | 'stay' 
  | 'meals' 
  | 'activities' 
  | 'expenses' 
  | 'families'

export interface UIState {
  currentPage: PageType
  timeline: TimelineState
  selection: EntitySelection | null
  map: MapState
  pageNotes: Record<PageType, string>
  search: SearchState
}

export interface TimelineState {
  cursorSlot: number
  isPlaying: boolean
  playbackSpeed: number
  showBriefing: boolean
  showMissionLaunch: boolean
  missionGateId?: string
}

export interface EntitySelection {
  entityType: string
  entityId: string
}

export interface MapState {
  showWeather: boolean
  showRoutes: boolean
  showLocations: boolean
  visibleLayers: string[]
}

export interface SearchState {
  query: string
  results: Entity[]
  isOpen: boolean
}

export type ToneName = 
  | 'default' 
  | 'Transit' 
  | 'Activity' 
  | 'Meal' 
  | 'Critical' 
  | 'Warning' 
  | 'Success'

export interface GateContext {
  gate: ItineraryItem
  relatedRoutes: Route[]
  estimatedArrivals: string[]
  readinessStatus: string
}
```

### `types/weather.ts` - Weather Types

```typescript
export interface WeatherBundle {
  locations: Record<string, LocationWeather>
  fetchedAt: string
}

export interface LocationWeather {
  locationId: string
  daily: DailyForecast[]
  hourly: HourlyForecast[]
}

export interface DailyForecast {
  date: string
  high: number
  low: number
  condition: WeatherCondition
  precipChance: number
}

export interface HourlyForecast {
  time: string
  temp: number
  condition: WeatherCondition
  precipChance: number
  windSpeed?: number
}

export type WeatherCondition = 
  | 'sun' 
  | 'partly' 
  | 'cloud' 
  | 'rain' 
  | 'storm' 
  | 'fog' 
  | 'wind' 
  | 'snow'

export interface MapWeatherTarget {
  locationId: string
  coordinates: { lat: number; lng: number }
  label: string
}
```

### Type Safety Benefits

- **Compile-time safety:** Catch type errors before runtime
- **IntelliSense:** Full autocomplete in IDE for all properties/methods
- **Refactoring confidence:** TypeScript finds all usages when changing types
- **Self-documenting:** Types serve as inline documentation
- **Discriminated unions:** Safe entity type narrowing with `switch (entity.type)`

## 6. Utility Functions Organization

### `utils/currency.ts` - Money & Expense Utilities

```typescript
/**
 * Format amount as USD currency
 */
export function formatCurrency(amount: number): string

/**
 * Parse user input to currency amount
 */
export function parseCurrencyInput(value: string): number

/**
 * Build equal expense allocations across families
 */
export function buildEqualExpenseAllocations(
  amount: number, 
  families: Family[]
): ExpenseAllocation[]

/**
 * Get expense allocations (equal or custom)
 */
export function getExpenseAllocations(
  expense: Expense, 
  families: Family[]
): ExpenseAllocation[]

/**
 * Calculate total expense burden per family
 */
export function getFamilyExpenseBurden(
  expenses: Expense[], 
  families: Family[]
): Record<string, number>

/**
 * Build manual allocation seed for custom splitting
 */
export function buildManualAllocationSeed(
  amount: number, 
  families: Family[]
): ExpenseAllocation[]
```

### `utils/timeline.ts` - Timeline & Cursor Utilities

```typescript
/**
 * Clamp cursor to valid timeline range
 */
export function clampTimelineCursor(slot: number): number

/**
 * Get visible cursor range for a given day
 */
export function getDayVisibleCursorRange(dayIndex: number): [number, number]

/**
 * Project cursor to visible timeline ratio (0-1)
 */
export function projectCursorToVisibleTimelineRatio(
  cursorSlot: number, 
  dayCount?: number
): number

/**
 * Project visible ratio back to cursor slot
 */
export function projectVisibleTimelineRatioToCursor(
  ratio: number, 
  dayCount?: number
): number

/**
 * Get hour-in-day for cursor (0-23)
 */
export function getCursorHourInDay(cursorSlot: number): number

/**
 * Get day index for cursor
 */
export function getCursorDay(cursorSlot: number): number

/**
 * Get mission launch cursor for day
 */
export function getMissionLaunchCursor(dayIndex: number): number

/**
 * Get suggested playback start cursor
 */
export function getSuggestedPlaybackStartCursor(
  doc: TripDocument,
  cursorSlot: number,
  operationCheckpoint?: number
): number

/**
 * Get current trip cursor based on real time
 */
export function getCurrentTripCursor(now?: Date): number
```

### `utils/formatting.ts` - Text & Data Formatting

```typescript
/**
 * Format list of names with commas and "and"
 */
export function formatNameList(labels: string[]): string

/**
 * Strip "Day N: " prefix from labels
 */
export function stripDayPrefix(label: string): string

/**
 * Get compact travel label for itinerary item
 */
export function getCompactTravelLabel(item: ItineraryItem): string

/**
 * Deduplicate array by id property
 */
export function dedupeById<T extends { id: string }>(items: T[]): T[]

/**
 * Pick most frequent entity from list
 */
export function pickMostFrequentEntity(items: Entity[]): Entity | null
```

### `utils/trip.ts` - Trip & Entity Utilities

```typescript
/**
 * Add family metadata to entity
 */
export function stampFamilyMetadata(item: Entity, familyId: string): Entity

/**
 * Get display label for family
 */
export function getFamilyLabel(families: Family[], familyId: string): string

/**
 * Get related travel items for mission gate
 */
export function getRelatedTravelItemsForGate(
  doc: TripDocument, 
  gate: ItineraryItem
): ItineraryItem[]

/**
 * Build operation gate context for mission launch
 */
export function buildOperationGateContext(
  doc: TripDocument, 
  gate: ItineraryItem
): GateContext

/**
 * Make entity key from type and id
 */
export function makeEntityKey(entityType: string, entityId: string): string

/**
 * Parse entity key into type and id
 */
export function parseEntityKey(key: string): { type: string; id: string }
```

All utilities:
- Fully typed with explicit parameter and return types
- Pure functions (no side effects)
- Well-documented with TSDoc comments
- Exported via barrel exports (`utils/index.ts`)
- Unit-testable in isolation

## 7. CommandMap Component Splitting

### Current State
CommandMap.jsx is ~2700 lines handling:
- Google Maps initialization
- Route rendering and playback
- Weather overlay visualization
- Map controls and layer toggling
- Marker management

### Split Architecture

#### `components/map/MapContainer.tsx` (200-300 lines)

**Responsibilities:**
- Google Maps instance orchestration
- Child component coordination
- Bounds fitting and viewport management
- Marker lifecycle management

**Interface:**
```typescript
interface MapContainerProps {
  routes: Route[]
  locations: Location[]
  cursorSlot: number
  showWeather: boolean
  showRoutes: boolean
  weatherData?: WeatherBundle
}

export function MapContainer(props: MapContainerProps): JSX.Element
```

#### `components/map/RouteRenderer.tsx` (300-400 lines)

**Responsibilities:**
- Route polyline rendering
- Convoy marker animation
- Route progress calculation
- Active route filtering based on cursor

**Interface:**
```typescript
interface RouteRendererProps {
  map: google.maps.Map
  routes: Route[]
  cursorSlot: number
  isPlaying: boolean
}

export function RouteRenderer(props: RouteRendererProps): null
```

**Implementation approach:**
- Uses `useRoutePlayback` hook for progress calculations
- Manages polyline and marker instances in refs
- Updates marker positions via requestAnimationFrame
- Cleans up map overlays on unmount

#### `components/map/WeatherOverlay.tsx` (200-300 lines)

**Responsibilities:**
- Weather icon marker rendering
- Weather data visualization
- Location weather assignment
- Overlay positioning

**Interface:**
```typescript
interface WeatherOverlayProps {
  map: google.maps.Map
  weatherData: WeatherBundle
  locations: Location[]
  visible: boolean
}

export function WeatherOverlay(props: WeatherOverlayProps): null
```

#### `components/map/MapControls.tsx` (150-200 lines)

**Responsibilities:**
- Layer toggle controls
- Map legend
- Zoom controls
- Compact overlay UI

**Interface:**
```typescript
interface MapControlsProps {
  showWeather: boolean
  showRoutes: boolean
  showLocations: boolean
  onToggleWeather: () => void
  onToggleRoutes: () => void
  onToggleLocations: () => void
  layers: string[]
}

export function MapControls(props: MapControlsProps): JSX.Element
```

### `hooks/useGoogleMaps.ts`

**Responsibilities:**
- Google Maps API loading via `@googlemaps/js-api-loader`
- Map instance creation
- Error handling
- Cleanup on unmount

**Interface:**
```typescript
interface UseGoogleMapsReturn {
  map: google.maps.Map | null
  isLoaded: boolean
  error: Error | null
}

export function useGoogleMaps(
  containerRef: RefObject<HTMLDivElement>,
  options: google.maps.MapOptions
): UseGoogleMapsReturn
```

### Benefits

- Each component < 400 lines (easier to understand)
- Clear separation: container → renderer → overlay → controls
- Map components can be lazy-loaded
- Easier to test individual map features
- Google Maps API logic centralized in one hook
- Type-safe props for all map components

## 8. Additional Optimizations & Cleanup

### Performance Optimizations

#### Memoization for Expensive Computations

```typescript
// In components that do heavy calculations
const familyBurdens = useMemo(
  () => getFamilyExpenseBurden(doc.entities.expenses, doc.entities.families),
  [doc.entities.expenses, doc.entities.families]
)

const timelineContext = useMemo(
  () => getTimelineContext(doc, cursorSlot),
  [doc, cursorSlot]
)

const searchResults = useMemo(
  () => getSearchResults(doc, searchQuery),
  [doc, searchQuery]
)
```

#### Component Memoization

```typescript
// Prevent re-renders of frequently updated items
export const SelectableCard = memo(function SelectableCard({ 
  selected, 
  onClick, 
  children 
}: SelectableCardProps) {
  // ...
})

export const StatusPill = memo(function StatusPill({ 
  children, 
  tone 
}: StatusPillProps) {
  // ...
})

export const TimelineSlot = memo(function TimelineSlot({ 
  slot, 
  isCursor, 
  items 
}: TimelineSlotProps) {
  // ...
})
```

#### Callback Memoization

```typescript
// In parent components
const handleSelectEntity = useCallback((entityType: string, entityId: string) => {
  selectEntity(entityType, entityId)
}, [selectEntity])

const handleUpdateExpense = useCallback((expenseId: string, updates: Partial<Expense>) => {
  updateExpense(expenseId, updates)
}, [updateExpense])
```

### Code Quality Improvements

#### Constants Consolidation (`lib/constants.ts`)

```typescript
import { 
  LayoutGrid, 
  Home, 
  Utensils, 
  MapIcon, 
  Receipt, 
  Users 
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const PAGE_ICONS: Record<string, LucideIcon> = {
  itinerary: LayoutGrid,
  stay: Home,
  meals: Utensils,
  activities: MapIcon,
  expenses: Receipt,
  families: Users,
}

export const WEATHER_ICONS: Record<string, LucideIcon> = {
  sun: Sun,
  partly: Cloud,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudRain,
  fog: Cloud,
  wind: Cloud,
  snow: Cloud,
}

export const TONE_COLORS = {
  info: '#58A6FF',
  warning: '#D29922',
  success: '#3FB950',
  critical: '#F85149',
  violet: '#A371F7',
  muted: '#8B949E',
} as const

export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b0f14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f14' }] },
  // ... rest of map styles
]

// Timing constants
export const SPEED_REDUCTION_FACTOR = 0.75
export const MIN_ROUTE_LOOP_SECONDS = 16
export const MAX_ROUTE_LOOP_SECONDS = 34
export const PLAYBACK_SPEEDS = [1, 2, 4, 8] as const
```

#### Environment Variables (`lib/env.ts`)

```typescript
function getEnvVar(key: string, required = false): string | undefined {
  const value = import.meta.env[key]
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  googleMapsApiKey: getEnvVar('VITE_GOOGLE_MAPS_API_KEY'),
  googleMapId: getEnvVar('VITE_GOOGLE_MAP_ID'),
  disableLegacyGoogleRouting: getEnvVar('VITE_DISABLE_LEGACY_GOOGLE_ROUTING') === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
```

#### Remove Code Duplication

**Common page layout wrapper:**
```typescript
// components/ui/PageLayout.tsx
interface PageLayoutProps {
  title: string
  eyebrow?: string
  meta?: string
  children: ReactNode
}

export function PageLayout({ title, eyebrow, meta, children }: PageLayoutProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <SectionTitle eyebrow={eyebrow} title={title} meta={meta} />
      {children}
    </div>
  )
}

// Usage in pages
export function ExpensesPage() {
  return (
    <PageLayout title="Expenses" eyebrow="Budget" meta={totalFormatted}>
      {/* page content */}
    </PageLayout>
  )
}
```

**Shared entity card rendering:**
```typescript
// Extract common card layout logic
function EntityCardLayout({ ... }) { ... }
```

### ESLint + Prettier Setup

**`.eslintrc.cjs`:**
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
}
```

**`.prettierrc`:**
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

### Bundle Optimization

**Code splitting for page components:**
```typescript
// App.tsx
import { lazy, Suspense } from 'react'

const ItineraryPage = lazy(() => import('@/components/pages/ItineraryPage'))
const ExpensesPage = lazy(() => import('@/components/pages/ExpensesPage'))
// ... other pages

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {currentPage === 'itinerary' && <ItineraryPage />}
      {currentPage === 'expenses' && <ExpensesPage />}
      {/* ... */}
    </Suspense>
  )
}
```

**Verify tree-shaking:**
- Remove unused imports
- Use named imports instead of default when possible
- Check bundle analyzer for dead code

## Migration Strategy

### Phase 1: TypeScript Setup
1. Add TypeScript dependencies
2. Create `tsconfig.json` with strict mode
3. Update Vite config for TypeScript
4. Add build script with type checking

### Phase 2: Type Definitions
1. Create all type files in `types/`
2. Define core interfaces (TripDocument, Entity types, UI types)
3. Add barrel exports

### Phase 3: Utility Extraction
1. Create utility files in `utils/`
2. Migrate utility functions from App.jsx
3. Add type annotations to all utilities
4. Add barrel exports

### Phase 4: Component Splitting
1. Create component directory structure
2. Extract UI components (StatusPill, SectionTitle, etc.)
3. Extract card components
4. Extract modal components
5. Extract page components
6. Add barrel exports

### Phase 5: Context & Hooks
1. Create custom hooks (useTimelineSimulation, etc.)
2. Create TripContext provider
3. Wire up context in App.tsx
4. Update components to use context instead of props

### Phase 6: Map Component Split
1. Create `hooks/useGoogleMaps.ts`
2. Split CommandMap into MapContainer, RouteRenderer, etc.
3. Wire up map components

### Phase 7: Optimization
1. Add memoization where appropriate
2. Set up ESLint + Prettier
3. Add code splitting for pages
4. Run bundle analyzer and optimize

### Phase 8: Verification
1. Type-check entire codebase (`npm run type-check`)
2. Test all pages and features manually
3. Verify no regressions in functionality
4. Check bundle size and performance

## Success Criteria

- ✅ All files migrated to TypeScript with strict mode
- ✅ No TypeScript errors (`tsc --noEmit` passes)
- ✅ App.tsx reduced from 5000 → ~800 lines
- ✅ All components < 500 lines
- ✅ Zero prop drilling (context used throughout)
- ✅ All utilities organized by domain
- ✅ ESLint + Prettier configured and passing
- ✅ Application functionality unchanged
- ✅ Build succeeds and runs in browser
- ✅ Bundle size acceptable (check before/after)

## Non-Goals

- Not introducing state management libraries (Redux, Zustand)
- Not adding unit tests (can be added later)
- Not changing UI design or user experience
- Not refactoring tripModel.js business logic (keep as-is)
- Not adding new features
- Not changing build tooling beyond TypeScript

## Risks & Mitigations

**Risk:** Breaking functionality during migration  
**Mitigation:** Migrate incrementally, test after each phase

**Risk:** Type errors in complex Google Maps integration  
**Mitigation:** Use `@types/google.maps`, allow `any` for edge cases initially

**Risk:** Context performance issues with frequent updates  
**Mitigation:** Use memoization, split contexts if needed, measure performance

**Risk:** Bundle size increase from TypeScript  
**Mitigation:** Monitor bundle size, tree-shake unused code, lazy load pages

**Risk:** Merge conflicts if working on other branches  
**Mitigation:** Create single focused PR, communicate migration timeline

## Future Enhancements (Post-Migration)

- Add unit tests for utilities and hooks
- Add integration tests for complex flows
- Consider Zustand for more complex state if needed
- Add Storybook for component documentation
- Implement comprehensive error boundaries
- Add performance monitoring
- Split tripModel.ts into domain modules if it grows
