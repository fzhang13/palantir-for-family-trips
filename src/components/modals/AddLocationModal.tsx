import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete } from '@/components/forms'
import { DayBadge } from '@/components/ui/DayBadge'
import { createLocationSchema, type CreateLocationFormData } from '@/schemas'
import { useAddLocation } from '@/hooks/useTripMutations'
import { DEFAULT_TRIP_ID } from '@/lib/constants'
import { getDayName, calculateNights } from '@/lib/dateUtils'
import type { CreateLocationInput } from '@/types/inputs'

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
    watch,
    setValue,
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
      checkInDate: '',
      checkOutDate: '',
    },
  })

  const checkInDate = watch('checkInDate')
  const checkOutDate = watch('checkOutDate')

  // Calculate night count and generate day list
  const [nights, setNights] = useState(0)
  const [dayList, setDayList] = useState<string[]>([])

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate + 'T00:00:00')
      const checkOut = new Date(checkOutDate + 'T00:00:00')
      const nightCount = calculateNights(checkIn, checkOut)
      setNights(nightCount)

      // Generate list of dates for badges
      const dates: string[] = []
      for (let i = 0; i <= nightCount; i++) {
        const date = new Date(checkIn)
        date.setDate(date.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
      setDayList(dates)
    } else {
      setNights(0)
      setDayList([])
    }
  }, [checkInDate, checkOutDate])

  const onSubmit = (data: CreateLocationFormData) => {
    // Ensure category is set (should be 'stay' by default)
    const locationInput: CreateLocationInput = {
      title: data.title,
      category: data.category || 'stay',
      address: data.address,
      coordinates: data.coordinates,
      placeId: data.placeId,
      summary: data.summary,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
    }

    addLocation.mutate(
      {
        tripId: DEFAULT_TRIP_ID,
        location: locationInput,
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
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add Location (Stay)">
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
            placeholder="e.g., Grand Canyon Lodge"
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
          <AddressAutocomplete
            value={watch('address') || ''}
            onChange={(address, place) => {
              if (!address) return

              setValue('address', address, { shouldValidate: true })
              if (place?.place_id) {
                setValue('placeId', place.place_id)
              }
            }}
            onCoordinatesChange={(lat, lng) => {
              setValue('coordinates.lat', lat)
              setValue('coordinates.lng', lng)
            }}
            placeholder="Search for accommodation..."
            error={errors.address?.message}
          />
        </div>

        {/* Check-in Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
              Check-in *
            </label>
            <input
              {...register('checkInDate')}
              type="date"
              className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            />
            {checkInDate && (
              <p className="mt-1 text-xs text-[#8B949E]">
                {getDayName(new Date(checkInDate + 'T00:00:00'))}
              </p>
            )}
            {errors.checkInDate && (
              <p className="mt-1 text-sm text-[#F85149]">
                {errors.checkInDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
              Check-out *
            </label>
            <input
              {...register('checkOutDate')}
              type="date"
              className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            />
            {checkOutDate && (
              <p className="mt-1 text-xs text-[#8B949E]">
                {getDayName(new Date(checkOutDate + 'T00:00:00'))}
                {nights > 0 && ` (${nights} ${nights === 1 ? 'night' : 'nights'})`}
              </p>
            )}
            {errors.checkOutDate && (
              <p className="mt-1 text-sm text-[#F85149]">
                {errors.checkOutDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Visual Day Summary */}
        {dayList.length > 0 && (
          <div className="p-3 bg-[#161B22] border border-[#30363D] rounded">
            <p className="text-xs text-[#8B949E] uppercase tracking-wider mb-2">
              Staying {nights} {nights === 1 ? 'night' : 'nights'}
            </p>
            <div className="flex flex-wrap gap-2">
              {dayList.map((date, index) => (
                <DayBadge
                  key={date}
                  date={date}
                  isCheckout={index === dayList.length - 1}
                />
              ))}
            </div>
          </div>
        )}

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
