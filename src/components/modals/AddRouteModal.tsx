import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { BaseModal } from './BaseModal'
import { createRouteSchema } from '@/schemas'
import { useFamilies, useLocations, useAddRoute } from '@/hooks'
import { DEFAULT_TRIP_ID } from '@/lib/constants'
import type { CreateRouteInput } from '@/types'

interface AddRouteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddRouteModal({ isOpen, onClose }: AddRouteModalProps) {
  const { data: families = [] } = useFamilies()
  const { data: locations = [] } = useLocations()
  const addRoute = useAddRoute()
  const [isFetchingDirections, setIsFetchingDirections] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateRouteInput>({
    resolver: zodResolver(createRouteSchema),
  })

  const selectedFamilyId = watch('familyId')

  const onSubmit = async (data: CreateRouteInput) => {
    // Get origin coordinates
    const family = families.find((f) => f.id === data.familyId)
    if (!family) {
      toast.error('Family not found')
      return
    }

    let originCoords = family.originCoordinates
    if (data.originLocationId) {
      const originLocation = locations.find((l) => l.id === data.originLocationId)
      if (originLocation) {
        originCoords = originLocation.coordinates
      }
    }

    // Get destination coordinates
    const destination = locations.find((l) => l.id === data.destinationLocationId)
    if (!destination) {
      toast.error('Destination location not found')
      return
    }

    // Fetch directions from Google Maps
    setIsFetchingDirections(true)
    try {
      if (!window.google?.maps) {
        throw new Error('Google Maps not loaded')
      }

      const directionsService = new google.maps.DirectionsService()
      const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route(
          {
            origin: originCoords,
            destination: destination.coordinates,
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK' && result) {
              resolve(result)
            } else {
              reject(new Error(`Directions request failed: ${status}`))
            }
          }
        )
      })

      // Extract path from directions result
      const route = result.routes[0]
      const path: Array<{ lat: number; lng: number }> = []
      route.overview_path.forEach((point) => {
        path.push({
          lat: point.lat(),
          lng: point.lng(),
        })
      })

      // Extract duration
      const leg = route.legs[0]
      const durationSeconds = leg.duration?.value || 0

      // Submit route with path
      addRoute.mutate(
        {
          tripId: DEFAULT_TRIP_ID,
          route: {
            ...data,
            path,
            durationSeconds,
          }
        },
        {
          onSuccess: () => {
            reset()
            onClose()
          },
        }
      )
    } catch (error) {
      console.error('Failed to fetch directions:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to fetch directions')
    } finally {
      setIsFetchingDirections(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add Route">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Family Selection */}
        <div>
          <label htmlFor="familyId" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Family *
          </label>
          <select
            id="familyId"
            {...register('familyId')}
            className="w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="">Select family</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
          {errors.familyId && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.familyId.message}</p>
          )}
        </div>

        {/* Origin Selection */}
        <div>
          <label htmlFor="originLocationId" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Origin (optional)
          </label>
          <select
            id="originLocationId"
            {...register('originLocationId')}
            className="w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            disabled={!selectedFamilyId}
          >
            <option value="">Use family origin</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[#8B949E]">
            Leave blank to use selected family's origin
          </p>
          {errors.originLocationId && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.originLocationId.message}</p>
          )}
        </div>

        {/* Destination Selection */}
        <div>
          <label htmlFor="destinationLocationId" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Destination *
          </label>
          <select
            id="destinationLocationId"
            {...register('destinationLocationId')}
            className="w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="">Select destination</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.title}
              </option>
            ))}
          </select>
          {errors.destinationLocationId && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.destinationLocationId.message}</p>
          )}
        </div>

        {/* Departure Time */}
        <div>
          <label htmlFor="departureTime" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Departure Time *
          </label>
          <input
            id="departureTime"
            type="time"
            {...register('departureTime')}
            className="w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          />
          {errors.departureTime && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.departureTime.message}</p>
          )}
        </div>

        {/* Day */}
        <div>
          <label htmlFor="day" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Day *
          </label>
          <select
            id="day"
            {...register('day', { valueAsNumber: true })}
            className="w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="">Select day</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>
          {errors.day && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.day.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="Optional route notes..."
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.notes.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded bg-[#21262D] px-4 py-2 text-sm font-medium text-[#C9D1D9] hover:bg-[#30363D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addRoute.isPending || isFetchingDirections}
            className="rounded bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFetchingDirections ? 'Fetching directions...' : addRoute.isPending ? 'Adding...' : 'Add Route'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
