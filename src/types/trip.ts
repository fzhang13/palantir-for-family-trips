/// <reference types="google.maps" />

import type { UIState } from './ui'
import type { WeatherBundle } from './weather'

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
