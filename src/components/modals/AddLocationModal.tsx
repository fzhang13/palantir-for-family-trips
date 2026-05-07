import { useState } from 'react'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete, DayRangeSelector } from '@/components/forms'
import { useAddLocation } from '@/hooks/useTripMutations'
import { useActiveTripId } from '@/hooks'
import type { CreateLocationInput } from '@/types/inputs'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddLocationModal({ isOpen, onClose }: AddLocationModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const addLocation = useAddLocation()

  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [placeId, setPlaceId] = useState<string | undefined>()
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 })
  const [summary, setSummary] = useState('')
  const [startDay, setStartDay] = useState<number | null>(null)
  const [endDay, setEndDay] = useState<number | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleDayRangeChange = (start: number, end: number) => {
    setStartDay(start)
    setEndDay(end)
    setErrors(prev => ({ ...prev, dayRange: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Location name is required'
    if (!address.trim()) newErrors.address = 'Address is required'
    if (startDay === null || endDay === null) {
      newErrors.dayRange = 'Please select stay duration'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!activeTripId) return

    const locationInput: CreateLocationInput = {
      title: title.trim(),
      category: 'stay',
      address: address.trim(),
      coordinates,
      placeId,
      summary: summary.trim(),
    }

    addLocation.mutate(
      {
        tripId: activeTripId,
        location: {
          ...locationInput,
          // Add day range to location
          startDayNumber: startDay!,
          endDayNumber: endDay!,
        } as any, // Cast needed due to type mismatch
      },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  const handleClose = () => {
    setTitle('')
    setAddress('')
    setPlaceId(undefined)
    setCoordinates({ lat: 0, lng: 0 })
    setSummary('')
    setStartDay(null)
    setEndDay(null)
    setErrors({})
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add Stay Location">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Name */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Location Name <span className="text-[#F85149]">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors(prev => ({ ...prev, title: '' }))
            }}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Grand Canyon Lodge"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.title}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Address <span className="text-[#F85149]">*</span>
          </label>
          <AddressAutocomplete
            value={address}
            onChange={(addr, place) => {
              if (!addr) return
              setAddress(addr)
              setErrors(prev => ({ ...prev, address: '' }))
              if (place?.place_id) {
                setPlaceId(place.place_id)
              }
            }}
            onCoordinatesChange={(lat, lng) => {
              setCoordinates({ lat, lng })
            }}
            placeholder="Search for accommodation..."
            error={errors.address}
          />
        </div>

        {/* Day Range Selector */}
        <DayRangeSelector
          startDay={startDay}
          endDay={endDay}
          onChange={handleDayRangeChange}
          error={errors.dayRange}
        />

        {/* Summary (Optional) */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none resize-none"
            placeholder="Additional information about this location..."
          />
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
            {addLocation.isPending ? 'Adding...' : 'Add Stay'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
