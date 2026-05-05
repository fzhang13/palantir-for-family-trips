import { z } from 'zod'

export const createRouteSchema = z.object({
  familyId: z.string().uuid('Invalid family selected'),

  originLocationId: z.string().uuid().optional(),
  // If not provided, use family's origin coordinates

  destinationLocationId: z.string().uuid('Destination is required'),

  departureTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time format must be HH:MM'),

  day: z.number()
    .int()
    .min(1, 'Day must be at least 1')
    .max(30, 'Day must be less than 30'),

  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
})

export const updateRouteSchema = createRouteSchema.partial()
