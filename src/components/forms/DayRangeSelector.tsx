import { useTripMetadata, useActiveTripId } from '@/hooks'
import { formatFullDate } from '@/lib/dateUtils'

interface DayRangeSelectorProps {
  startDay: number | null
  endDay: number | null
  onChange: (startDay: number, endDay: number) => void
  error?: string
  tripId?: string
}

export function DayRangeSelector({
  startDay,
  endDay,
  onChange,
  error,
  tripId: propTripId,
}: DayRangeSelectorProps) {
  const { data: activeTripId } = useActiveTripId()
  const tripId = propTripId || activeTripId
  const { data: tripMetadata, isLoading } = useTripMetadata(tripId || '')

  // Calculate trip days
  const tripDays: Array<{ dayNumber: number; date: Date; label: string }> = []
  if (tripMetadata?.start_date && tripMetadata?.end_date) {
    const startDate = new Date(tripMetadata.start_date + 'T00:00:00')
    const endDate = new Date(tripMetadata.end_date + 'T00:00:00')
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      tripDays.push({
        dayNumber: i + 1,
        date,
        label: `Day ${i + 1} - ${formatFullDate(date)}`,
      })
    }
  }

  const handleStartDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStartDay = parseInt(e.target.value)
    if (!isNaN(newStartDay)) {
      // If end day is not set or is before new start day, set it to new start day
      const newEndDay = !endDay || endDay < newStartDay ? newStartDay : endDay
      onChange(newStartDay, newEndDay)
    }
  }

  const handleEndDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEndDay = parseInt(e.target.value)
    if (!isNaN(newEndDay) && startDay) {
      onChange(startDay, newEndDay)
    }
  }

  if (isLoading) {
    return <div className="text-sm text-[#8B949E]">Loading trip days...</div>
  }

  if (tripDays.length === 0) {
    return <div className="text-sm text-[#F0883E]">Please set trip dates in Settings first.</div>
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
        Stay Duration <span className="text-[#F85149]">*</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Start Day */}
        <div>
          <label className="block text-xs text-[#8B949E] mb-1">From</label>
          <select
            value={startDay || ''}
            onChange={handleStartDayChange}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            required
          >
            <option value="">Select start day...</option>
            {tripDays.map(day => (
              <option key={day.dayNumber} value={day.dayNumber}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* End Day */}
        <div>
          <label className="block text-xs text-[#8B949E] mb-1">To</label>
          <select
            value={endDay || ''}
            onChange={handleEndDayChange}
            disabled={!startDay}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none disabled:opacity-50"
            required
          >
            <option value="">Select end day...</option>
            {tripDays
              .filter(day => !startDay || day.dayNumber >= startDay)
              .map(day => (
                <option key={day.dayNumber} value={day.dayNumber}>
                  {day.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      {startDay && endDay && (
        <p className="mt-2 text-xs text-[#8B949E]">
          Duration: {endDay - startDay + 1} {endDay - startDay === 0 ? 'day' : 'days'}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-[#F85149]">{error}</p>}
    </div>
  )
}
