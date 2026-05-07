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
  dayId: string
  startSlot?: number
  timeLabel?: string
  status?: 'Assigned' | 'Pending' | 'Confirmed'
  owner?: string
  reservationType?: string
  locationId?: string
  note?: string
  createLocation?: CreateLocationInput
  // New fields
  mealDate?: string  // ISO date string
  mealType?: 'breakfast' | 'brunch' | 'lunch' | 'dinner'
  requiresReservation?: boolean
  familyIds?: string[]  // Array of family UUIDs
}

export interface CreateActivityInput {
  title: string
  dayId: string
  window?: string
  status?: 'Go' | 'Watch'
  riskLevel?: string
  weatherSensitivity?: string
  locationId?: string
  description?: string
  backup?: string
  note?: string
  createLocation?: CreateLocationInput
  // New fields
  activityDate?: string  // ISO date string
  timePeriod?: 'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible'
  startTime?: string  // HH:MM format
  endTime?: string    // HH:MM format
  backupLocationId?: string
  createBackupLocation?: CreateLocationInput
  weatherData?: {
    date: string
    condition: string
    temperature: number
    precipitation: number
    fetchedAt: string
  }
}
