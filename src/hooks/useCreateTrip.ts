import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getTripRepository } from '@/repositories'
import { useActiveTripContext } from '@/context'
import type { CreateTripInput } from '@/types/inputs'

export function useCreateTrip() {
  const queryClient = useQueryClient()
  const { setActiveTripId } = useActiveTripContext()

  return useMutation({
    mutationFn: async (input: CreateTripInput) => {
      const repo = getTripRepository()
      return repo.createTrip(input)
    },
    onSuccess: trip => {
      // Set as active trip
      setActiveTripId(trip.id)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
