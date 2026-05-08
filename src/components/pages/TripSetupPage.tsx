import { useState } from 'react'
import { useCreateTrip } from '@/hooks'

export function TripSetupPage() {
  const [tripName, setTripName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timezone, setTimezone] = useState('America/Los_Angeles')
  const [error, setError] = useState('')

  const createTrip = useCreateTrip()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!tripName.trim() || !startDate || !endDate) {
      setError('All fields are required')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date')
      return
    }

    createTrip.mutate({
      title: tripName.trim(),
      start_date: startDate,
      end_date: endDate,
      timezone,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg w-full max-w-md mx-4 p-8">
        <h1 className="text-2xl font-bold text-[#C9D1D9] mb-2">Set Up Your Trip</h1>
        <p className="text-sm text-[#8B949E] mb-6">Let's start by configuring your trip details</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={createTrip.isPending}
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
                disabled={createTrip.isPending}
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
                disabled={createTrip.isPending}
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
              disabled={createTrip.isPending}
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

          {/* Trip Duration Info */}
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

          {/* Error Message */}
          {(error || createTrip.error) && (
            <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 rounded">
              <p className="text-sm text-[#F85149]">
                {error || (createTrip.error as Error)?.message || 'Failed to create trip'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createTrip.isPending}
            className="w-full px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createTrip.isPending ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Trip'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
