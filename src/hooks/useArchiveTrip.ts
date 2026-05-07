import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getTripRepository } from '@/repositories'
import { useActiveTripContext } from '@/context'

export function useArchiveTrip() {
  const queryClient = useQueryClient()
  const { setActiveTripId } = useActiveTripContext()

  return useMutation({
    mutationFn: async (tripId: string) => {
      const repo = getTripRepository()
      return repo.archiveTrip(tripId)
    },
    onSuccess: () => {
      // Clear active trip
      setActiveTripId(null)

      // Invalidate all trip-related queries
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['families'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['routes'] })
      queryClient.invalidateQueries({ queryKey: ['meals'] })
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
