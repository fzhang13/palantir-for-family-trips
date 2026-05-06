import { z } from 'zod'

export const createRouteSchema = z.object({
  familyId: z.string().uuid('Invalid family selected'),

  originLocationId: z.string().uuid('Invalid origin location').optional().or(z.literal('').transform(() => undefined)),
  // If not provided, use family's origin coordinates

  destinationLocationId: z.string().uuid('Destination is required'),

  departureTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time format must be HH:MM'),

  day: z.number()
    .int()
    .min(1, 'Day must be at least 1')
    .max(30, 'Day must be at most 30'),

  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),

  // Optional fields added by the modal after fetching directions
  path: z.array(z.object({
    lat: z.number(),
    lng: z.number()
  })).optional(),

  durationSeconds: z.number().optional()
})

export type CreateRouteFormData = z.infer<typeof createRouteSchema>
