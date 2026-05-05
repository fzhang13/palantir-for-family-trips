import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { tripRepository } from '@/repositories'
import type {
  CreateFamilyInput,
  CreateLocationInput,
  CreateRouteInput,
} from '@/types/inputs'
import type { Family, Location, Route } from '@/types'

const DEFAULT_TRIP_ID = 'default'

// Family Mutations
export function useAddFamily() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tripId = DEFAULT_TRIP_ID,
      family,
    }: {
      tripId?: string
      family: CreateFamilyInput
    }) => tripRepository.addFamily(tripId, family),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
      tripId = DEFAULT_TRIP_ID,
      familyId,
      updates,
    }: {
      tripId?: string
      familyId: string
      updates: Partial<Family>
    }) => tripRepository.updateFamily(tripId, familyId, updates),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
    mutationFn: ({
      tripId = DEFAULT_TRIP_ID,
      familyId,
    }: {
      tripId?: string
      familyId: string
    }) => tripRepository.deleteFamily(tripId, familyId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
    mutationFn: ({
      tripId = DEFAULT_TRIP_ID,
      location,
    }: {
      tripId?: string
      location: CreateLocationInput
    }) => tripRepository.addLocation(tripId, location),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
      tripId = DEFAULT_TRIP_ID,
      locationId,
      updates,
    }: {
      tripId?: string
      locationId: string
      updates: Partial<Location>
    }) => tripRepository.updateLocation(tripId, locationId, updates),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
    mutationFn: ({
      tripId = DEFAULT_TRIP_ID,
      locationId,
    }: {
      tripId?: string
      locationId: string
    }) => tripRepository.deleteLocation(tripId, locationId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
    mutationFn: ({
      tripId = DEFAULT_TRIP_ID,
      route,
    }: {
      tripId?: string
      route: CreateRouteInput
    }) => tripRepository.addRoute(tripId, route),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
      tripId = DEFAULT_TRIP_ID,
      routeId,
      updates,
    }: {
      tripId?: string
      routeId: string
      updates: Partial<Route>
    }) => tripRepository.updateRoute(tripId, routeId, updates),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
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
    mutationFn: ({
      tripId = DEFAULT_TRIP_ID,
      routeId,
    }: {
      tripId?: string
      routeId: string
    }) => tripRepository.deleteRoute(tripId, routeId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes', variables.tripId || DEFAULT_TRIP_ID] })
      queryClient.invalidateQueries({ queryKey: ['trip', variables.tripId || DEFAULT_TRIP_ID] })
      toast.success('Route deleted successfully')
    },

    onError: (error: Error) => {
      toast.error(`Failed to delete route: ${error.message}`)
    },
  })
}
