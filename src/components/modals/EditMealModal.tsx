import { useState, useEffect, useCallback } from 'react'
import { BaseModal } from './BaseModal'
import {
  AddressAutocomplete,
  FamilySelector,
  TripDaySelector,
  AtHomeToggle
} from '@/components/forms'
import { useUpdateMeal, useFamilies, useActiveTripId, useLocations } from '@/hooks'
import type { Meal } from '@/types'
import type { CreateMealInput, CreateLocationInput } from '@/types/inputs'

interface EditMealModalProps {
  isOpen: boolean
  onClose: () => void
  meal: Meal
}

export function EditMealModal({ isOpen, onClose, meal }: EditMealModalProps) {
  const { data: activeTripId } = useActiveTripId()

  // Pre-populate from existing meal
  const [title, setTitle] = useState(meal.title)
  const [mealDate, setMealDate] = useState(meal.mealDate || '')
  const [mealType, setMealType] = useState<'breakfast' | 'brunch' | 'lunch' | 'dinner'>(
    (meal.mealType || 'dinner') as any
  )
  const [time, setTime] = useState(meal.timeLabel || '')
  const [status, setStatus] = useState<'Assigned' | 'Pending' | 'Confirmed'>(meal.status)
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>(
    meal.familyIds || []
  )
  const [requiresReservation, setRequiresReservation] = useState(
    meal.requiresReservation || false
  )
  const [isAtHome, setIsAtHome] = useState(false)
  const [locationData, setLocationData] = useState<CreateLocationInput | null>(null)
  const [stayLocationId, setStayLocationId] = useState<string | null>(null)
  const [note, setNote] = useState(meal.note || '')

  const { data: families = [] } = useFamilies()
  const { data: locations = [] } = useLocations(activeTripId || undefined)
  const updateMeal = useUpdateMeal()

  // Memoize the location ID callback to prevent unnecessary re-renders
  const handleLocationIdChange = useCallback((locationId: string | null) => {
    setStayLocationId(locationId)
  }, [])

  // Update form when meal prop changes
  useEffect(() => {
    setTitle(meal.title)
    setMealDate(meal.mealDate || '')
    setMealType((meal.mealType || 'dinner') as any)
    setTime(meal.timeLabel || '')
    setStatus(meal.status)
    setSelectedFamilyIds(meal.familyIds || [])
    setRequiresReservation(meal.requiresReservation || false)
    setNote(meal.note || '')

    // Pre-populate location if exists
    const mealLocation = meal.locationId
      ? locations.find(loc => loc.id === meal.locationId)
      : undefined

    if (mealLocation) {
      setLocationData({
        title: mealLocation.title,
        address: mealLocation.address,
        coordinates: mealLocation.coordinates,
        placeId: mealLocation.placeId || undefined,
        category: 'meal'
      })
    }
  }, [meal, locations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeTripId) return
    if (!title.trim() || !mealDate) {
      alert('Title and date are required')
      return
    }

    const input: Partial<CreateMealInput> = {
      title: title.trim(),
      mealDate,
      mealType,
      time: time.trim() || undefined,
      status,
      familyIds: selectedFamilyIds,
      requiresReservation,
      // Use locationId when eating at home, createLocation when searching for a place
      ...(isAtHome
        ? { locationId: stayLocationId || undefined }
        : { createLocation: locationData || undefined }
      ),
      note: note.trim() || undefined,
    }

    try {
      await updateMeal.mutateAsync({
        tripId: activeTripId,
        mealId: meal.id,
        updates: input
      })
      onClose()
    } catch (error) {
      alert('Failed to update meal. Please try again.')
      console.error(error)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Meal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Title <span className="text-[#F85149]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Dinner at The Grill"
            required
          />
        </div>

        {/* Trip Day Selector */}
        <TripDaySelector
          value={mealDate}
          onChange={(date) => setMealDate(date)}
        />

        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Meal Type <span className="text-[#F85149]">*</span>
          </label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="breakfast">Breakfast</option>
            <option value="brunch">Brunch</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        {/* Time (optional) */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Time (optional)
          </label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., 7:00 PM"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>

        {/* Families (multi-select) */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Families
          </label>
          <FamilySelector
            selectedFamilyIds={selectedFamilyIds}
            onChange={setSelectedFamilyIds}
            families={families}
          />
        </div>

        {/* Requires Reservation Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#161B22] border border-[#30363D] rounded">
          <span className="text-sm text-[#C9D1D9]">Requires Reservation</span>
          <button
            type="button"
            onClick={() => setRequiresReservation(!requiresReservation)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              requiresReservation ? 'bg-[#238636]' : 'bg-[#30363D]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                requiresReservation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* At Home Toggle */}
        <AtHomeToggle
          isAtHome={isAtHome}
          onToggle={setIsAtHome}
          currentDate={mealDate}
          onLocationIdChange={handleLocationIdChange}
          tripId={activeTripId || ''}
        />

        {/* Location (Google Places) - Hidden when at home */}
        {!isAtHome && (
          <div>
            <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
              Location
            </label>
            <AddressAutocomplete
              value={locationData?.address || ''}
              onChange={(address, place) => {
                if (!address) return

                const lat = place?.geometry?.location?.lat() ?? 0
                const lng = place?.geometry?.location?.lng() ?? 0

                setLocationData({
                  title: place?.name || address.split(',')[0],
                  address,
                  coordinates: { lat, lng },
                  placeId: place?.place_id,
                  category: 'meal' as const,
                })
              }}
              onCoordinatesChange={(lat, lng) => {
                setLocationData(prev => prev ? { ...prev, coordinates: { lat, lng } } : null)
              }}
              placeholder="Search for restaurant or venue..."
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#21262D] text-[#C9D1D9] rounded hover:bg-[#30363D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMeal.isPending}
            className="flex-1 px-4 py-2 bg-[#238636] text-white rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50"
          >
            {updateMeal.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
