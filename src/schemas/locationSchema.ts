import { z } from 'zod'

export const createLocationSchema = z.object({
  title: z.string().min(1, 'Location name is required').max(200, 'Name too long'),
  category: z.enum(['stay', 'meal', 'logistics']).catch('stay'),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90, 'Invalid latitude'),
    lng: z.number().min(-180).max(180, 'Invalid longitude'),
  }),
  summary: z.string().max(1000, 'Summary too long').optional(),
})

export type CreateLocationFormData = z.infer<typeof createLocationSchema>
