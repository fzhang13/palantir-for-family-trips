import { z } from 'zod'

export const createFamilySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  origin: z.string().min(2, 'Origin city required'),
  originAddress: z.string().min(5, 'Valid address required'),
  originCoordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  vehicle: z.enum(['SUV', 'Sedan', 'Van', 'Truck']).optional(),
  vehicleLabel: z.string().optional(),
  headcount: z.string().optional(),
  responsibility: z.string().optional(),
  note: z.string().max(500, 'Note too long').optional(),
  arrivalDayId: z.enum(['thu', 'fri', 'sat', 'sun']).optional(),
  eta: z.string().optional(),
  driveTime: z.string().optional(),
})

export type CreateFamilyFormData = z.infer<typeof createFamilySchema>
