import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useTripMetadata } from '@/hooks'

interface AtHomeToggleProps {
  isAtHome: boolean
  onToggle: (isAtHome: boolean) => void
  currentDate: string // ISO date to find stay location
  onLocationIdChange: (locationId: string | null) => void
  tripId: string
}

export function AtHomeToggle({
  isAtHome,
  onToggle,
  currentDate,
  onLocationIdChange,
  tripId
}: AtHomeToggleProps) {
  // Get trip metadata to calculate day number
  const { data: tripMeta } = useTripMetadata(tripId)

  // Query stay location for the selected date
  const { data: stayLocation, isLoading } = useQuery({
    queryKey: ['stay-location', currentDate, tripId],
    queryFn: async () => {
      if (!supabase || !currentDate || !tripMeta?.start_date) {
        return null
      }

      // Calculate day number from trip start date
      const tripStart = new Date(tripMeta.start_date)
      const mealDate = new Date(currentDate)
      const diffInMs = mealDate.getTime() - tripStart.getTime()
      const dayNumber = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1

      // Find the stay that covers this day number
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('trip_id', tripId)
        .eq('category', 'stay')
        .lte('start_day_number', dayNumber)
        .gte('end_day_number', dayNumber)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: isAtHome && !!currentDate && !!tripMeta
  })

  // Set location ID when toggle is ON and location is found
  useEffect(() => {
    if (isAtHome && stayLocation) {
      onLocationIdChange(stayLocation.id)
    } else if (!isAtHome) {
      // Clear location ID when toggled off
      onLocationIdChange(null)
    }
  }, [isAtHome, stayLocation, onLocationIdChange])

  // Warning if no stay location found
  const showWarning = isAtHome && !isLoading && !stayLocation && currentDate

  return (
    <div className="space-y-2">
      {/* Toggle */}
      <div className="flex items-center justify-between p-3 bg-[#161B22] border border-[#30363D] rounded">
        <span className="text-sm text-[#C9D1D9]">Eating at home</span>
        <button
          type="button"
          onClick={() => onToggle(!isAtHome)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isAtHome ? 'bg-[#238636]' : 'bg-[#30363D]'
          }`}
          aria-label={isAtHome ? 'Turn off at home mode' : 'Turn on at home mode'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAtHome ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Warning if no stay location */}
      {showWarning && (
        <div className="p-3 bg-[#F0883E]/10 border border-[#F0883E]/30 rounded">
          <p className="text-sm text-[#F0883E]">
            ⚠️ No stay location found for this date
          </p>
          <p className="text-xs text-[#8B949E] mt-1">
            Please add a stay first or search for a location manually.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <p className="text-xs text-[#8B949E]">Finding stay location...</p>
      )}

      {/* Auto-filled location indicator */}
      {isAtHome && stayLocation && !isLoading && (
        <div className="p-2 bg-[#1a1f2e] border border-[#58A6FF] rounded">
          <p className="text-xs text-[#8B949E]">
            ✓ Auto-filled: {stayLocation.title}
          </p>
        </div>
      )}
    </div>
  )
}
