import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BaseModal } from './BaseModal'
import { createLocationSchema, type CreateLocationFormData } from '@/schemas'
import { useAddLocation } from '@/hooks/useTripMutations'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddLocationModal({ isOpen, onClose }: AddLocationModalProps) {
  const addLocation = useAddLocation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLocationFormData>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: {
      title: '',
      category: 'stay',
      address: '',
      coordinates: {
        lat: 0,
        lng: 0,
      },
      summary: '',
    },
  })

  const onSubmit = (data: CreateLocationFormData) => {
    addLocation.mutate(
      {
        tripId: 'default',
        location: data,
      },
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      }
    )
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add Location">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Location Name */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Location Name *
          </label>
          <input
            {...register('title')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Grand Canyon Viewpoint"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.title.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Address *
          </label>
          <input
            {...register('address')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Grand Canyon, AZ 86023"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.address.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Category *
          </label>
          <select
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

        {/* Latitude */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Latitude *
          </label>
          <input
            {...register('coordinates.lat', { valueAsNumber: true })}
            type="number"
            step="0.000001"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., 36.0544"
          />
          {errors.coordinates?.lat && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.coordinates.lat.message}</p>
          )}
        </div>

        {/* Longitude */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Longitude *
          </label>
          <input
            {...register('coordinates.lng', { valueAsNumber: true })}
            type="number"
            step="0.000001"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., -112.0833"
          />
          {errors.coordinates?.lng && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.coordinates.lng.message}</p>
          )}
        </div>

        {/* Summary (Optional) */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Summary
          </label>
          <textarea
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
            disabled={addLocation.isPending}
            className="px-4 py-2 rounded bg-[#238636] text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {addLocation.isPending ? 'Adding...' : 'Add Location'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
