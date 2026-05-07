import { useMemo } from 'react'
import { useActiveTrips } from '@/hooks'
import { generateDaysInRange, formatFullDate } from '@/lib/dateUtils'

interface TripDaySelectorProps {
  value: string // ISO date string (e.g., "2026-05-08")
  onChange: (date: string, tripId: string, dayNumber: number) => void
  showAllTrips?: boolean // default: true
  error?: string
}

interface DayOption {
  tripId: string
  tripName: string
  dayNumber: number
  date: string // ISO string
  label: string
}

export function TripDaySelector({
  value,
  onChange,
  showAllTrips = true,
  error
}: TripDaySelectorProps) {
  const { data: activeTrips, isLoading } = useActiveTrips()

  // Generate day options for all active trips
  const dayOptions = useMemo<DayOption[]>(() => {
    if (!activeTrips || !showAllTrips) return []

    return activeTrips.flatMap(trip => {
      if (!trip.start_date || !trip.end_date) return []

      const startDate = new Date(trip.start_date + 'T00:00:00')
      const endDate = new Date(trip.end_date + 'T00:00:00')
      const days = generateDaysInRange(startDate, endDate)

      return days.map((date, index) => ({
        tripId: trip.id,
        tripName: trip.title,
        dayNumber: index + 1,
        date: date.toISOString().split('T')[0],
        label: `${trip.title} - Day ${index + 1} - ${formatFullDate(date)}`
      }))
    })
  }, [activeTrips, showAllTrips])

  // Handle selection change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDate = e.target.value
    const option = dayOptions.find(opt => opt.date === selectedDate)

    if (option) {
      onChange(option.date, option.tripId, option.dayNumber)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
        Trip Day <span className="text-[#F85149]">*</span>
      </label>

      <select
        value={value}
        onChange={handleChange}
        disabled={isLoading}
        className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none disabled:opacity-50"
      >
        <option value="">Select a day...</option>
        {dayOptions.map(option => (
          <option key={`${option.tripId}-${option.date}`} value={option.date}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-[#F85149]">{error}</p>
      )}

      {isLoading && (
        <p className="mt-1 text-xs text-[#8B949E]">Loading trips...</p>
      )}

      {!isLoading && dayOptions.length === 0 && (
        <p className="mt-1 text-xs text-[#F0883E]">
          No active trips found. Please create a trip first.
        </p>
      )}
    </div>
  )
}
