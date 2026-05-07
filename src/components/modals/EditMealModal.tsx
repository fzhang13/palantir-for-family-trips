import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import { useUpdateMeal, useLocations } from '@/hooks'
import { DEFAULT_TRIP_ID } from '@/lib/constants'
import type { Meal } from '@/types'

interface EditMealModalProps {
  isOpen: boolean
  onClose: () => void
  meal: Meal
}

export function EditMealModal({ isOpen, onClose, meal }: EditMealModalProps) {
  const [title, setTitle] = useState(meal.title)
  const [dayId, setDayId] = useState(meal.dayId)
  const [timeLabel, setTimeLabel] = useState(meal.timeLabel || '')
  const [status, setStatus] = useState(meal.status)
  const [owner, setOwner] = useState(meal.owner || '')
  const [reservationType, setReservationType] = useState(meal.reservationType || '')
  const [locationId, setLocationId] = useState(meal.locationId || '')
  const [note, setNote] = useState(meal.note || '')

  const { data: locations = [] } = useLocations()
  const updateMeal = useUpdateMeal()

  const mealLocations = locations.filter(loc => loc.category === 'meal')

  // Update form when meal prop changes
  useEffect(() => {
    setTitle(meal.title)
    setDayId(meal.dayId)
    setTimeLabel(meal.timeLabel || '')
    setStatus(meal.status)
    setOwner(meal.owner || '')
    setReservationType(meal.reservationType || '')
    setLocationId(meal.locationId || '')
    setNote(meal.note || '')
  }, [meal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Title is required')
      return
    }

    const updates: Partial<Meal> = {
      title: title.trim(),
      dayId,
      timeLabel: timeLabel.trim() || '',
      status,
      owner: owner.trim() || '',
      reservationType: reservationType.trim() || '',
      locationId: locationId || undefined,
      note: note.trim() || '',
    }

    try {
      await updateMeal.mutateAsync({
        tripId: DEFAULT_TRIP_ID,
        mealId: meal.id,
        updates
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
            required
          />
        </div>

        {/* Day */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Day <span className="text-[#F85149]">*</span>
          </label>
          <select
            value={dayId}
            onChange={(e) => setDayId(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="thu">Thursday</option>
            <option value="fri">Friday</option>
            <option value="sat">Saturday</option>
            <option value="sun">Sunday</option>
            <option value="mon">Monday</option>
            <option value="tue">Tuesday</option>
            <option value="wed">Wednesday</option>
          </select>
        </div>

        {/* Time Label */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Time
          </label>
          <input
            type="text"
            value={timeLabel}
            onChange={(e) => setTimeLabel(e.target.value)}
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
            onChange={(e) => setStatus(e.target.value as 'Assigned' | 'Pending' | 'Confirmed')}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>

        {/* Owner */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Owner
          </label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          />
        </div>

        {/* Reservation Type */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Reservation Type
          </label>
          <input
            type="text"
            value={reservationType}
            onChange={(e) => setReservationType(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Location
          </label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="">None</option>
            {mealLocations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.title}
              </option>
            ))}
          </select>
        </div>

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
