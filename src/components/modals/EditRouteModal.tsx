import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BaseModal } from './BaseModal'
import { createRouteSchema } from '@/schemas'
import { useFamilies, useLocations, useUpdateRoute } from '@/hooks'
import { DEFAULT_TRIP_ID } from '@/lib/constants'
import type { Route, CreateRouteInput } from '@/types'

interface EditRouteModalProps {
  isOpen: boolean
  onClose: () => void
  route: Route
}

export function EditRouteModal({ isOpen, onClose, route }: EditRouteModalProps) {
  const { data: families = [] } = useFamilies()
  const { data: locations = [] } = useLocations()
  const updateRoute = useUpdateRoute()

  const form = useForm<CreateRouteInput>({
    resolver: zodResolver(createRouteSchema),
    defaultValues: {
      familyId: route.familyId,
      originLocationId: route.stopLocationIds?.[0] || '',
      destinationLocationId: route.destinationLocationId || '',
      departureTime: '', // Will be set from route if available
      day: 1, // Default day
      notes: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = form

  const { isDirty } = useFormState({ control })

  const selectedFamilyId = watch('familyId')

  const onSubmit = (data: CreateRouteInput) => {
    updateRoute.mutate(
      {
        tripId: DEFAULT_TRIP_ID,
        routeId: route.id,
        updates: data as any
      },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?')
      if (!confirmed) return
    }
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Edit Route">
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
            disabled={updateRoute.isPending}
            className="rounded bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateRoute.isPending ? 'Updating...' : 'Update Route'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
