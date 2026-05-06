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
  category: 'stay' | 'meal' | 'logistics'
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
}

export type CreateRouteInput = z.infer<typeof createRouteSchema>

export interface CreateMealInput {
  title: string
  dayId: string
  timeLabel?: string
  status?: 'Assigned' | 'Pending' | 'Confirmed'
  owner?: string
  reservationType?: string
  locationId?: string
  note?: string
  createLocation?: CreateLocationInput
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
}
