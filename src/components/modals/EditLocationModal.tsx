import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete } from '@/components/forms'
import { createLocationSchema, type CreateLocationFormData } from '@/schemas'
import { useUpdateLocation } from '@/hooks'
import type { Location } from '@/types'

interface EditLocationModalProps {
  isOpen: boolean
  onClose: () => void
  location: Location
}

export function EditLocationModal({ isOpen, onClose, location }: EditLocationModalProps) {
  const updateLocation = useUpdateLocation()

  const form = useForm<CreateLocationFormData>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      title: location.title,
      address: location.address,
      category: location.category as 'stay' | 'meal' | 'logistics',
      coordinates: location.coordinates,
      summary: location.summary || '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    control,
  } = form

  const { isDirty } = useFormState({ control })

  const onSubmit = async (data: CreateLocationFormData) => {
    try {
      await updateLocation.mutateAsync({ locationId: location.id, updates: data })
      toast.success('Location updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update location')
      console.error('Update location error:', error)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?')
      if (!confirmed) return
    }
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Edit Location">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Location Name */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Location Name *
          </label>
          <input
            id="title"
            {...register('title')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Grand Canyon Viewpoint"
          />
          {errors.title && <p className="mt-1 text-sm text-[#F85149]">{errors.title.message}</p>}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Address *
          </label>
          <AddressAutocomplete
            id="address"
            value={watch('address') || ''}
            onChange={(address, place) => {
              setValue('address', address, { shouldValidate: true })
              if (place?.place_id) {
                setValue('placeId', place.place_id)
              }
            }}
            onCoordinatesChange={(lat, lng) => {
              setValue('coordinates.lat', lat)
              setValue('coordinates.lng', lng)
            }}
            placeholder="e.g., Grand Canyon, AZ 86023"
            error={errors.address?.message}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Category *
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="stay">Stay</option>
            <option value="meal">Meal</option>
            <option value="logistics">Logistics</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.category.message}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            {...register('summary')}
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none resize-none"
            placeholder="Additional information about this location..."
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.summary.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded bg-[#21262D] text-[#C9D1D9] hover:bg-[#30363D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || updateLocation.isPending}
            className="px-4 py-2 rounded bg-[#238636] text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || updateLocation.isPending ? 'Updating...' : 'Update Location'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
