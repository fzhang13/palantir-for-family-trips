import { Edit2, Trash2, MapPin, Users, UtensilsCrossed, Clock } from 'lucide-react'
import type { Meal, Activity, Location, Family } from '@/types'

interface TimelineItemProps {
  item: Meal | Activity
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  locations?: Location[]
  families?: Family[]
}

export function TimelineItem({ item, onClick, onEdit, onDelete, locations = [], families = [] }: TimelineItemProps) {
  const isMeal = item.type === 'meal'

  // Get time/window display with enhanced formatting
  const timeDisplay = isMeal
    ? (() => {
        const meal = item as Meal
        const mealType = meal.mealType || ''
        const timeLabel = meal.timeLabel || ''

        if (timeLabel) {
          return timeLabel
        }

        // Fallback to meal type
        const typeLabels: Record<string, string> = {
          breakfast: 'Breakfast',
          brunch: 'Brunch',
          lunch: 'Lunch',
          dinner: 'Dinner'
        }
        return typeLabels[mealType] || 'Time TBD'
      })()
    : (() => {
        const activity = item as Activity
        const timePeriod = activity.timePeriod || ''
        const startTime = activity.startTime
        const endTime = activity.endTime

        if (startTime && endTime) {
          return `${startTime} - ${endTime}`
        }

        // Fallback to time period
        const periodLabels: Record<string, string> = {
          morning: 'Morning',
          afternoon: 'Afternoon',
          evening: 'Evening',
          all_day: 'All Day',
          flexible: 'Flexible'
        }
        return periodLabels[timePeriod] || activity.window || 'Window TBD'
      })()

  // Get location name
  const location = item.locationId
    ? locations.find(loc => loc.id === item.locationId)
    : undefined
  const locationName = location?.title || (item.locationId ? 'Location linked' : null)

  // Get family names
  const familyNames = isMeal
    ? (() => {
        const meal = item as Meal
        // Look up families by IDs
        if (meal.familyIds && meal.familyIds.length > 0) {
          const mealFamilies = families.filter(f => meal.familyIds?.includes(f.id))
          if (mealFamilies.length > 0) {
            return mealFamilies.map(f => f.name).join(', ')
          }
        }
        // Fallback to owner field (backward compat)
        return meal.owner || null
      })()
    : null

  // Get status badge
  const status = item.status
  const statusColors: Record<string, string> = {
    Confirmed: 'bg-[#238636] text-white',
    Pending: 'bg-[#9A6700] text-white',
    Assigned: 'bg-[#1F6FEB] text-white',
    Go: 'bg-[#238636] text-white',
    Watch: 'bg-[#9A6700] text-white',
  }
  const statusColor = statusColors[status] || 'bg-[#30363D] text-[#8B949E]'

  // Get meal type icon
  const mealTypeIcon = isMeal ? (
    <UtensilsCrossed size={14} className="text-[#8B949E]" />
  ) : (
    <Clock size={14} className="text-[#8B949E]" />
  )

  return (
    <div
      onClick={onClick}
      className="group border border-[#30363D] rounded p-3 hover:border-[#58A6FF] transition-colors bg-[#161B22] cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Time/Window with icon */}
        <div className="flex items-center gap-2 text-sm font-mono text-[#8B949E] whitespace-nowrap">
          {mealTypeIcon}
          {timeDisplay}
        </div>

        {/* Center: Title and metadata */}
        <div className="flex-1 min-w-0">
          <div className="text-[#C9D1D9] font-semibold mb-1">
            {item.title}
          </div>

          <div className="space-y-1">
            {/* Location */}
            {locationName && (
              <div className="flex items-center gap-1 text-xs text-[#8B949E]">
                <MapPin size={12} />
                <span className="truncate">{locationName}</span>
              </div>
            )}

            {/* Families (meals only) */}
            {familyNames && (
              <div className="flex items-center gap-1 text-xs text-[#8B949E]">
                <Users size={12} />
                <span className="truncate">{familyNames}</span>
              </div>
            )}

            {/* Reservation indicator (meals only) */}
            {isMeal && (item as Meal).requiresReservation && (
              <div className="flex items-center gap-1 text-xs text-[#F0883E]">
                <span>⚠️ Reservation required</span>
              </div>
            )}

            {/* Weather indicator (activities only) */}
            {!isMeal && (item as Activity).weatherSensitivity && (
              <div className="flex items-center gap-1 text-xs text-[#8B949E]">
                <span>
                  Weather: {(item as Activity).weatherSensitivity}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Status and Actions */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
            {status}
          </span>

          {/* Action buttons - show on hover */}
          <div className="hidden group-hover:flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1.5 rounded text-[#8B949E] hover:text-[#58A6FF] hover:bg-[#21262D] transition-colors"
              aria-label={`Edit ${item.title}`}
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1.5 rounded text-[#8B949E] hover:text-[#DA3633] hover:bg-[#21262D] transition-colors"
              aria-label={`Delete ${item.title}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
