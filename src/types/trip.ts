/// <reference types="google.maps" />

import type { PageType, EntitySelection } from './ui'

// Base entity interface
export interface BaseEntity {
  id: string
  type: string
}

// Route entity - matches runtime structure from tripModel.js
export interface Route extends BaseEntity {
  type: 'route'
  title: string
  dayId: string
  familyId: string
  tone: string
  originCoordinates: {
    lat: number
    lng: number
  }
  stopLocationIds?: string[]
  destinationLocationId?: string
  simulationStartSlot: number
  simulationEndSlot: number
  durationSeconds?: number
  simulationMilestones?: Array<{
    t: number
    progress: number
  }>
  path?: Array<{
    lat: number
    lng: number
  }>
  linkedEntityKey: string
  dashed?: boolean
}

// Location entity - matches runtime structure from buildLocations in tripModel.js
export interface Location extends BaseEntity {
  type: 'location'
  title: string
  category: 'stay' | 'meal' | 'logistics' | 'park'
  dayId: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  externalUrl?: string | null
  summary?: string
  parkingNote?: string | null
  accessNote?: string | null
  directionsNote?: string | null
  lockNote?: string | null
  checkIn?: string | null
  checkOut?: string | null
  wifiNetwork?: string | null
  wifiPassword?: string | null
  hostName?: string | null
  coHostName?: string | null
  guestSummary?: string | null
  confirmationCode?: string | null
  vehicleFee?: string | null
  manualUrl?: string | null
  photos?: Array<{
    id: string
    label: string
    imageUrl: string
    sourceUrl?: string | null
  }>
  linkedEntityKeys?: string[]
  stopType?: string
  placesQuery?: string
  reservationNote?: string
}

// Activity entity - matches runtime structure from buildActivities in tripModel.js
export interface Activity extends BaseEntity {
  type: 'activity'
  title: string
  dayId: string
  window: string
  status: 'Go' | 'Watch'
  riskLevel: string
  weatherSensitivity: string
  locationId?: string
  linkedEntityKeys?: string[]
  taskIds?: string[]
  description?: string
  backup?: string
  note?: string
}

// Meal entity - matches runtime structure from buildMeals in tripModel.js
export interface Meal extends BaseEntity {
  type: 'meal'
  title: string
  dayId: string
  startSlot: number
  status: 'Assigned' | 'Pending' | 'Confirmed'
  owner: string
  reservationType: string
  timeLabel: string
  locationId?: string
  linkedEntityKeys?: string[]
  taskIds?: string[]
  note?: string
}

// Expense entity - matches runtime structure from buildExpenses in tripModel.js
export interface Expense extends BaseEntity {
  type: 'expense'
  title: string
  payer: string
  amount: number
  split: string
  allocationMode: 'equal' | 'manual' | 'individual'
  allocations: Record<string, number>
  settled: boolean
  linkedEntityKeys?: string[]
  note?: string
}

// Family entity - matches runtime structure from buildFamilies in tripModel.js
export interface Family extends BaseEntity {
  type: 'family'
  title: string
  name: string
  shortOrigin: string
  origin: string
  originAddress: string
  originCoordinates: {
    lat: number
    lng: number
  }
  arrivalDayId: string
  eta: string
  driveTime: string
  headcount: string
  vehicle: string
  vehicleLabel: string
  responsibility: string
  readiness: number
  status: string
  routeSummary: string
  plannedStopIds: string[]
  taskIds: string[]
  linkedEntityKeys: string[]
  note: string
}

// Itinerary item entity - matches runtime structure from tripModel.js
export interface ItineraryItem extends BaseEntity {
  type: 'itineraryItem'
  title: string
  rowId: string
  dayId: string
  startSlot: number
  span: number
  color: string
  familyIds?: string[]
  routeId?: string
  locationId?: string
  status?: string
  riskLevel?: string
  taskIds?: string[]
  linkedEntityKeys?: string[]
}

// StayItem entity - matches runtime structure from buildStayItems in tripModel.js
export interface StayItem extends BaseEntity {
  type: 'stayItem'
  title: string
  dayId: string
  locationId: string
  category: string
  summary: string
  linkedEntityKeys?: string[]
  taskIds?: string[]
  note?: string
}

// Task entity - matches runtime structure from buildTasks in tripModel.js
export interface Task extends BaseEntity {
  type: 'task'
  title: string
  dayId: string
  status: 'done' | 'open' | 'blocked'
  ownerFamilyId: string | null
  linkedEntityKeys?: string[]
  note?: string
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
  | StayItem
  | Task

// NOTE: Unused placeholder type - actual runtime doesn't use a separate TripMeta object
// Kept for potential future use if we want to extract trip metadata
export interface TripMeta {
  tripName: string
  startDate: string
  endDate: string
  basecamp: Location
  timezone: string
}

// Main trip document - flat structure matching runtime createInitialTripDocument()
export interface TripDocument {
  selectedPage: PageType
  selection: EntitySelection | null
  pageNotes: Record<PageType, string>
  pageNoteMeta: Record<string, unknown>
  ui: {
    searchQuery: string
    timeline: {
      mode: 'scenario' | 'reality' | string
      cursorSlot: number
    }
    map: {
      showRoutes: boolean
      showFacilities: boolean
      showTraffic: boolean
      focusFamilyId: string
      focusDayId: string
    }
  }
  families: Family[]
  locations: Location[]
  routes: Route[]
  itineraryItems: ItineraryItem[]
  meals: Meal[]
  activities: Activity[]
  stayItems: StayItem[]
  expenses: Expense[]
  tasks: Task[]
}
