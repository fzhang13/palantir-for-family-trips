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
