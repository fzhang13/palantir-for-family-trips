import { createRouteSchema } from '@/schemas'
import type { z } from 'zod'

export interface CreateFamilyInput {
  name: string
  origin: string
  originAddress: string
  originCoordinates: { lat: number; lng: number }
  vehicle?: string
  vehicleLabel?: string
  headcount?: string
  responsibility?: string
  note?: string
  arrivalDayId?: string
  eta?: string
  driveTime?: string
}

export interface CreateLocationInput {
  title: string
  category: 'stay' | 'meal' | 'activity'
  address: string
  coordinates: { lat: number; lng: number }
  stopType?: string
  summary?: string
  externalUrl?: string
  dayId?: string
  placesQuery?: string
  parkingNote?: string
  accessNote?: string
  directionsNote?: string
  // New fields for stays
  checkInDate?: string  // ISO date string
  checkOutDate?: string // ISO date string
  placeId?: string
}

export type CreateRouteInput = z.infer<typeof createRouteSchema>

export interface CreateMealInput {
  title: string
  mealDate: string // ISO date from TripDaySelector
  mealType: 'breakfast' | 'brunch' | 'lunch' | 'dinner'
  time?: string // Optional time label like "7:00 PM"
  status: 'Assigned' | 'Pending' | 'Confirmed'
  familyIds?: string[] // Array of family IDs
  requiresReservation?: boolean
  createLocation?: CreateLocationInput
  note?: string
  // Deprecated fields (kept for backward compat, auto-derived by repository)
  dayId?: string
}

export interface CreateActivityInput {
  title: string
  activityDate: string // ISO date from TripDaySelector
  timePeriod: 'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible'
  startTime?: string // HH:MM format
  endTime?: string // HH:MM format
  status: 'Go' | 'Watch'
  riskLevel?: string
  weatherSensitivity?: string
  familyIds?: string[] // Array of family IDs
  createLocation?: CreateLocationInput
  description?: string
  backup?: string
  note?: string
  createBackupLocation?: CreateLocationInput
  weatherData?: {
    date: string
    condition: string
    temperature: number
    precipitation: number
    fetchedAt: string
  }
  // Deprecated fields (kept for backward compat, auto-derived by repository)
  dayId?: string
  window?: string
}

export interface CreateTripInput {
  title: string
  start_date: string    // ISO 8601 date
  end_date: string      // ISO 8601 date
  timezone: string
}
