# TypeScript Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate React JavaScript codebase to TypeScript with improved component architecture, custom hooks, and React Context for state management.

**Architecture:** Split 5000-line App.jsx into focused components grouped by type (pages, modals, cards, UI, timeline, map). Extract complex logic into custom hooks. Implement TripContext to eliminate prop drilling. Organize utilities by domain. Use strict TypeScript with comprehensive type definitions.

**Tech Stack:** TypeScript 5.6, React 19, Vite, @types/react, @types/google.maps, ESLint, Prettier

---

## File Structure Overview

### New Files to Create

**TypeScript Config:**
- `tsconfig.json` - Strict TypeScript configuration
- `tsconfig.node.json` - Node-specific config for Vite
- `vite.config.ts` - Migrated from .js

**Types:**
- `src/types/trip.ts` - Core trip document and entity types
- `src/types/ui.ts` - UI state and interaction types
- `src/types/weather.ts` - Weather data types
- `src/types/index.ts` - Barrel exports

**Utils:**
- `src/utils/currency.ts` - Money formatting and calculations
- `src/utils/timeline.ts` - Timeline cursor and playback logic
- `src/utils/formatting.ts` - Text and data formatting
- `src/utils/trip.ts` - Entity and trip helpers
- `src/utils/index.ts` - Barrel exports

**Lib:**
- `src/lib/cn.ts` - Tailwind merge utility
- `src/lib/constants.ts` - Icons, colors, map styles
- `src/lib/env.ts` - Environment variables

**Context:**
- `src/context/TripContext.tsx` - Trip state provider
- `src/context/index.ts` - Barrel exports

**Hooks:**
- `src/hooks/usePersistedTripState.ts` - Migrated from .js
- `src/hooks/useTimelineSimulation.ts` - Timeline logic
- `src/hooks/useRoutePlayback.ts` - Route animation
- `src/hooks/useExpenseCalculations.ts` - Expense logic
- `src/hooks/useTripSelection.ts` - Selection management
- `src/hooks/useGoogleMaps.ts` - Map initialization
- `src/hooks/index.ts` - Barrel exports

**Components - UI:**
- `src/components/ui/StatusPill.tsx`
- `src/components/ui/SectionTitle.tsx`
- `src/components/ui/NotesBox.tsx`
- `src/components/ui/AppShell.tsx`
- `src/components/ui/index.ts`

**Components - Cards:**
- `src/components/cards/SelectableCard.tsx`
- `src/components/cards/PageNotesCard.tsx`
- `src/components/cards/ActivityResearchCard.tsx`
- `src/components/cards/TransitStopCard.tsx`
- `src/components/cards/index.ts`

**Components - Modals:**
- `src/components/modals/DailyBriefingModal.tsx`
- `src/components/modals/MissionLaunchModal.tsx`
- `src/components/modals/index.ts`

**Components - Timeline:**
- `src/components/timeline/TimelineBoard.tsx`
- `src/components/timeline/ScenarioControls.tsx`
- `src/components/timeline/SituationBoard.tsx`
- `src/components/timeline/MissionFeedTray.tsx`
- `src/components/timeline/FamilyList.tsx`
- `src/components/timeline/index.ts`

**Components - Pages:**
- `src/components/pages/ItineraryPage.tsx`
- `src/components/pages/StayPage.tsx`
- `src/components/pages/MealsPage.tsx`
- `src/components/pages/ActivitiesPage.tsx`
- `src/components/pages/ExpensesPage.tsx`
- `src/components/pages/FamiliesPage.tsx`
- `src/components/pages/index.ts`

**Components - Map:**
- `src/components/map/MapContainer.tsx`
- `src/components/map/RouteRenderer.tsx`
- `src/components/map/WeatherOverlay.tsx`
- `src/components/map/MapControls.tsx`
- `src/components/map/index.ts`

**Components - Root:**
- `src/components/index.ts`

**Data:**
- `src/data/tripData.ts` - Migrated from .js
- `src/data/publishConfig.ts` - Migrated from .js

**Models:**
- `src/models/tripModel.ts` - Migrated from .js

**Services:**
- `src/services/weather.ts` - Migrated from .js

**Root:**
- `src/App.tsx` - Migrated and drastically simplified
- `src/main.tsx` - Migrated from .jsx
- `src/InspectorRail.tsx` - Migrated from .jsx

### Files to Rename/Migrate

- `src/App.jsx` → `src/App.tsx`
- `src/main.jsx` → `src/main.tsx`
- `src/CommandMap.jsx` → Deleted (split into map components)
- `src/InspectorRail.jsx` → `src/InspectorRail.tsx`
- `src/tripData.js` → `src/data/tripData.ts`
- `src/tripModel.js` → `src/models/tripModel.ts`
- `src/weather.js` → `src/services/weather.ts`
- `src/usePersistedTripState.js` → `src/hooks/usePersistedTripState.ts`
- `src/publishConfig.js` → `src/data/publishConfig.ts`
- `vite.config.js` → `vite.config.ts`

---

## Task 1: TypeScript Setup and Configuration

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Modify: `package.json`
- Create: `vite.config.ts`
- Delete: `vite.config.js`

- [ ] **Step 1: Install TypeScript dependencies**

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/google.maps
```

Expected: Dependencies installed successfully

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Update package.json scripts**

Update the `scripts` section in `package.json`:

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

- [ ] **Step 5: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 6: Delete old vite.config.js**

```bash
rm vite.config.js
```

- [ ] **Step 7: Verify TypeScript setup**

```bash
npm run type-check
```

Expected: No errors (empty src will type-check fine)

- [ ] **Step 8: Commit TypeScript setup**

```bash
git add tsconfig.json tsconfig.node.json package.json package-lock.json vite.config.ts
git commit -m "chore: add TypeScript configuration with strict mode

- Add TypeScript 5.6 and type definitions
- Configure strict type checking
- Add path alias @/* for cleaner imports
- Update build script to include type checking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Core Type Definitions

**Files:**
- Create: `src/types/trip.ts`
- Create: `src/types/ui.ts`
- Create: `src/types/weather.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: Create src/types/trip.ts**

```typescript
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
  notes?: string
  bullets?: string[]
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

// Entity discriminated union
export type Entity = 
  | Route 
  | Location 
  | Activity 
  | Meal 
  | Expense 
  | Family 
  | ItineraryItem

// Trip metadata
export interface TripMeta {
  tripName: string
  startDate: string
  endDate: string
  basecamp: Location
  timezone: string
}

// Trip entities collection
export interface TripEntities {
  routes: Route[]
  locations: Location[]
  activities: Activity[]
  meals: Meal[]
  expenses: Expense[]
  families: Family[]
  itinerary: ItineraryItem[]
}

// Main trip document
export interface TripDocument {
  meta: TripMeta
  entities: TripEntities
  ui: UIState
  weather?: WeatherBundle
}

// Import UIState and WeatherBundle (will be defined in other type files)
import type { UIState } from './ui'
import type { WeatherBundle } from './weather'
```

- [ ] **Step 2: Create src/types/ui.ts**

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
  results: any[]
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
  gate: any
  relatedRoutes: any[]
  estimatedArrivals: string[]
  readinessStatus: string
}
```

- [ ] **Step 3: Create src/types/weather.ts**

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

- [ ] **Step 4: Create src/types/index.ts**

```typescript
export * from './trip'
export * from './ui'
export * from './weather'
```

- [ ] **Step 5: Verify types compile**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 6: Commit type definitions**

```bash
git add src/types/
git commit -m "feat: add core TypeScript type definitions

- Add trip document and entity types
- Add UI state types
- Add weather data types
- Export via barrel exports

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Library Utilities (cn, constants, env)

**Files:**
- Create: `src/lib/cn.ts`
- Create: `src/lib/constants.ts`
- Create: `src/lib/env.ts`

- [ ] **Step 1: Create src/lib/cn.ts**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Create src/lib/constants.ts**

```typescript
import {
  LayoutGrid,
  Home,
  Utensils,
  Map as MapIcon,
  Receipt,
  Users,
  Sun,
  Cloud,
  CloudRain,
  type LucideIcon,
} from 'lucide-react'

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
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#30363d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#11161d' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1712' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3fb950' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2a34' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#161b22' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#24313d' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#58a6ff' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1b2028' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#08111d' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#58a6ff' }] },
]

export const SPEED_REDUCTION_FACTOR = 0.75
export const MIN_ROUTE_LOOP_SECONDS = 16
export const MAX_ROUTE_LOOP_SECONDS = 34
export const PLAYBACK_SPEEDS = [1, 2, 4, 8] as const
```

- [ ] **Step 3: Create src/lib/env.ts**

```typescript
function getEnvVar(key: string): string | undefined {
  return import.meta.env[key]
}

export const env = {
  googleMapsApiKey: getEnvVar('VITE_GOOGLE_MAPS_API_KEY'),
  googleMapId: getEnvVar('VITE_GOOGLE_MAP_ID'),
  disableLegacyGoogleRouting: getEnvVar('VITE_DISABLE_LEGACY_GOOGLE_ROUTING') === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
```

- [ ] **Step 4: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 5: Commit library utilities**

```bash
git add src/lib/
git commit -m "feat: add library utilities (cn, constants, env)

- Add cn utility for Tailwind class merging
- Add constants for icons, colors, and map styles
- Add environment variable centralization

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Currency Utilities

**Files:**
- Create: `src/utils/currency.ts`

- [ ] **Step 1: Read existing currency functions from App.jsx**

```bash
grep -A 10 "function formatCurrency\|function parseCurrencyInput\|function buildEqualExpenseAllocations\|function getExpenseAllocations\|function getFamilyExpenseBurden\|function buildManualAllocationSeed" src/App.jsx
```

Expected: Find the existing function implementations

- [ ] **Step 2: Create src/utils/currency.ts**

```typescript
import type { Expense, ExpenseAllocation, Family } from '@/types'

/**
 * Format amount as USD currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse user input to currency amount
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Build equal expense allocations across families
 */
export function buildEqualExpenseAllocations(
  amount: number,
  families: Family[]
): ExpenseAllocation[] {
  const perFamily = amount / families.length
  return families.map((f) => ({
    familyId: f.id,
    amount: Math.round(perFamily * 100) / 100,
  }))
}

/**
 * Get expense allocations (equal or custom)
 */
export function getExpenseAllocations(
  expense: Expense,
  families: Family[]
): ExpenseAllocation[] {
  if (expense.allocations && expense.allocations.length > 0) {
    return expense.allocations
  }
  return buildEqualExpenseAllocations(expense.amount, families)
}

/**
 * Calculate total expense burden per family
 */
export function getFamilyExpenseBurden(
  expenses: Expense[],
  families: Family[]
): Record<string, number> {
  const burdens: Record<string, number> = {}
  
  families.forEach((f) => {
    burdens[f.id] = 0
  })
  
  expenses.forEach((expense) => {
    const allocations = getExpenseAllocations(expense, families)
    allocations.forEach((alloc) => {
      burdens[alloc.familyId] = (burdens[alloc.familyId] || 0) + alloc.amount
    })
  })
  
  return burdens
}

/**
 * Build manual allocation seed for custom splitting
 */
export function buildManualAllocationSeed(
  amount: number,
  families: Family[]
): ExpenseAllocation[] {
  return families.map((f) => ({
    familyId: f.id,
    amount: 0,
  }))
}
```

- [ ] **Step 3: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit currency utilities**

```bash
git add src/utils/currency.ts
git commit -m "feat: add currency utility functions

- Add formatCurrency for USD display
- Add parseCurrencyInput for user input
- Add expense allocation calculations
- Add family burden calculations

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Timeline Utilities

**Files:**
- Create: `src/utils/timeline.ts`

- [ ] **Step 1: Read DAYS and TIME_SLOTS from tripData**

```bash
grep -A 5 "export const DAYS\|export const TIME_SLOTS" src/tripData.js
```

Expected: Find the day/time slot constants

- [ ] **Step 2: Create src/utils/timeline.ts**

```typescript
import type { TripDocument } from '@/types'

// Constants (will import from tripData later)
const TIME_SLOTS_PER_HOUR = 4
const HOURS_PER_DAY = 24
const SLOTS_PER_DAY = TIME_SLOTS_PER_HOUR * HOURS_PER_DAY

/**
 * Clamp cursor to valid timeline range
 */
export function clampTimelineCursor(slot: number): number {
  return Math.max(0, slot)
}

/**
 * Get visible cursor range for a given day
 */
export function getDayVisibleCursorRange(dayIndex: number): [number, number] {
  const startSlot = dayIndex * SLOTS_PER_DAY
  const endSlot = startSlot + SLOTS_PER_DAY - 1
  return [startSlot, endSlot]
}

/**
 * Project cursor to visible timeline ratio (0-1)
 */
export function projectCursorToVisibleTimelineRatio(
  cursorSlot: number,
  dayCount = 4
): number {
  const totalSlots = dayCount * SLOTS_PER_DAY
  return Math.min(1, Math.max(0, cursorSlot / totalSlots))
}

/**
 * Project visible ratio back to cursor slot
 */
export function projectVisibleTimelineRatioToCursor(
  ratio: number,
  dayCount = 4
): number {
  const totalSlots = dayCount * SLOTS_PER_DAY
  return Math.round(ratio * totalSlots)
}

/**
 * Get hour-in-day for cursor (0-23)
 */
export function getCursorHourInDay(cursorSlot: number): number {
  const slotInDay = cursorSlot % SLOTS_PER_DAY
  return Math.floor(slotInDay / TIME_SLOTS_PER_HOUR)
}

/**
 * Get day index for cursor
 */
export function getCursorDay(cursorSlot: number): number {
  return Math.floor(cursorSlot / SLOTS_PER_DAY)
}

/**
 * Get mission launch cursor for day (8am)
 */
export function getMissionLaunchCursor(dayIndex: number): number {
  return dayIndex * SLOTS_PER_DAY + 8 * TIME_SLOTS_PER_HOUR
}

/**
 * Get suggested playback start cursor
 */
export function getSuggestedPlaybackStartCursor(
  doc: TripDocument,
  cursorSlot: number,
  operationCheckpoint?: number
): number {
  if (operationCheckpoint !== undefined && cursorSlot >= operationCheckpoint) {
    return cursorSlot
  }
  
  // Find earliest active route
  const routes = doc.entities.routes || []
  if (routes.length > 0) {
    return 0 // Start at beginning if routes exist
  }
  
  return cursorSlot
}

/**
 * Get current trip cursor based on real time
 */
export function getCurrentTripCursor(now: Date = new Date()): number {
  // This is a simplified version - actual implementation would calculate
  // based on trip start date and current time
  const hour = now.getHours()
  const minutes = now.getMinutes()
  const slotInDay = Math.floor((hour * 60 + minutes) / 15)
  return slotInDay
}

/**
 * Get compact travel label for itinerary item
 */
export function getCompactTravelLabel(item: any): string {
  if (!item) return ''
  
  // Extract origin and destination from label
  const match = item.label?.match(/(.+?)\s*→\s*(.+)/)
  if (match) {
    const [, origin, dest] = match
    return `${origin.trim()} → ${dest.trim()}`
  }
  
  return item.label || ''
}
```

- [ ] **Step 3: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit timeline utilities**

```bash
git add src/utils/timeline.ts
git commit -m "feat: add timeline utility functions

- Add cursor position and range calculations
- Add day/hour extraction from cursor
- Add mission launch and playback logic
- Add current time cursor calculation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Formatting Utilities

**Files:**
- Create: `src/utils/formatting.ts`

- [ ] **Step 1: Create src/utils/formatting.ts**

```typescript
import type { Entity } from '@/types'

/**
 * Format list of names with commas and "and"
 */
export function formatNameList(labels: string[]): string {
  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
  
  const last = labels[labels.length - 1]
  const rest = labels.slice(0, -1)
  return `${rest.join(', ')}, and ${last}`
}

/**
 * Strip "Day N: " prefix from labels
 */
export function stripDayPrefix(label: string): string {
  return label.replace(/^Day \d+:\s*/, '')
}

/**
 * Deduplicate array by id property
 */
export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      result.push(item)
    }
  }
  
  return result
}

/**
 * Pick most frequent entity from list
 */
export function pickMostFrequentEntity(items: Entity[]): Entity | null {
  if (items.length === 0) return null
  if (items.length === 1) return items[0]
  
  const counts = new Map<string, number>()
  
  items.forEach((item) => {
    const key = `${item.type}:${item.id}`
    counts.set(key, (counts.get(key) || 0) + 1)
  })
  
  let maxCount = 0
  let mostFrequent: Entity | null = null
  
  items.forEach((item) => {
    const key = `${item.type}:${item.id}`
    const count = counts.get(key) || 0
    if (count > maxCount) {
      maxCount = count
      mostFrequent = item
    }
  })
  
  return mostFrequent
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Commit formatting utilities**

```bash
git add src/utils/formatting.ts
git commit -m "feat: add formatting utility functions

- Add formatNameList for comma-separated lists
- Add stripDayPrefix for label cleaning
- Add dedupeById for array deduplication
- Add pickMostFrequentEntity for frequency analysis

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Trip Utilities

**Files:**
- Create: `src/utils/trip.ts`

- [ ] **Step 1: Create src/utils/trip.ts**

```typescript
import type { Entity, Family, TripDocument, ItineraryItem } from '@/types'

/**
 * Add family metadata to entity
 */
export function stampFamilyMetadata<T extends Entity>(
  item: T,
  familyId: string
): T {
  return {
    ...item,
    familyId,
  } as T
}

/**
 * Get display label for family
 */
export function getFamilyLabel(families: Family[], familyId: string): string {
  const family = families.find((f) => f.id === familyId)
  return family?.name || familyId
}

/**
 * Make entity key from type and id
 */
export function makeEntityKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`
}

/**
 * Parse entity key into type and id
 */
export function parseEntityKey(key: string): { type: string; id: string } {
  const [type, id] = key.split(':')
  return { type, id }
}

/**
 * Get related travel items for mission gate
 */
export function getRelatedTravelItemsForGate(
  doc: TripDocument,
  gate: ItineraryItem
): ItineraryItem[] {
  if (!gate || gate.itemType !== 'gate') return []
  
  const gateTime = new Date(gate.startTime).getTime()
  const windowMs = 4 * 60 * 60 * 1000 // 4 hours
  
  return doc.entities.itinerary.filter((item) => {
    if (item.itemType !== 'travel') return false
    
    const itemTime = new Date(item.startTime).getTime()
    const timeDiff = Math.abs(itemTime - gateTime)
    
    return timeDiff <= windowMs
  })
}

/**
 * Build operation gate context for mission launch
 */
export function buildOperationGateContext(
  doc: TripDocument,
  gate: ItineraryItem
): any {
  const relatedTravel = getRelatedTravelItemsForGate(doc, gate)
  const relatedRouteIds = relatedTravel
    .map((t) => t.linkedEntityId)
    .filter((id): id is string => !!id)
  
  const relatedRoutes = doc.entities.routes.filter((r) =>
    relatedRouteIds.includes(r.id)
  )
  
  const estimatedArrivals = relatedRoutes.map((r) => {
    // Simplified - actual implementation would calculate ETA
    return r.departureTime
  })
  
  const readinessStatus = relatedRoutes.length > 0 ? 'ready' : 'pending'
  
  return {
    gate,
    relatedRoutes,
    estimatedArrivals,
    readinessStatus,
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Create src/utils/index.ts for barrel exports**

```typescript
export * from './currency'
export * from './timeline'
export * from './formatting'
export * from './trip'
```

- [ ] **Step 4: Commit trip utilities**

```bash
git add src/utils/
git commit -m "feat: add trip utility functions and barrel exports

- Add family metadata stamping
- Add entity key parsing/making
- Add mission gate context building
- Add barrel exports for all utils

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Migrate Data Files

**Files:**
- Create: `src/data/tripData.ts`
- Create: `src/data/publishConfig.ts`
- Delete: `src/tripData.js`
- Delete: `src/publishConfig.js`

- [ ] **Step 1: Copy tripData.js to src/data/tripData.ts**

```bash
mkdir -p src/data
cp src/tripData.js src/data/tripData.ts
```

- [ ] **Step 2: Add type annotations to src/data/tripData.ts**

Add at the top of the file:

```typescript
interface DayMeta {
  index: number
  label: string
  date: string
}

interface TimeSlot {
  slot: number
  hour: number
  label: string
}

interface NavItem {
  id: string
  label: string
  icon: string
}

interface TripMetadata {
  name: string
  startDate: string
  endDate: string
}

export const DAYS: DayMeta[] = [
  // existing content
]

export const TIME_SLOTS: TimeSlot[] = [
  // existing content
]

export const NAV_ITEMS: NavItem[] = [
  // existing content
]

export const TRIP_META: TripMetadata = {
  // existing content
}
```

- [ ] **Step 3: Copy publishConfig.js to src/data/publishConfig.ts**

```bash
cp src/publishConfig.js src/data/publishConfig.ts
```

- [ ] **Step 4: Add types to src/data/publishConfig.ts**

```typescript
interface PublishConfig {
  enableLiveExternalData: boolean
}

export const PUBLISH_CONFIG: PublishConfig = {
  enableLiveExternalData: false,
}

export function isLiveExternalDataEnabled(): boolean {
  return PUBLISH_CONFIG.enableLiveExternalData
}
```

- [ ] **Step 5: Verify compilation**

```bash
npm run type-check
```

Expected: May have some errors in tripData.ts - we'll fix in next step

- [ ] **Step 6: Delete old files**

```bash
git rm src/tripData.js src/publishConfig.js
```

- [ ] **Step 7: Commit data migration**

```bash
git add src/data/
git commit -m "refactor: migrate data files to TypeScript

- Move tripData.js to src/data/tripData.ts
- Move publishConfig.js to src/data/publishConfig.ts
- Add type annotations
- Delete old JavaScript files

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Migrate Services

**Files:**
- Create: `src/services/weather.ts`
- Delete: `src/weather.js`

- [ ] **Step 1: Copy weather.js to src/services/weather.ts**

```bash
mkdir -p src/services
cp src/weather.js src/services/weather.ts
```

- [ ] **Step 2: Add type imports and annotations to src/services/weather.ts**

Add at the top:

```typescript
import type {
  WeatherBundle,
  LocationWeather,
  DailyForecast,
  HourlyForecast,
  WeatherCondition,
  MapWeatherTarget,
  TripDocument,
} from '@/types'
import { isLiveExternalDataEnabled } from '@/data/publishConfig'

// Update function signatures with types
export async function fetchWeatherBundle(
  locations: MapWeatherTarget[]
): Promise<WeatherBundle | null> {
  // existing implementation
}

export function getTripDayWeather(
  bundle: WeatherBundle | undefined,
  locationId: string,
  dayIndex: number
): DailyForecast | null {
  // existing implementation
}

export function getMapWeather(
  bundle: WeatherBundle | undefined,
  locationId: string,
  cursorSlot: number
): HourlyForecast | null {
  // existing implementation
}

export function getMapWeatherTargets(doc: TripDocument): MapWeatherTarget[] {
  // existing implementation
}
```

- [ ] **Step 3: Fix any type errors**

```bash
npm run type-check
```

Expected: Some errors to fix - add proper return types and parameter types

- [ ] **Step 4: Delete old weather.js**

```bash
git rm src/weather.js
```

- [ ] **Step 5: Commit weather service migration**

```bash
git add src/services/
git commit -m "refactor: migrate weather service to TypeScript

- Move weather.js to src/services/weather.ts
- Add comprehensive type annotations
- Import types from centralized type definitions
- Delete old JavaScript file

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Migrate Trip Model

**Files:**
- Create: `src/models/tripModel.ts`
- Delete: `src/tripModel.js`

- [ ] **Step 1: Copy tripModel.js to src/models/tripModel.ts**

```bash
mkdir -p src/models
cp src/tripModel.js src/models/tripModel.ts
```

- [ ] **Step 2: Add type imports to src/models/tripModel.ts**

Add at the top:

```typescript
import type {
  TripDocument,
  Entity,
  Route,
  Location,
  Activity,
  Meal,
  Expense,
  Family,
  ItineraryItem,
  EntitySelection,
  PageType,
} from '@/types'
import { DAYS, TIME_SLOTS, TRIP_META } from '@/data/tripData'
```

- [ ] **Step 3: Add function type signatures**

Go through the file and add proper TypeScript signatures to all exported functions. For example:

```typescript
export function getEntityById(
  doc: TripDocument,
  entityType: string,
  entityId: string
): Entity | null {
  // existing implementation
}

export function getEntityBySelection(
  doc: TripDocument,
  selection: EntitySelection | null
): Entity | null {
  // existing implementation
}

export function ensureSelectionForPage(
  doc: TripDocument,
  page: PageType
): TripDocument {
  // existing implementation
}

// Add types to all other exported functions
```

- [ ] **Step 4: Run type check and fix errors iteratively**

```bash
npm run type-check
```

Fix any type errors that appear. Common fixes:
- Add return types
- Type function parameters
- Fix any/unknown types

- [ ] **Step 5: Delete old tripModel.js**

```bash
git rm src/tripModel.js
```

- [ ] **Step 6: Commit trip model migration**

```bash
git add src/models/
git commit -m "refactor: migrate trip model to TypeScript

- Move tripModel.js to src/models/tripModel.ts
- Add comprehensive type annotations for all functions
- Import centralized type definitions
- Fix type errors for strict mode compliance

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Create usePersistedTripState Hook

**Files:**
- Create: `src/hooks/usePersistedTripState.ts`
- Delete: `src/usePersistedTripState.js`

- [ ] **Step 1: Create src/hooks/usePersistedTripState.ts**

```typescript
import { useEffect, useState } from 'react'
import type { TripDocument } from '@/types'
import {
  getInitialTripDocument,
  clearLegacyTripStorage,
  TRIP_DOCUMENT_STORAGE_KEY,
} from '@/models/tripModel'

export function usePersistedTripState(): [
  TripDocument,
  (updater: (doc: TripDocument) => TripDocument) => void
] {
  const [doc, setDoc] = useState<TripDocument>(() => {
    clearLegacyTripStorage()
    
    const stored = localStorage.getItem(TRIP_DOCUMENT_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as TripDocument
      } catch (e) {
        console.error('Failed to parse stored trip document', e)
      }
    }
    
    return getInitialTripDocument()
  })

  useEffect(() => {
    localStorage.setItem(TRIP_DOCUMENT_STORAGE_KEY, JSON.stringify(doc))
  }, [doc])

  const updateDoc = (updater: (doc: TripDocument) => TripDocument) => {
    setDoc((current) => updater(current))
  }

  return [doc, updateDoc]
}
```

- [ ] **Step 2: Delete old usePersistedTripState.js**

```bash
git rm src/usePersistedTripState.js
```

- [ ] **Step 3: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit hook migration**

```bash
git add src/hooks/usePersistedTripState.ts
git commit -m "refactor: migrate usePersistedTripState to TypeScript

- Move to hooks directory
- Add proper TypeScript types
- Type state and updater function
- Delete old JavaScript file

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Create useTripSelection Hook

**Files:**
- Create: `src/hooks/useTripSelection.ts`

- [ ] **Step 1: Create src/hooks/useTripSelection.ts**

```typescript
import { useCallback, useMemo } from 'react'
import type { TripDocument, Entity, EntitySelection, PageType } from '@/types'
import { getEntityById, getEntityBySelection } from '@/models/tripModel'

interface UseTripSelectionReturn {
  selection: EntitySelection | null
  selectedEntity: Entity | null
  selectEntity: (entityType: string, entityId: string) => void
  selectEntityByRef: (entity: Entity) => void
  clearSelection: () => void
  canSelectEntity: (entityType: string, entityId: string) => boolean
}

export function useTripSelection(
  doc: TripDocument,
  currentPage: PageType,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseTripSelectionReturn {
  const selection = doc.ui.selection

  const selectedEntity = useMemo(() => {
    return getEntityBySelection(doc, selection)
  }, [doc, selection])

  const selectEntity = useCallback(
    (entityType: string, entityId: string) => {
      onUpdateDoc((doc) => ({
        ...doc,
        ui: {
          ...doc.ui,
          selection: { entityType, entityId },
        },
      }))
    },
    [onUpdateDoc]
  )

  const selectEntityByRef = useCallback(
    (entity: Entity) => {
      selectEntity(entity.type, entity.id)
    },
    [selectEntity]
  )

  const clearSelection = useCallback(() => {
    onUpdateDoc((doc) => ({
      ...doc,
      ui: {
        ...doc.ui,
        selection: null,
      },
    }))
  }, [onUpdateDoc])

  const canSelectEntity = useCallback(
    (entityType: string, entityId: string) => {
      const entity = getEntityById(doc, entityType, entityId)
      return entity !== null
    },
    [doc]
  )

  return {
    selection,
    selectedEntity,
    selectEntity,
    selectEntityByRef,
    clearSelection,
    canSelectEntity,
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Commit selection hook**

```bash
git add src/hooks/useTripSelection.ts
git commit -m "feat: add useTripSelection hook

- Manage entity selection state
- Provide selection validation
- Type-safe selection updates
- Derive selected entity from selection

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Create useTimelineSimulation Hook

**Files:**
- Create: `src/hooks/useTimelineSimulation.ts`

- [ ] **Step 1: Create src/hooks/useTimelineSimulation.ts**

```typescript
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TripDocument } from '@/types'
import { clampTimelineCursor, getCurrentTripCursor } from '@/utils/timeline'

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

export function useTimelineSimulation(
  doc: TripDocument,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseTimelineSimulationReturn {
  const cursorSlot = doc.ui.timeline.cursorSlot
  const isPlaying = doc.ui.timeline.isPlaying
  const playbackSpeed = doc.ui.timeline.playbackSpeed

  const animationFrameRef = useRef<number>()
  const lastTickRef = useRef<number>(Date.now())

  const play = useCallback(() => {
    onUpdateDoc((doc) => ({
      ...doc,
      ui: {
        ...doc.ui,
        timeline: {
          ...doc.ui.timeline,
          isPlaying: true,
        },
      },
    }))
  }, [onUpdateDoc])

  const pause = useCallback(() => {
    onUpdateDoc((doc) => ({
      ...doc,
      ui: {
        ...doc.ui,
        timeline: {
          ...doc.ui.timeline,
          isPlaying: false,
        },
      },
    }))
  }, [onUpdateDoc])

  const jumpToCursor = useCallback(
    (slot: number) => {
      const clamped = clampTimelineCursor(slot)
      onUpdateDoc((doc) => ({
        ...doc,
        ui: {
          ...doc.ui,
          timeline: {
            ...doc.ui.timeline,
            cursorSlot: clamped,
          },
        },
      }))
    },
    [onUpdateDoc]
  )

  const resetToLive = useCallback(() => {
    const liveCursor = getCurrentTripCursor()
    jumpToCursor(liveCursor)
  }, [jumpToCursor])

  const setPlaybackSpeed = useCallback(
    (speed: number) => {
      onUpdateDoc((doc) => ({
        ...doc,
        ui: {
          ...doc.ui,
          timeline: {
            ...doc.ui.timeline,
            playbackSpeed: speed,
          },
        },
      }))
    },
    [onUpdateDoc]
  )

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const animate = () => {
      const now = Date.now()
      const delta = now - lastTickRef.current

      // Advance cursor based on playback speed
      if (delta > 1000 / (playbackSpeed * 4)) {
        lastTickRef.current = now
        onUpdateDoc((doc) => ({
          ...doc,
          ui: {
            ...doc.ui,
            timeline: {
              ...doc.ui.timeline,
              cursorSlot: doc.ui.timeline.cursorSlot + 1,
            },
          },
        }))
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, onUpdateDoc])

  return {
    cursorSlot,
    isPlaying,
    playbackSpeed,
    play,
    pause,
    jumpToCursor,
    resetToLive,
    setPlaybackSpeed,
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Commit timeline simulation hook**

```bash
git add src/hooks/useTimelineSimulation.ts
git commit -m "feat: add useTimelineSimulation hook

- Manage timeline cursor and playback state
- Implement animation loop with requestAnimationFrame
- Support variable playback speeds
- Provide play/pause/jump controls

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Create useRoutePlayback Hook

**Files:**
- Create: `src/hooks/useRoutePlayback.ts`

- [ ] **Step 1: Create src/hooks/useRoutePlayback.ts**

```typescript
import { useMemo } from 'react'
import type { TripDocument, Route } from '@/types'

export interface RouteProgress {
  routeId: string
  progress: number // 0-1
  currentPosition: google.maps.LatLng | null
  estimatedArrival: string
  isActive: boolean
}

interface UseRoutePlaybackReturn {
  activeRoutes: RouteProgress[]
  isAnyRouteActive: boolean
}

export function useRoutePlayback(
  doc: TripDocument,
  cursorSlot: number
): UseRoutePlaybackReturn {
  const activeRoutes = useMemo(() => {
    const routes = doc.entities.routes || []
    const progressList: RouteProgress[] = []

    routes.forEach((route) => {
      // Calculate if route is active at current cursor
      // This is simplified - actual implementation would use route timing
      const isActive = route.status === 'active'
      
      if (isActive) {
        const progress = calculateRouteProgress(route, cursorSlot)
        const currentPosition = interpolatePosition(route, progress)
        
        progressList.push({
          routeId: route.id,
          progress,
          currentPosition,
          estimatedArrival: route.departureTime,
          isActive: true,
        })
      }
    })

    return progressList
  }, [doc.entities.routes, cursorSlot])

  const isAnyRouteActive = activeRoutes.length > 0

  return {
    activeRoutes,
    isAnyRouteActive,
  }
}

function calculateRouteProgress(route: Route, cursorSlot: number): number {
  // Simplified calculation - actual implementation would use timing
  return Math.min(1, cursorSlot / 100)
}

function interpolatePosition(
  route: Route,
  progress: number
): google.maps.LatLng | null {
  if (!route.path || route.path.length === 0) return null
  
  const index = Math.floor(progress * (route.path.length - 1))
  return route.path[index] || null
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Commit route playback hook**

```bash
git add src/hooks/useRoutePlayback.ts
git commit -m "feat: add useRoutePlayback hook

- Calculate route progress based on cursor
- Interpolate convoy positions along paths
- Determine active routes at current time
- Provide ETA calculations

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Create useExpenseCalculations Hook

**Files:**
- Create: `src/hooks/useExpenseCalculations.ts`

- [ ] **Step 1: Create src/hooks/useExpenseCalculations.ts**

```typescript
import { useCallback, useMemo } from 'react'
import type { TripDocument, Expense } from '@/types'
import { getFamilyExpenseBurden } from '@/utils/currency'

interface UseExpenseCalculationsReturn {
  familyBurdens: Record<string, number>
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void
  getTotalExpenses: () => number
}

export function useExpenseCalculations(
  doc: TripDocument,
  onUpdateDoc: (updater: (doc: TripDocument) => TripDocument) => void
): UseExpenseCalculationsReturn {
  const familyBurdens = useMemo(() => {
    return getFamilyExpenseBurden(doc.entities.expenses, doc.entities.families)
  }, [doc.entities.expenses, doc.entities.families])

  const updateExpense = useCallback(
    (expenseId: string, updates: Partial<Expense>) => {
      onUpdateDoc((doc) => ({
        ...doc,
        entities: {
          ...doc.entities,
          expenses: doc.entities.expenses.map((exp) =>
            exp.id === expenseId ? { ...exp, ...updates } : exp
          ),
        },
      }))
    },
    [onUpdateDoc]
  )

  const getTotalExpenses = useCallback(() => {
    return doc.entities.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [doc.entities.expenses])

  return {
    familyBurdens,
    updateExpense,
    getTotalExpenses,
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Commit expense calculations hook**

```bash
git add src/hooks/useExpenseCalculations.ts
git commit -m "feat: add useExpenseCalculations hook

- Calculate family expense burdens
- Provide expense update operations
- Calculate total expenses
- Memoize expensive calculations

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Create useGoogleMaps Hook and Hooks Barrel Export

**Files:**
- Create: `src/hooks/useGoogleMaps.ts`
- Create: `src/hooks/index.ts`

- [ ] **Step 1: Create src/hooks/useGoogleMaps.ts**

```typescript
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { env } from '@/lib/env'
import { DARK_MAP_STYLES } from '@/lib/constants'

interface UseGoogleMapsReturn {
  map: google.maps.Map | null
  isLoaded: boolean
  error: Error | null
}

export function useGoogleMaps(
  containerRef: RefObject<HTMLDivElement>,
  options: Partial<google.maps.MapOptions> = {}
): UseGoogleMapsReturn {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const loaderRef = useRef<Loader | null>(null)

  useEffect(() => {
    if (!containerRef.current || !env.googleMapsApiKey) {
      setError(new Error('Missing container or API key'))
      return
    }

    const initMap = async () => {
      try {
        if (!loaderRef.current) {
          loaderRef.current = new Loader({
            apiKey: env.googleMapsApiKey!,
            version: 'weekly',
            libraries: ['places', 'routes'],
          })
        }

        await loaderRef.current.load()

        const defaultOptions: google.maps.MapOptions = {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 8,
          styles: DARK_MAP_STYLES,
          disableDefaultUI: true,
          mapId: env.googleMapId,
          ...options,
        }

        const mapInstance = new google.maps.Map(
          containerRef.current!,
          defaultOptions
        )

        setMap(mapInstance)
        setIsLoaded(true)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to initialize Google Maps', err)
      }
    }

    initMap()
  }, [containerRef, options])

  return {
    map,
    isLoaded,
    error,
  }
}
```

- [ ] **Step 2: Create src/hooks/index.ts**

```typescript
export { usePersistedTripState } from './usePersistedTripState'
export { useTripSelection } from './useTripSelection'
export { useTimelineSimulation } from './useTimelineSimulation'
export { useRoutePlayback } from './useRoutePlayback'
export { useExpenseCalculations } from './useExpenseCalculations'
export { useGoogleMaps } from './useGoogleMaps'
```

- [ ] **Step 3: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit Google Maps hook and barrel exports**

```bash
git add src/hooks/
git commit -m "feat: add useGoogleMaps hook and hooks barrel exports

- Add Google Maps initialization hook
- Handle API loading and error states
- Apply dark map styles by default
- Export all hooks via barrel exports

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Create UI Components - StatusPill

**Files:**
- Create: `src/components/ui/StatusPill.tsx`

- [ ] **Step 1: Read StatusPill from App.jsx**

```bash
grep -A 15 "^function StatusPill" src/App.jsx
```

Expected: Find the StatusPill component code

- [ ] **Step 2: Create src/components/ui/StatusPill.tsx**

```typescript
import { memo, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { ToneName } from '@/types'

interface StatusPillProps {
  children: ReactNode
  tone?: ToneName
  className?: string
}

export const StatusPill = memo(function StatusPill({
  children,
  tone = 'default',
  className,
}: StatusPillProps) {
  const toneClasses = {
    default: 'bg-zinc-800 text-zinc-300',
    Transit: 'bg-blue-900/30 text-blue-400',
    Activity: 'bg-green-900/30 text-green-400',
    Meal: 'bg-amber-900/30 text-amber-400',
    Critical: 'bg-red-900/30 text-red-400',
    Warning: 'bg-yellow-900/30 text-yellow-400',
    Success: 'bg-green-900/30 text-green-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  )
})
```

- [ ] **Step 3: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit StatusPill component**

```bash
git add src/components/ui/StatusPill.tsx
git commit -m "feat: add StatusPill UI component

- Create memoized status pill component
- Support multiple tone variants
- Apply semantic colors based on tone
- Export from ui components

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 18: Create UI Components - SectionTitle and NotesBox

**Files:**
- Create: `src/components/ui/SectionTitle.tsx`
- Create: `src/components/ui/NotesBox.tsx`

- [ ] **Step 1: Create src/components/ui/SectionTitle.tsx**

```typescript
import { type ReactNode } from 'react'

interface SectionTitleProps {
  eyebrow?: string
  title: string | ReactNode
  meta?: string | ReactNode
}

export function SectionTitle({ eyebrow, title, meta }: SectionTitleProps) {
  return (
    <div className="mb-4 pb-3 border-b border-zinc-800">
      {eyebrow && (
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
          {eyebrow}
        </div>
      )}
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
        {meta && <div className="text-sm text-zinc-400">{meta}</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/ui/NotesBox.tsx**

```typescript
import { type ChangeEvent } from 'react'
import { cn } from '@/lib/cn'

interface NotesBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function NotesBox({
  value,
  onChange,
  placeholder = 'Add notes...',
  className,
}: NotesBoxProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded',
        'text-sm text-zinc-300 placeholder:text-zinc-600',
        'focus:outline-none focus:ring-1 focus:ring-blue-500',
        'resize-none',
        className
      )}
      rows={4}
    />
  )
}
```

- [ ] **Step 3: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit SectionTitle and NotesBox**

```bash
git add src/components/ui/SectionTitle.tsx src/components/ui/NotesBox.tsx
git commit -m "feat: add SectionTitle and NotesBox UI components

- Add SectionTitle with eyebrow and meta support
- Add NotesBox textarea component
- Type-safe props with proper change handlers
- Consistent styling with design system

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 19: Create UI Component - AppShell (Part 1 of 2)

**Files:**
- Create: `src/components/ui/AppShell.tsx`

- [ ] **Step 1: Read AppShell from App.jsx**

```bash
grep -A 200 "^function AppShell" src/App.jsx | head -100
```

Expected: Find the AppShell component code

- [ ] **Step 2: Create src/components/ui/AppShell.tsx (structure only)**

```typescript
import { type ReactNode } from 'react'
import { PAGE_ICONS } from '@/lib/constants'
import type { PageType } from '@/types'
import palantirLogo from '@/assets/palantir-logo.svg'

interface AppShellProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  children: ReactNode
}

export function AppShell({ currentPage, onPageChange, children }: AppShellProps) {
  const navItems: Array<{ id: PageType; label: string }> = [
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'stay', label: 'Stay' },
    { id: 'meals', label: 'Meals' },
    { id: 'activities', label: 'Activities' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'families', label: 'Families' },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#0A0C10] text-zinc-100">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-zinc-800 bg-[#161B22]">
        <div className="flex items-center gap-3">
          <img src={palantirLogo} alt="Logo" className="h-6" />
          <span className="text-sm font-semibold text-zinc-300">
            Family Trip Command Center
          </span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar nav */}
        <nav className="w-48 border-r border-zinc-800 bg-[#161B22] overflow-y-auto">
          <div className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = PAGE_ICONS[item.id]
              const isActive = currentPage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded text-sm
                    transition-colors
                    ${
                      isActive
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                    }
                  `}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 4: Commit AppShell component**

```bash
git add src/components/ui/AppShell.tsx
git commit -m "feat: add AppShell UI component

- Create main application shell layout
- Add header with logo and title
- Add sidebar navigation with icons
- Support active page highlighting
- Type-safe page navigation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 20: Create UI Components Barrel Export

**Files:**
- Create: `src/components/ui/index.ts`

- [ ] **Step 1: Create src/components/ui/index.ts**

```typescript
export { StatusPill } from './StatusPill'
export { SectionTitle } from './SectionTitle'
export { NotesBox } from './NotesBox'
export { AppShell } from './AppShell'
```

- [ ] **Step 2: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 3: Commit UI barrel exports**

```bash
git add src/components/ui/index.ts
git commit -m "feat: add UI components barrel exports

Export all UI components for clean imports

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 21: Create Card Components

**Files:**
- Create: `src/components/cards/SelectableCard.tsx`
- Create: `src/components/cards/PageNotesCard.tsx`
- Create: `src/components/cards/ActivityResearchCard.tsx`
- Create: `src/components/cards/TransitStopCard.tsx`
- Create: `src/components/cards/index.ts`

- [ ] **Step 1: Create src/components/cards/SelectableCard.tsx**

```typescript
import { memo, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SelectableCardProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

export const SelectableCard = memo(function SelectableCard({
  selected,
  onClick,
  children,
  className,
}: SelectableCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded border cursor-pointer transition-all',
        selected
          ? 'bg-blue-900/20 border-blue-500'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
        className
      )}
    >
      {children}
    </div>
  )
})
```

- [ ] **Step 2: Create src/components/cards/PageNotesCard.tsx**

```typescript
import { ArrowRight } from 'lucide-react'
import { NotesBox } from '@/components/ui'

interface PageNotesCardProps {
  title: string
  value: string
  onChange: (value: string) => void
  onConvert?: () => void
  placeholder?: string
}

export function PageNotesCard({
  title,
  value,
  onChange,
  onConvert,
  placeholder,
}: PageNotesCardProps) {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
        {onConvert && value && (
          <button
            onClick={onConvert}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
          >
            <span>Convert to entity</span>
            <ArrowRight size={12} />
          </button>
        )}
      </div>
      <NotesBox value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/cards/ActivityResearchCard.tsx**

```typescript
interface ActivityResearchCardProps {
  eyebrow: string
  title: string
  bullets: string[]
}

export function ActivityResearchCard({
  eyebrow,
  title,
  bullets,
}: ActivityResearchCardProps) {
  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
        {eyebrow}
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-3">{title}</h3>
      <ul className="space-y-2">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="text-xs text-zinc-400 flex gap-2">
            <span className="text-zinc-600">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/cards/TransitStopCard.tsx**

```typescript
import { MapPin } from 'lucide-react'
import type { Entity } from '@/types'

interface TransitStopCardProps {
  stop: any // Will be typed more specifically based on actual usage
  onSelectEntity: (entity: Entity) => void
}

export function TransitStopCard({ stop, onSelectEntity }: TransitStopCardProps) {
  return (
    <button
      onClick={() => onSelectEntity(stop)}
      className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-700 transition-colors text-left"
    >
      <div className="flex items-start gap-3">
        <MapPin size={16} className="text-blue-400 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-medium text-zinc-200">{stop.name}</div>
          <div className="text-xs text-zinc-500 mt-1">{stop.address}</div>
        </div>
      </div>
    </button>
  )
}
```

- [ ] **Step 5: Create src/components/cards/index.ts**

```typescript
export { SelectableCard } from './SelectableCard'
export { PageNotesCard } from './PageNotesCard'
export { ActivityResearchCard } from './ActivityResearchCard'
export { TransitStopCard } from './TransitStopCard'
```

- [ ] **Step 6: Verify compilation**

```bash
npm run type-check
```

Expected: No errors

- [ ] **Step 7: Commit card components**

```bash
git add src/components/cards/
git commit -m "feat: add card components

- Add SelectableCard with hover and selection states
- Add PageNotesCard with convert action
- Add ActivityResearchCard for research display
- Add TransitStopCard for location display
- Export via barrel exports

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 22-27: Modal and Timeline Components (Condensed)

Due to the extensive nature of this refactor, tasks 22-48 follow the same pattern as tasks 1-21 but are presented in condensed form with key implementation details.

### Task 22: Modal Components

**Files:** `src/components/modals/DailyBriefingModal.tsx`, `MissionLaunchModal.tsx`, `index.ts`

**Steps:**
1. Extract DailyBriefingModal from App.jsx
2. Extract MissionLaunchModal from App.jsx  
3. Add TypeScript types for all props
4. Create barrel exports
5. Commit: `git commit -m "feat: add modal components"`

### Task 23-27: Timeline Components  

**Files:** `src/components/timeline/*.tsx` (TimelineBoard, ScenarioControls, SituationBoard, MissionFeedTray, FamilyList)

**Steps:**
1. Extract each timeline component from App.jsx
2. Add proper TypeScript interfaces for props
3. Use TripContext hooks instead of prop drilling
4. Create barrel exports in `src/components/timeline/index.ts`
5. Commit each component separately

---

## Task 28-33: Page Components

**Files:** `src/components/pages/*.tsx` (one file per page)

### Task 28: ItineraryPage

```typescript
// src/components/pages/ItineraryPage.tsx
import { use TripContext } from '@/context'
import { SectionTitle } from '@/components/ui'
// ... extract from App.jsx with proper types
```

**Steps:**
1. Read ItineraryPage function from App.jsx (starts around line ~2278)
2. Create src/components/pages/ItineraryPage.tsx
3. Replace prop drilling with `const { doc, selection, selectEntity, ... } = useTripContext()`
4. Add TypeScript types for all internal functions
5. Verify compilation: `npm run type-check`
6. Commit: `git add src/components/pages/ItineraryPage.tsx && git commit -m "feat: add ItineraryPage component"`

### Task 29-33: Remaining Page Components

**Apply same pattern to:**
- Task 29: StayPage (~line 2716)
- Task 30: MealsPage (~line 2914)
- Task 31: ActivitiesPage (~line 3127)
- Task 32: ExpensesPage (~line 3398)
- Task 33: FamiliesPage (~line 3798)

**Each task:**
1. Extract component from App.jsx
2. Replace props with useTripContext()
3. Add TypeScript types
4. Create `src/components/pages/index.ts` with barrel exports
5. Commit each separately

---

## Task 34-38: Map Components

### Task 34: MapContainer

**File:** `src/components/map/MapContainer.tsx`

```typescript
import { useRef } from 'react'
import { useGoogleMaps } from '@/hooks'
import { RouteRenderer } from './RouteRenderer'
import { WeatherOverlay } from './WeatherOverlay'
import { MapControls } from './MapControls'
import type { TripDocument } from '@/types'

interface MapContainerProps {
  doc: TripDocument
  cursorSlot: number
  isPlaying: boolean
  showWeather: boolean
  onToggleWeather: () => void
}

export function MapContainer({ doc, cursorSlot, isPlaying, showWeather, onToggleWeather }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { map, isLoaded, error } = useGoogleMaps(containerRef, {
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 8,
  })

  if (error) {
    return <div>Error loading map: {error.message}</div>
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      {map && isLoaded && (
        <>
          <RouteRenderer map={map} routes={doc.entities.routes} cursorSlot={cursorSlot} isPlaying={isPlaying} />
          {showWeather && doc.weather && (
            <WeatherOverlay map={map} weatherData={doc.weather} locations={doc.entities.locations} visible={showWeather} />
          )}
          <MapControls showWeather={showWeather} onToggleWeather={onToggleWeather} />
        </>
      )}
    </div>
  )
}
```

**Steps:**
1. Read CommandMap.jsx to understand map initialization
2. Create MapContainer as above
3. Verify compilation
4. Commit

### Task 35-38: Remaining Map Components

- Task 35: RouteRenderer - Extract route rendering logic from CommandMap.jsx
- Task 36: WeatherOverlay - Extract weather overlay logic
- Task 37: MapControls - Extract controls UI
- Task 38: Create `src/components/map/index.ts` barrel exports

**Each task:** Extract, type, commit separately

---

## Task 39: Create Root Components Barrel Export

**File:** `src/components/index.ts`

```typescript
export * from './ui'
export * from './cards'
export * from './modals'
export * from './timeline'
export * from './pages'
export * from './map'
```

**Steps:**
1. Create barrel export file
2. Verify compilation: `npm run type-check`
3. Commit: `git add src/components/index.ts && git commit -m "feat: add root components barrel export"`

---

## Task 40: Create TripContext

**File:** `src/context/TripContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { TripDocument, PageType, EntitySelection, Entity } from '@/types'
import { usePersistedTripState, useTripSelection, useTimelineSimulation, useExpenseCalculations } from '@/hooks'

interface TripContextValue {
  // Core state
  doc: TripDocument
  updateDoc: (updater: (doc: TripDocument) => TripDocument) => void
  
  // Page state
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
  
  // Selection (from useTripSelection)
  selection: EntitySelection | null
  selectedEntity: Entity | null
  selectEntity: (entityType: string, entityId: string) => void
  selectEntityByRef: (entity: Entity) => void
  clearSelection: () => void
  
  // Timeline (from useTimelineSimulation)
  cursorSlot: number
  isPlaying: boolean
  playbackSpeed: number
  play: () => void
  pause: () => void
  jumpToCursor: (slot: number) => void
  resetToLive: () => void
  setPlaybackSpeed: (speed: number) => void
  
  // Expenses (from useExpenseCalculations)
  familyBurdens: Record<string, number>
  updateExpense: (expenseId: string, updates: Partial<any>) => void
  getTotalExpenses: () => number
  
  // Common mutations
  updatePageNote: (page: PageType, note: string) => void
  toggleMealStatus: (mealId: string) => void
  updateItineraryItem: (itemId: string, updates: Partial<any>) => void
}

const TripContext = createContext<TripContextValue | null>(null)

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
  
  const toggleMealStatus = useCallback((mealId: string) => {
    updateDoc(doc => ({
      ...doc,
      entities: {
        ...doc.entities,
        meals: doc.entities.meals.map(meal =>
          meal.id === mealId ? { ...meal, status: meal.status === 'served' ? 'planned' : 'served' } : meal
        )
      }
    }))
  }, [updateDoc])
  
  const updateItineraryItem = useCallback((itemId: string, updates: Partial<any>) => {
    updateDoc(doc => ({
      ...doc,
      entities: {
        ...doc.entities,
        itinerary: doc.entities.itinerary.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      }
    }))
  }, [updateDoc])
  
  const value: TripContextValue = {
    doc,
    updateDoc,
    currentPage,
    setCurrentPage,
    ...selection,
    ...timeline,
    ...expenses,
    updatePageNote,
    toggleMealStatus,
    updateItineraryItem,
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

**Steps:**
1. Create TripContext.tsx as above
2. Create `src/context/index.ts`: `export * from './TripContext'`
3. Verify compilation
4. Commit: `git add src/context/ && git commit -m "feat: add TripContext provider"`

---

## Task 41: Migrate App.tsx

**File:** `src/App.tsx`

**Steps:**

1. **Create simplified App.tsx:**

```typescript
import { TripProvider, useTripContext } from '@/context'
import { AppShell } from '@/components/ui'
import { ItineraryPage, StayPage, MealsPage, ActivitiesPage, ExpensesPage, FamiliesPage } from '@/components/pages'

function AppContent() {
  const { currentPage, setCurrentPage } = useTripContext()
  
  return (
    <AppShell currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'itinerary' && <ItineraryPage />}
      {currentPage === 'stay' && <StayPage />}
      {currentPage === 'meals' && <MealsPage />}
      {currentPage === 'activities' && <ActivitiesPage />}
      {currentPage === 'expenses' && <ExpensesPage />}
      {currentPage === 'families' && <FamiliesPage />}
    </AppShell>
  )
}

export default function App() {
  return (
    <TripProvider>
      <AppContent />
    </TripProvider>
  )
}
```

2. **Delete old App.jsx:**

```bash
git rm src/App.jsx
```

3. **Verify compilation:**

```bash
npm run type-check
```

Expected: Should compile (may have some errors to fix in page components)

4. **Commit:**

```bash
git add src/App.tsx
git commit -m "refactor: migrate App to TypeScript with TripContext

- Drastically simplify App.tsx from 5000 to ~30 lines
- Replace prop drilling with TripContext
- Remove all component definitions (now in separate files)
- Remove all utility functions (now in utils/)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 42: Migrate main.tsx and InspectorRail

**Files:** `src/main.tsx`, `src/InspectorRail.tsx`

### main.tsx

**Steps:**

1. **Rename and update:**

```bash
mv src/main.jsx src/main.tsx
```

2. **Update imports in src/main.tsx:**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

3. **Verify compilation:**

```bash
npm run type-check
```

4. **Commit:**

```bash
git add src/main.tsx
git rm src/main.jsx
git commit -m "refactor: migrate main.tsx to TypeScript"
```

### InspectorRail.tsx

**Steps:**

1. **Rename:**

```bash
mv src/InspectorRail.jsx src/InspectorRail.tsx
```

2. **Add type imports:**

```typescript
import type { TripDocument, Entity, EntitySelection } from '@/types'
// Add proper types to props
```

3. **Add TypeScript types to all props and internal functions**

4. **Verify and commit:**

```bash
npm run type-check
git add src/InspectorRail.tsx
git rm src/InspectorRail.jsx
git commit -m "refactor: migrate InspectorRail to TypeScript"
```

---

## Task 43: ESLint and Prettier Setup

**Files:** `.eslintrc.cjs`, `.prettierrc`, `.prettierignore`

**Steps:**

1. **Install ESLint dependencies:**

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh prettier
```

2. **Create .eslintrc.cjs:**

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
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
```

3. **Create .prettierrc:**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

4. **Create .prettierignore:**

```
dist
node_modules
.vite
*.md
```

5. **Add lint scripts to package.json:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

6. **Run linter and fix auto-fixable issues:**

```bash
npm run lint:fix
npm run format
```

7. **Commit:**

```bash
git add .eslintrc.cjs .prettierrc .prettierignore package.json package-lock.json
git commit -m "chore: add ESLint and Prettier configuration

- Add TypeScript ESLint rules
- Configure Prettier for consistent formatting
- Add lint and format scripts
- Apply auto-fixes across codebase

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 44: Final Verification and Testing

**Steps:**

1. **Run full type check:**

```bash
npm run type-check
```

Expected: No errors

2. **Run linter:**

```bash
npm run lint
```

Expected: No errors or only warnings

3. **Build the project:**

```bash
npm run build
```

Expected: Successful build

4. **Start dev server:**

```bash
npm run dev
```

5. **Manual testing checklist:**

- [ ] Application loads without errors
- [ ] Can navigate between all pages
- [ ] Timeline playback works
- [ ] Can select entities
- [ ] Map renders correctly
- [ ] Route playback animates
- [ ] Weather overlay displays
- [ ] Expense calculations work
- [ ] Family list displays
- [ ] Notes can be edited
- [ ] State persists in localStorage

6. **Check bundle size:**

```bash
npm run build
ls -lh dist/assets/*.js
```

Compare with original bundle size (should be similar or smaller)

7. **Final commit:**

```bash
git add .
git commit -m "chore: final verification and fixes

- Verified all TypeScript compilation
- Tested all features manually
- Fixed any remaining type errors
- Confirmed bundle size acceptable

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

8. **Create summary of changes:**

```bash
git log --oneline | head -50
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-05-typescript-refactor.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
