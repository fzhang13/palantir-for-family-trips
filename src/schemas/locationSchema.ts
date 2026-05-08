import { z } from 'zod'

export const createLocationSchema = z
  .object({
    title: z.string().min(1, 'Location name is required').max(200, 'Name too long'),
    category: z.enum(['stay', 'meal', 'activity']).default('stay'),
    address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90, 'Invalid latitude'),
      lng: z.number().min(-180).max(180, 'Invalid longitude'),
    }),
    placeId: z.string().optional(),
    summary: z.string().max(1000, 'Summary too long').optional(),
    // New fields for stays
    checkInDate: z.string().min(1).optional().or(z.literal('')), // ISO date string or empty
    checkOutDate: z.string().min(1).optional().or(z.literal('')), // ISO date string or empty
    // NEW: WiFi credentials (optional)
    wifiNetwork: z.string().max(200, 'Network name too long').optional(),
    wifiPassword: z.string().max(200, 'Password too long').optional(),
    // NEW: Access information (optional)
    hostName: z.string().max(200, 'Host name too long').optional(),
    lockNote: z.string().max(200, 'Lock code too long').optional(),
    checkIn: z.string().max(50, 'Check-in time too long').optional(),
    checkOut: z.string().max(50, 'Check-out time too long').optional(),
    accessNote: z.string().max(1000, 'Access instructions too long').optional(),
  })
  .refine(
    data => {
      // Only validate if dates are provided (non-empty strings)
      const hasCheckIn = data.checkInDate && data.checkInDate.length > 0
      const hasCheckOut = data.checkOutDate && data.checkOutDate.length > 0

      // If check-in provided, check-out must also be provided
      if (hasCheckIn && !hasCheckOut) return false
      if (!hasCheckIn && hasCheckOut) return false
      return true
    },
    { message: 'Both check-in and check-out dates are required' }
  )
  .refine(
    data => {
      // Only validate dates if both are provided
      if (
        data.checkInDate &&
        data.checkInDate.length > 0 &&
        data.checkOutDate &&
        data.checkOutDate.length > 0
      ) {
        return new Date(data.checkOutDate) > new Date(data.checkInDate)
      }
      return true
    },
    { message: 'Check-out must be after check-in', path: ['checkOutDate'] }
  )

export type CreateLocationFormData = z.infer<typeof createLocationSchema>
