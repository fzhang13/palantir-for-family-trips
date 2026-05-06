export * from './TripRepository'
export * from './LocalStorageTripRepository'
export * from './SupabaseTripRepository'

import type { TripRepository } from './TripRepository'
import { tripRepository as localRepo } from './LocalStorageTripRepository'
import { supabaseTripRepository } from './SupabaseTripRepository'
import { supabase } from '@/lib/supabase'

/**
 * Returns the active TripRepository based on whether Supabase is configured.
 * Falls back to localStorage if Supabase env vars are missing.
 */
export function getTripRepository(): TripRepository {
  if (supabase) {
    return supabaseTripRepository
  }
  return localRepo
}
