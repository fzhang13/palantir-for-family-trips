import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useArchiveTrip, useActiveTripId } from '@/hooks'

interface TripSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentTrip: {
    title: string
    start_date: string | null
    end_date: string | null
    timezone: string
  } | null
  onSave: (updates: {
    tripName: string
    startDate: string
    endDate: string
    timezone: string
  }) => void
}

export function TripSettingsModal({
  isOpen,
  onClose,
  currentTrip,
  onSave,
}: TripSettingsModalProps) {
  const [tripName, setTripName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timezone, setTimezone] = useState('America/Los_Angeles')
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const archiveTrip = useArchiveTrip()
  const { data: activeTripId } = useActiveTripId()

  useEffect(() => {
    if (currentTrip) {
      setTripName(currentTrip.title || '')
      setStartDate(currentTrip.start_date || '')
      setEndDate(currentTrip.end_date || '')
      setTimezone(currentTrip.timezone || 'America/Los_Angeles')
    }
    // Reset confirmation dialog when modal closes
    if (!isOpen) {
      setShowArchiveConfirm(false)
    }
  }, [currentTrip, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tripName.trim() || !startDate || !endDate) {
      return
    }

    // Validate end date is after start date
    if (new Date(endDate) < new Date(startDate)) {
      alert('End date must be after start date')
      return
    }

    onSave({
      tripName: tripName.trim(),
      startDate,
      endDate,
      timezone,
    })
    onClose()
  }

  const handleArchive = () => {
    if (!activeTripId) return

    archiveTrip.mutate(activeTripId, {
      onSuccess: () => {
        setShowArchiveConfirm(false)
        onClose()
      },
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#30363D]">
          <h2 className="text-xl font-bold text-[#C9D1D9]">Trip Settings</h2>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-[#C9D1D9] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
              Trip Name <span className="text-[#F85149]">*</span>
            </label>
            <input
              type="text"
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              placeholder="e.g., Summer Family Vacation 2026"
              className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] placeholder-[#6E7681] focus:border-[#58A6FF] focus:outline-none"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
                Start Date <span className="text-[#F85149]">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
                End Date <span className="text-[#F85149]">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Phoenix">Arizona (no DST)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
            </select>
          </div>

          {/* Info */}
          {startDate && endDate && (
            <div className="p-3 bg-[#0A0C10] border border-[#30363D] rounded">
              <p className="text-xs text-[#8B949E]">
                Trip duration:{' '}
                <span className="text-[#C9D1D9] font-medium">
                  {Math.ceil(
                    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1}{' '}
                  days
                </span>
              </p>
            </div>
          )}

          {/* Archive Section */}
          <div className="pt-6 border-t border-[#30363D]">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-[#C9D1D9] mb-1">Archive Trip</h3>
                <p className="text-xs text-[#8B949E]">
                  Archive this trip when it's completed. Archived trips can be restored later.
                </p>
              </div>

              {!showArchiveConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowArchiveConfirm(true)}
                  className="px-4 py-2 bg-[#DA3633] text-white text-sm font-medium rounded hover:bg-[#F85149] transition-colors"
                >
                  Archive Trip
                </button>
              ) : (
                <div className="p-4 bg-[#0A0C10] border border-[#DA3633] rounded space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#DA3633]/20 flex items-center justify-center mt-0.5">
                      <span className="text-[#DA3633] text-xs font-bold">!</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#C9D1D9]">Are you sure?</p>
                      <p className="text-xs text-[#8B949E] mt-1">
                        This will archive the trip and return you to the trip selection page. You
                        can restore it later from the Archives.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowArchiveConfirm(false)}
                      className="px-3 py-1.5 text-sm text-[#C9D1D9] hover:bg-[#30363D] rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleArchive}
                      disabled={archiveTrip.isPending}
                      className="px-3 py-1.5 bg-[#DA3633] text-white text-sm font-medium rounded hover:bg-[#F85149] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {archiveTrip.isPending ? 'Archiving...' : 'Yes, Archive Trip'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#C9D1D9] hover:bg-[#30363D] rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
