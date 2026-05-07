import { useQuery } from '@tanstack/react-query'
import { getTripRepository } from '@/repositories'
import { supabase } from '@/lib/supabase'
import { useActiveTripId } from './useActiveTripId'

const tripRepository = getTripRepository()

export function useFamilies(tripId?: string) {
  const { data: activeTripId } = useActiveTripId()
  const resolvedTripId = tripId || activeTripId

  return useQuery({
    queryKey: ['families', resolvedTripId],
    queryFn: () => tripRepository.getFamilies(resolvedTripId!),
    enabled: !!resolvedTripId,
  })
}

export function useLocations(tripId?: string) {
  const { data: activeTripId } = useActiveTripId()
  const resolvedTripId = tripId || activeTripId

  return useQuery({
    queryKey: ['locations', resolvedTripId],
    queryFn: () => tripRepository.getLocations(resolvedTripId!),
    enabled: !!resolvedTripId,
  })
}

export function useRoutes(tripId?: string) {
  const { data: activeTripId } = useActiveTripId()
  const resolvedTripId = tripId || activeTripId

  return useQuery({
    queryKey: ['routes', resolvedTripId],
    queryFn: () => tripRepository.getRoutes(resolvedTripId!),
    enabled: !!resolvedTripId,
  })
}

export function useTrip(tripId?: string) {
  const { data: activeTripId } = useActiveTripId()
  const resolvedTripId = tripId || activeTripId

  return useQuery({
    queryKey: ['trip', resolvedTripId],
    queryFn: () => tripRepository.getTrip(resolvedTripId!),
    enabled: !!resolvedTripId,
  })
}

export function useMeals(tripId?: string) {
  const { data: activeTripId } = useActiveTripId()
  const resolvedTripId = tripId || activeTripId

  return useQuery({
    queryKey: ['meals', resolvedTripId],
    queryFn: () => tripRepository.getMeals(resolvedTripId!),
    enabled: !!resolvedTripId,
  })
}

export function useActivities(tripId?: string) {
  const { data: activeTripId } = useActiveTripId()
  const resolvedTripId = tripId || activeTripId

  return useQuery({
    queryKey: ['activities', resolvedTripId],
    queryFn: () => tripRepository.getActivities(resolvedTripId!),
    enabled: !!resolvedTripId,
  })
}

export function useMealsForConflictCheck(tripId: string) {
  return useMeals(tripId)
}

export function useActivitiesForConflictCheck(tripId: string) {
  return useActivities(tripId)
}

/**
 * Fetch all active (non-archived) trips
 * Sorted by start_date ascending
 * Note: Treats NULL status as active for backward compatibility
 */
export function useActiveTrips() {
  return useQuery({
    queryKey: ['trips', 'active'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      }

      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .or('status.eq.active,status.is.null')
        .order('start_date', { ascending: true })

      if (error) throw error
      return data || []
    }
  })
}

/**
 * Fetch metadata for a specific trip
 */
export function useTripMetadata(tripId?: string) {
  const { data: activeTripId } = useActiveTripId()
  const resolvedTripId = tripId || activeTripId

  return useQuery({
    queryKey: ['trip-metadata', resolvedTripId],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase client not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      }

      const { data, error } = await supabase
        .from('trips')
        .select('id, title, start_date, end_date, timezone, status')
        .eq('id', resolvedTripId!)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!resolvedTripId,
  })
}
