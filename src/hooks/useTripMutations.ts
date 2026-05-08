import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getTripRepository } from '@/repositories'
import type { CreateFamilyInput, CreateLocationInput, CreateRouteInput } from '@/types/inputs'
import type { Family, Location, Route } from '@/types'

const tripRepository = getTripRepository()

// Family Mutations
export function useAddFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, family }: { tripId: string; family: CreateFamilyInput }) =>
      tripRepository.addFamily(tripId, family),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families', variables.tripId] })
      toast.success('Family added successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to add family: ${error.message}`)
    },
  })
}

export function useUpdateFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tripId,
      familyId,
      updates,
    }: {
      tripId: string
      familyId: string
      updates: Partial<Family>
    }) => tripRepository.updateFamily(tripId, familyId, updates),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families', variables.tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Family updated successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to update family: ${error.message}`)
    },
  })
}

export function useDeleteFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, familyId }: { tripId: string; familyId: string }) =>
      tripRepository.deleteFamily(tripId, familyId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families', variables.tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Family deleted successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to delete family: ${error.message}`)
    },
  })
}

// Location Mutations
export function useAddLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, location }: { tripId: string; location: CreateLocationInput }) =>
      tripRepository.addLocation(tripId, location),

    onSuccess: (data, variables) => {
      const { location } = data
      const tripId = variables.tripId

      // Invalidate locations query
      queryClient.invalidateQueries({ queryKey: ['locations', tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })

      // Invalidate entity-specific query based on category
      switch (location.category) {
        case 'meal':
          queryClient.invalidateQueries({ queryKey: ['meals', tripId] })
          break
        case 'activity':
          queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
          break
        case 'stay':
          queryClient.invalidateQueries({ queryKey: ['stay_items', tripId] })
          break
      }

      toast.success('Location added successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to add location: ${error.message}`)
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tripId,
      locationId,
      updates,
    }: {
      tripId: string
      locationId: string
      updates: Partial<Location>
    }) => tripRepository.updateLocation(tripId, locationId, updates),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations', variables.tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Location updated successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to update location: ${error.message}`)
    },
  })
}

export function useDeleteLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, locationId }: { tripId: string; locationId: string }) =>
      tripRepository.deleteLocation(tripId, locationId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations', variables.tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Location deleted successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to delete location: ${error.message}`)
    },
  })
}

// Route Mutations
export function useAddRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, route }: { tripId: string; route: CreateRouteInput }) =>
      tripRepository.addRoute(tripId, route),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes', variables.tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Route added successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to add route: ${error.message}`)
    },
  })
}

export function useUpdateRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tripId,
      routeId,
      updates,
    }: {
      tripId: string
      routeId: string
      updates: Partial<Route>
    }) => tripRepository.updateRoute(tripId, routeId, updates),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes', variables.tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Route updated successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to update route: ${error.message}`)
    },
  })
}

export function useDeleteRoute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId, routeId }: { tripId: string; routeId: string }) =>
      tripRepository.deleteRoute(tripId, routeId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes', variables.tripId] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Route deleted successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to delete route: ${error.message}`)
    },
  })
}

// ─── Trip Metadata ─────────────────────────────────────────────────────────

export function useUpdateTripMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tripId,
      metadata,
    }: {
      tripId: string
      metadata: Partial<import('@/types').TripMeta>
    }) => tripRepository.updateTripMetadata(tripId, metadata),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Trip settings updated successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to update trip settings: ${error.message}`)
    },
  })
}

// ─── Trip Archive ──────────────────────────────────────────────────────────

export function useArchiveTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId }: { tripId: string }) => tripRepository.archiveTrip(tripId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Trip archived successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to archive trip: ${error.message}`)
    },
  })
}

export function useUnarchiveTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tripId }: { tripId: string }) => tripRepository.unarchiveTrip(tripId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'active'] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId] })
      toast.success('Trip restored successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to restore trip: ${error.message}`)
    },
  })
}

// ─── Meals ─────────────────────────────────────────────────────────────────

export function useAddMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      tripId,
      input,
    }: {
      tripId: string
      input: import('@/types/inputs').CreateMealInput
    }) => tripRepository.addMeal(tripId, input),
    onSuccess: (_, { tripId, input }) => {
      queryClient.invalidateQueries({ queryKey: ['meals', tripId] })
      if (input.createLocation) {
        queryClient.invalidateQueries({ queryKey: ['locations', tripId] })
      }
    },
  })
}

export function useUpdateMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      tripId,
      mealId,
      updates,
    }: {
      tripId: string
      mealId: string
      updates: Partial<import('@/types/inputs').CreateMealInput>
    }) => tripRepository.updateMeal(tripId, mealId, updates),
    onSuccess: (_, { tripId, updates }) => {
      queryClient.invalidateQueries({ queryKey: ['meals', tripId] })
      if (updates.createLocation) {
        queryClient.invalidateQueries({ queryKey: ['locations', tripId] })
      }
    },
  })
}

export function useDeleteMeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, mealId }: { tripId: string; mealId: string }) =>
      tripRepository.deleteMeal(tripId, mealId),
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['meals', tripId] })
    },
  })
}

// ─── Activities ────────────────────────────────────────────────────────────

export function useAddActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      tripId,
      input,
    }: {
      tripId: string
      input: import('@/types/inputs').CreateActivityInput
    }) => tripRepository.addActivity(tripId, input),
    onSuccess: (_, { tripId, input }) => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
      if (input.createLocation) {
        queryClient.invalidateQueries({ queryKey: ['locations', tripId] })
      }
    },
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      tripId,
      activityId,
      updates,
    }: {
      tripId: string
      activityId: string
      updates: Partial<import('@/types/inputs').CreateActivityInput>
    }) => tripRepository.updateActivity(tripId, activityId, updates),
    onSuccess: (_, { tripId, updates }) => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
      if (updates.createLocation) {
        queryClient.invalidateQueries({ queryKey: ['locations', tripId] })
      }
    },
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, activityId }: { tripId: string; activityId: string }) =>
      tripRepository.deleteActivity(tripId, activityId),
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] })
    },
  })
}
