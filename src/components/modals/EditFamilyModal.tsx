import { useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete } from '@/components/forms'
import { createFamilySchema, type CreateFamilyFormData } from '@/schemas'
import { useUpdateFamily, useActiveTripId } from '@/hooks'
import type { Family } from '@/types'

interface EditFamilyModalProps {
  isOpen: boolean
  onClose: () => void
  family: Family
}

export function EditFamilyModal({ isOpen, onClose, family }: EditFamilyModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const updateFamily = useUpdateFamily()

  const form = useForm<CreateFamilyFormData>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: family.name,
      origin: family.origin,
      originAddress: family.originAddress,
      originCoordinates: family.originCoordinates,
      vehicle: family.vehicle as 'SUV' | 'Sedan' | 'Van' | 'Truck' | undefined,
      vehicleLabel: family.vehicleLabel,
      headcount: family.headcount,
      responsibility: family.responsibility,
      note: family.note || '',
      arrivalDayId: family.arrivalDayId as 'thu' | 'fri' | 'sat' | 'sun' | undefined,
      eta: family.eta,
      driveTime: family.driveTime,
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

  const onSubmit = async (data: CreateFamilyFormData) => {
    if (!activeTripId) return
    try {
      await updateFamily.mutateAsync({ tripId: activeTripId, familyId: family.id, updates: data })
      toast.success('Family updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update family')
      console.error('Update family error:', error)
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
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Edit Family">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Family Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Family Name *
          </label>
          <input
            id="name"
            {...register('name')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., The Smiths"
          />
          {errors.name && <p className="mt-1 text-sm text-[#F85149]">{errors.name.message}</p>}
        </div>

        {/* Origin City */}
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Origin City *
          </label>
          <input
            id="origin"
            {...register('origin')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., San Francisco"
          />
          {errors.origin && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.origin.message}</p>
          )}
        </div>

        {/* Origin Address */}
        <div>
          <label htmlFor="originAddress" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Origin Address *
          </label>
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
          <label htmlFor="vehicle" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Vehicle Type
          </label>
          <select
            id="vehicle"
            {...register('vehicle')}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="">Select vehicle</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
          </select>
        </div>

        {/* Headcount */}
        <div>
          <label htmlFor="headcount" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Headcount
          </label>
          <input
            id="headcount"
            {...register('headcount')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., 2 adults, 1 kid"
          />
        </div>

        {/* Responsibility */}
        <div>
          <label htmlFor="responsibility" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Responsibility
          </label>
          <input
            id="responsibility"
            {...register('responsibility')}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Firewood + snacks"
          />
        </div>

        {/* Arrival Day */}
        <div>
          <label htmlFor="arrivalDayId" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Arrival Day
          </label>
          <select
            id="arrivalDayId"
            {...register('arrivalDayId')}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="">Select day</option>
            <option value="thu">Thursday</option>
            <option value="fri">Friday</option>
            <option value="sat">Saturday</option>
            <option value="sun">Sunday</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Notes
          </label>
          <textarea
            id="note"
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
            disabled={isSubmitting || updateFamily.isPending}
            className="px-4 py-2 rounded bg-[#238636] text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || updateFamily.isPending ? 'Updating...' : 'Update Family'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
