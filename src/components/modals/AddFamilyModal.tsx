import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete, SimpleDaySelector } from '@/components/forms'
import { createFamilySchema, type CreateFamilyFormData } from '@/schemas'
import { useAddFamily } from '@/hooks/useTripMutations'
import { useActiveTripId } from '@/hooks'
import type { CreateFamilyInput } from '@/types/inputs'

interface AddFamilyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddFamilyModal({ isOpen, onClose }: AddFamilyModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const addFamily = useAddFamily()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateFamilyFormData>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: '',
      origin: '',
      originAddress: '',
      originCoordinates: { lat: 0, lng: 0 },
      vehicle: 'SUV',
      arrivalDayId: '',
    },
  })

  const onSubmit = (data: CreateFamilyFormData) => {
    if (!activeTripId) return
    addFamily.mutate(
      {
        tripId: activeTripId,
        family: data as CreateFamilyInput,
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
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add Family">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Family Name */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Family Name *</label>
          <input
            {...register('name')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., The Smiths"
          />
          {errors.name && <p className="mt-1 text-sm text-[#F85149]">{errors.name.message}</p>}
        </div>

        {/* Origin City */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Origin City *</label>
          <input
            {...register('origin')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., San Francisco"
          />
          {errors.origin && <p className="mt-1 text-sm text-[#F85149]">{errors.origin.message}</p>}
        </div>

        {/* Origin Address */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Origin Address *</label>
          <AddressAutocomplete
            id="originAddress"
            value={watch('originAddress') || ''}
            onChange={(address, place) => {
              setValue('originAddress', address)
              if (place?.place_id) {
                setValue('placeId', place.place_id)
              }
            }}
            onCoordinatesChange={(lat, lng) => {
              setValue('originCoordinates', { lat, lng })
            }}
            placeholder="e.g., 1 Market St, San Francisco, CA"
            error={errors.originAddress?.message}
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Vehicle Type</label>
          <select
            {...register('vehicle')}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        {/* Headcount */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Headcount</label>
          <input
            {...register('headcount')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., 2 adults, 1 kid"
          />
        </div>

        {/* Responsibility */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Responsibility</label>
          <input
            {...register('responsibility')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Firewood + snacks"
          />
        </div>

        {/* Arrival Day */}
        <SimpleDaySelector
          value={watch('arrivalDayId') || ''}
          onChange={value => setValue('arrivalDayId', value)}
          error={errors.arrivalDayId?.message}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Notes</label>
          <textarea
            {...register('note')}
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none resize-none"
            placeholder="Additional notes..."
          />
          {errors.note && <p className="mt-1 text-sm text-[#F85149]">{errors.note.message}</p>}
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
            disabled={addFamily.isPending}
            className="px-4 py-2 rounded bg-[#238636] text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {addFamily.isPending ? 'Adding...' : 'Add Family'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
