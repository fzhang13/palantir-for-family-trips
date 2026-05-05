import { useQuery } from '@tanstack/react-query'
import { tripRepository } from '@/repositories'

const DEFAULT_TRIP_ID = 'default'

export function useFamilies(tripId: string = DEFAULT_TRIP_ID) {
  return useQuery({
    queryKey: ['families', tripId],
    queryFn: () => tripRepository.getFamilies(tripId),
  })
}

export function useLocations(tripId: string = DEFAULT_TRIP_ID) {
  return useQuery({
    queryKey: ['locations', tripId],
    queryFn: () => tripRepository.getLocations(tripId),
  })
}

export function useRoutes(tripId: string = DEFAULT_TRIP_ID) {
  return useQuery({
    queryKey: ['routes', tripId],
    queryFn: () => tripRepository.getRoutes(tripId),
  })
}

export function useTrip(tripId: string = DEFAULT_TRIP_ID) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripRepository.getTrip(tripId),
  })
}
