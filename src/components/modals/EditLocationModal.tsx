import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete, DayRangeSelector } from '@/components/forms'
import { useUpdateLocation, useActiveTripId } from '@/hooks'
import type { Location } from '@/types'

interface EditLocationModalProps {
  isOpen: boolean
  onClose: () => void
  location: Location
}

export function EditLocationModal({ isOpen, onClose, location }: EditLocationModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const updateLocation = useUpdateLocation()

  const [title, setTitle] = useState(location.title)
  const [address, setAddress] = useState(location.address)
  const [placeId, setPlaceId] = useState<string | undefined>(location.placeId || undefined)
  const [coordinates, setCoordinates] = useState(location.coordinates || { lat: 0, lng: 0 })
  const [summary, setSummary] = useState(location.summary || '')
  const [startDay, setStartDay] = useState<number | null>(location.startDayNumber || null)
  const [endDay, setEndDay] = useState<number | null>(location.endDayNumber || null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Reset form when location changes
  useEffect(() => {
    setTitle(location.title)
    setAddress(location.address)
    setPlaceId(location.placeId || undefined)
    setCoordinates(location.coordinates || { lat: 0, lng: 0 })
    setSummary(location.summary || '')
    setStartDay(location.startDayNumber || null)
    setEndDay(location.endDayNumber || null)
    setHasChanges(false)
  }, [location])

  // Track changes
  useEffect(() => {
    const changed =
      title !== location.title ||
      address !== location.address ||
      summary !== (location.summary || '') ||
      startDay !== (location.startDayNumber || null) ||
      endDay !== (location.endDayNumber || null)
    setHasChanges(changed)
  }, [title, address, summary, startDay, endDay, location])

  const handleDayRangeChange = (start: number, end: number) => {
    setStartDay(start)
    setEndDay(end)
    setErrors(prev => ({ ...prev, dayRange: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeTripId) return

    // Validation
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Location name is required'
    if (!address.trim()) newErrors.address = 'Address is required'
    if (location.category === 'stay' && (startDay === null || endDay === null)) {
      newErrors.dayRange = 'Please select stay duration'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const updates: any = {
      title: title.trim(),
      address: address.trim(),
      coordinates,
      placeId,
      summary: summary.trim(),
    }

    // Add day range for stay locations
    if (location.category === 'stay') {
      updates.startDayNumber = startDay
      updates.endDayNumber = endDay
    }

    updateLocation.mutate(
      { tripId: activeTripId, locationId: location.id, updates },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?')
      if (!confirmed) return
    }
    setErrors({})
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Edit Stay Location">
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

        {/* Day Range Selector (for stay category) */}
        {location.category === 'stay' && (
          <DayRangeSelector
            startDay={startDay}
            endDay={endDay}
            onChange={handleDayRangeChange}
            error={errors.dayRange}
          />
        )}

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
            disabled={updateLocation.isPending || !hasChanges}
            className="px-4 py-2 rounded bg-[#238636] text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateLocation.isPending ? 'Updating...' : 'Update Stay'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
