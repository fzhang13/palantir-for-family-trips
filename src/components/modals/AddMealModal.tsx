// src/components/modals/AddMealModal.tsx
import { useState, useEffect, useCallback } from 'react'
import { BaseModal } from './BaseModal'
import {
  AddressAutocomplete,
  FamilySelector,
  TripDaySelector,
  AtHomeToggle,
} from '@/components/forms'
import { useAddMeal, useFamilies, useActiveTripId } from '@/hooks'
import { useMealsForConflictCheck } from '@/hooks/useTripQueries'
import { checkMealConflicts } from '@/lib/conflictDetection'
import type { CreateMealInput, CreateLocationInput } from '@/types/inputs'

interface AddMealModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddMealModal({ isOpen, onClose }: AddMealModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const [title, setTitle] = useState('')
  const [mealDate, setMealDate] = useState('')
  const [mealType, setMealType] = useState<'breakfast' | 'brunch' | 'lunch' | 'dinner'>('dinner')
  const [status, setStatus] = useState<'Assigned' | 'Pending' | 'Confirmed'>('Pending')
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>([])
  const [requiresReservation, setRequiresReservation] = useState(false)
  const [isAtHome, setIsAtHome] = useState(false)
  const [locationData, setLocationData] = useState<CreateLocationInput | null>(null)
  const [stayLocationId, setStayLocationId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const { data: families = [] } = useFamilies()
  const { data: existingMeals = [] } = useMealsForConflictCheck(activeTripId || '')
  const addMeal = useAddMeal()

  // Memoize the location ID callback to prevent unnecessary re-renders
  const handleLocationIdChange = useCallback((locationId: string | null) => {
    setStayLocationId(locationId)
  }, [])

  // Conflict detection
  const [conflict, setConflict] = useState<{ hasConflict: boolean; message: string }>({
    hasConflict: false,
    message: '',
  })

  useEffect(() => {
    if (mealDate && mealType) {
      const check = checkMealConflicts(existingMeals, mealDate, mealType)
      if (check.hasConflict) {
        const conflictMeal = check.conflicts[0]
        setConflict({
          hasConflict: true,
          message: `You already have ${mealType} on ${new Date(mealDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (${conflictMeal.title})`,
        })
      } else {
        setConflict({ hasConflict: false, message: '' })
      }
    }
  }, [mealDate, mealType, existingMeals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeTripId) return
    if (!title.trim() || !mealDate) {
      alert('Title and date are required')
      return
    }

    const input: CreateMealInput = {
      title: title.trim(),
      mealDate,
      mealType,
      status,
      requiresReservation,
      familyIds: selectedFamilyIds,
      note: note.trim() || undefined,
      // Use locationId when eating at home, createLocation when searching for a place
      ...(isAtHome
        ? { locationId: stayLocationId || undefined }
        : { createLocation: locationData || undefined }),
      // Keep old fields for backward compatibility
      dayId: 'thu', // Will be ignored by new logic
    }

    try {
      await addMeal.mutateAsync({ tripId: activeTripId, input })
      handleClose()
    } catch (error) {
      alert('Failed to add meal. Please try again.')
      console.error(error)
    }
  }

  const handleClose = () => {
    setTitle('')
    setMealDate('')
    setMealType('dinner')
    setStatus('Pending')
    setSelectedFamilyIds([])
    setRequiresReservation(false)
    setIsAtHome(false)
    setLocationData(null)
    setNote('')
    setConflict({ hasConflict: false, message: '' })
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add Meal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Title <span className="text-[#F85149]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Dinner at The Grill"
            required
          />
        </div>

        {/* Trip Day Selector (replaces date picker) */}
        <TripDaySelector
          value={mealDate}
          onChange={date => {
            setMealDate(date)
          }}
          error={!mealDate ? 'Please select a day' : undefined}
        />

        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Meal Type <span className="text-[#F85149]">*</span>
          </label>
          <select
            value={mealType}
            onChange={e => setMealType(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="breakfast">Breakfast</option>
            <option value="brunch">Brunch</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        {/* Conflict Warning */}
        {conflict.hasConflict && (
          <div className="p-3 bg-[#F0883E]/10 border border-[#F0883E]/30 rounded">
            <p className="text-sm text-[#F0883E]">⚠️ {conflict.message}</p>
            <p className="text-xs text-[#8B949E] mt-1">You can still save this meal.</p>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>

        {/* Owners (Family Selector) */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Owners</label>
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
            <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Location</label>
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
                setLocationData(prev => (prev ? { ...prev, coordinates: { lat, lng } } : null))
              }}
              placeholder="Search for restaurant or venue..."
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Notes</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-[#21262D] text-[#C9D1D9] rounded hover:bg-[#30363D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addMeal.isPending}
            className="flex-1 px-4 py-2 bg-[#238636] text-white rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50"
          >
            {addMeal.isPending ? 'Adding...' : 'Add Meal'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
