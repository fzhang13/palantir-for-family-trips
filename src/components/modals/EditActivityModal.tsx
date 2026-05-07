import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import { useUpdateActivity, useLocations } from '@/hooks'
import { DEFAULT_TRIP_ID } from '@/lib/constants'
import type { Activity } from '@/types'

interface EditActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity
}

export function EditActivityModal({ isOpen, onClose, activity }: EditActivityModalProps) {
  const [title, setTitle] = useState(activity.title)
  const [dayId, setDayId] = useState(activity.dayId)
  const [window, setWindow] = useState(activity.window || '')
  const [status, setStatus] = useState(activity.status)
  const [riskLevel, setRiskLevel] = useState(activity.riskLevel || '')
  const [weatherSensitivity, setWeatherSensitivity] = useState(activity.weatherSensitivity || '')
  const [locationId, setLocationId] = useState(activity.locationId || '')
  const [description, setDescription] = useState(activity.description || '')
  const [backup, setBackup] = useState(activity.backup || '')
  const [note, setNote] = useState(activity.note || '')

  const { data: locations = [] } = useLocations()
  const updateActivity = useUpdateActivity()

  const activityLocations = locations.filter(loc => loc.category === 'park')

  // Update form when activity prop changes
  useEffect(() => {
    setTitle(activity.title)
    setDayId(activity.dayId)
    setWindow(activity.window || '')
    setStatus(activity.status)
    setRiskLevel(activity.riskLevel || '')
    setWeatherSensitivity(activity.weatherSensitivity || '')
    setLocationId(activity.locationId || '')
    setDescription(activity.description || '')
    setBackup(activity.backup || '')
    setNote(activity.note || '')
  }, [activity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Title is required')
      return
    }

    const updates: Partial<Activity> = {
      title: title.trim(),
      dayId,
      window: window.trim() || '',
      status,
      riskLevel: riskLevel.trim() || '',
      weatherSensitivity: weatherSensitivity.trim() || '',
      locationId: locationId || undefined,
      description: description.trim() || '',
      backup: backup.trim() || '',
      note: note.trim() || '',
    }

    try {
      await updateActivity.mutateAsync({
        tripId: DEFAULT_TRIP_ID,
        activityId: activity.id,
        updates
      })
      onClose()
    } catch (error) {
      alert('Failed to update activity. Please try again.')
      console.error(error)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Activity">
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

        {/* Window */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Time Window
          </label>
          <input
            type="text"
            value={window}
            onChange={(e) => setWindow(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Go' | 'Watch')}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="Go">Go</option>
            <option value="Watch">Watch</option>
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Risk Level
          </label>
          <input
            type="text"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          />
        </div>

        {/* Weather Sensitivity */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Weather Sensitivity
          </label>
          <input
            type="text"
            value={weatherSensitivity}
            onChange={(e) => setWeatherSensitivity(e.target.value)}
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
            {activityLocations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.title}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          />
        </div>

        {/* Backup Plan */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Backup Plan
          </label>
          <textarea
            value={backup}
            onChange={(e) => setBackup(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
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
            disabled={updateActivity.isPending}
            className="flex-1 px-4 py-2 bg-[#238636] text-white rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50"
          >
            {updateActivity.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
