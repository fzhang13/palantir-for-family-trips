import { useMemo } from 'react'
import { useTripMetadata, useActiveTripId } from '@/hooks'
import { formatFullDate } from '@/lib/dateUtils'

interface SimpleDaySelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  tripId?: string
}

export function SimpleDaySelector({
  value,
  onChange,
  error,
  tripId: propTripId,
}: SimpleDaySelectorProps) {
  const { data: activeTripId } = useActiveTripId()
  const tripId = propTripId || activeTripId
  const { data: tripMetadata, isLoading } = useTripMetadata(tripId || '')

  // Generate day options based on trip duration
  const dayOptions = useMemo(() => {
    if (!tripMetadata?.start_date || !tripMetadata?.end_date) return []

    const startDate = new Date(tripMetadata.start_date + 'T00:00:00')
    const endDate = new Date(tripMetadata.end_date + 'T00:00:00')
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include the last day

    return Array.from({ length: diffDays }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      return {
        value: `day${i + 1}`,
        label: `Day ${i + 1} - ${formatFullDate(date)}`,
      }
    })
  }, [tripMetadata])

  if (isLoading) {
    return <div className="text-sm text-[#8B949E]">Loading trip days...</div>
  }

  if (dayOptions.length === 0) {
    return <div className="text-sm text-[#F0883E]">Please set trip dates in Settings first.</div>
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#C9D1D9] mb-1">Arrival Day</label>

      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
      >
        <option value="">Select a day...</option>
        {dayOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-[#F85149]">{error}</p>}
    </div>
  )
}
