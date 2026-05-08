import { TimelineItem } from './TimelineItem'
import type { Meal, Activity, Location, Family } from '@/types'

interface TimelineGroupProps {
  dayId: string
  dayLabel: string
  items: (Meal | Activity)[]
  onItemClick: (item: Meal | Activity) => void
  onEdit: (item: Meal | Activity) => void
  onDelete: (itemId: string) => void
  locations?: Location[]
  families?: Family[]
}

export function TimelineGroup({
  dayLabel,
  items,
  onItemClick,
  onEdit,
  onDelete,
  locations,
  families,
}: TimelineGroupProps) {
  // Sort items by time
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === 'meal' && b.type === 'meal') {
      const mealA = a as Meal
      const mealB = b as Meal

      // Try sorting by mealType order (breakfast -> dinner)
      const mealTypeA = mealA.mealType || ''
      const mealTypeB = mealB.mealType || ''

      const mealTypeOrder: Record<string, number> = {
        breakfast: 1,
        brunch: 2,
        lunch: 3,
        dinner: 4,
      }

      const orderA = mealTypeOrder[mealTypeA] || 99
      const orderB = mealTypeOrder[mealTypeB] || 99

      if (orderA !== orderB) {
        return orderA - orderB
      }

      // Fallback to startSlot (backward compat)
      return mealA.startSlot - mealB.startSlot
    }

    if (a.type === 'activity' && b.type === 'activity') {
      const activityA = a as Activity
      const activityB = b as Activity

      // Try sorting by startTime
      const startTimeA = activityA.startTime
      const startTimeB = activityB.startTime

      if (startTimeA && startTimeB) {
        return startTimeA.localeCompare(startTimeB)
      }

      // Fallback to time period order
      const timePeriodA = activityA.timePeriod || ''
      const timePeriodB = activityB.timePeriod || ''

      const periodOrder: Record<string, number> = {
        morning: 1,
        afternoon: 2,
        evening: 3,
        all_day: 4,
        flexible: 5,
      }

      const orderA = periodOrder[timePeriodA] || 99
      const orderB = periodOrder[timePeriodB] || 99

      if (orderA !== orderB) {
        return orderA - orderB
      }

      // Final fallback to title
      return activityA.title.localeCompare(activityB.title)
    }

    // Mixed types: meals before activities
    return a.type === 'meal' ? -1 : 1
  })

  return (
    <div className="mb-8">
      {/* Day Header */}
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E] mb-3">
        {dayLabel}
      </div>

      {/* Timeline Items */}
      <div className="border-l-2 border-[#30363D] pl-4 space-y-3">
        {sortedItems.length === 0 ? (
          <div className="text-sm text-[#8B949E] italic">
            No {items[0]?.type === 'meal' ? 'meals' : 'activities'} scheduled
          </div>
        ) : (
          sortedItems.map(item => (
            <TimelineItem
              key={item.id}
              item={item}
              onClick={() => onItemClick(item)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
              locations={locations}
              families={families}
            />
          ))
        )}
      </div>
    </div>
  )
}
