/// <reference types="google.maps" />

import type { PageType, EntitySelection } from './ui'

// Base entity interface
export interface BaseEntity {
  id: string
  type: string
}

// Route entity
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

// Location entity
export interface Location extends BaseEntity {
  type: 'location'
  title: string
  category: 'stay' | 'meal' | 'activity'
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
  // New fields
  checkInDate?: string | null  // ISO date string
  checkOutDate?: string | null // ISO date string
  placeId?: string | null
  // Day range within trip (1-based, only for category='stay')
  startDayNumber?: number | null
  endDayNumber?: number | null
}

// Activity entity
export interface Activity extends BaseEntity {
  type: 'activity'
  title: string
  dayId: string
  window?: string
  status: 'Go' | 'Watch'
  riskLevel: string
  weatherSensitivity: string
  locationId?: string
  linkedEntityKeys?: string[]
  taskIds?: string[]
  description?: string
  backup?: string
  note?: string
  // New fields
  activityDate?: string | null  // ISO date string
  timePeriod?: 'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible' | null
  startTime?: string | null  // HH:MM format
  endTime?: string | null    // HH:MM format
  backupLocationId?: string | null
  weatherData?: {
    date: string
    condition: string
    temperature: number
    precipitation: number
    fetchedAt: string
  } | null
}

// Meal entity
export interface Meal extends BaseEntity {
  type: 'meal'
  title: string
  dayId: string
  startSlot: number
  status: 'Assigned' | 'Pending' | 'Confirmed'
  owner?: string
  reservationType?: string
  timeLabel?: string
  locationId?: string
  linkedEntityKeys?: string[]
  taskIds?: string[]
  note?: string
  // New fields
  mealDate?: string | null  // ISO date string
  mealType?: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | null
  requiresReservation?: boolean | null
  familyIds?: string[]  // Array of family IDs (from junction table)
}

// Expense entity
export interface Expense extends BaseEntity {
  type: 'expense'
  title: string
  expenseDate: Date
  category: 'food' | 'accommodation' | 'transport' | 'activities' | 'other'
  payerFamilyId: string
  amount: number
  allocationMode: 'equal' | 'manual'
  allocations: Record<string, number>
  settled: boolean
  note?: string
}

// Family entity
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
  status: string
  routeSummary: string
  plannedStopIds: string[]
  taskIds: string[]
  linkedEntityKeys: string[]
  note: string
}

// Itinerary item entity
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

// StayItem entity
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
  // Day range within the trip (1-based)
  startDayNumber?: number | null
  endDayNumber?: number | null
}

// Task entity
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
