import { useQuery } from '@tanstack/react-query'
import { useActiveTripContext } from '@/context'
import { getTripRepository } from '@/repositories'
import { supabase } from '@/lib/supabase'

export function useActiveTripId() {
  const { activeTripId, setActiveTripId } = useActiveTripContext()

  return useQuery({
    queryKey: ['trips', 'active', activeTripId],
    queryFn: async () => {
      // Validate localStorage ID if it exists
      if (activeTripId) {
        const { data } = await supabase
          .from('trips')
          .select('id')
          .eq('id', activeTripId)
          .eq('status', 'active')
          .maybeSingle()

        if (data) return activeTripId

        // Invalid - clear and fall through
        setActiveTripId(null)
      }

      // Query for any active trip
      const repo = getTripRepository()
      const tripId = await repo.getActiveTripId()

      if (tripId) {
        setActiveTripId(tripId)
      }

      return tripId
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  })
}
