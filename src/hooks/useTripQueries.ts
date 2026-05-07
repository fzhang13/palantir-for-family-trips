import { useQuery } from '@tanstack/react-query'
import { getTripRepository } from '@/repositories'
import { SupabaseTripRepository } from '@/repositories/SupabaseTripRepository'
import { DEFAULT_TRIP_ID } from '@/lib/constants'
import type { Meal, Activity } from '@/types/trip'

const tripRepository = getTripRepository()

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

export function useMeals(tripId: string = DEFAULT_TRIP_ID) {
  return useQuery({
    queryKey: ['meals', tripId],
    queryFn: () => tripRepository.getMeals(tripId),
  })
}

export function useActivities(tripId: string = DEFAULT_TRIP_ID) {
  return useQuery({
    queryKey: ['activities', tripId],
    queryFn: () => tripRepository.getActivities(tripId),
  })
}

export function useMealsForConflictCheck(tripId: string) {
  return useQuery<Meal[]>({
    queryKey: ['trips', tripId, 'meals-conflict-check'],
    queryFn: async () => {
      const repo = new SupabaseTripRepository()
      const doc = await repo.getTrip(tripId)
      return doc.meals
    },
  })
}

export function useActivitiesForConflictCheck(tripId: string) {
  return useQuery<Activity[]>({
    queryKey: ['trips', tripId, 'activities-conflict-check'],
    queryFn: async () => {
      const repo = new SupabaseTripRepository()
      const doc = await repo.getTrip(tripId)
      return doc.activities
    },
  })
}
