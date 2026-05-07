export * from './TripRepository'
export * from './SupabaseTripRepository'

import type { TripRepository } from './TripRepository'
import { supabaseTripRepository } from './SupabaseTripRepository'

/**
 * Returns the active TripRepository.
 * Supabase is now required - no fallback.
 */
export function getTripRepository(): TripRepository {
  return supabaseTripRepository
}
