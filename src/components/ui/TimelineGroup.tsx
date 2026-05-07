import { TimelineItem } from './TimelineItem'
import type { Meal, Activity } from '@/types'

interface TimelineGroupProps {
  dayId: string
  dayLabel: string
  items: (Meal | Activity)[]
  onItemClick: (item: Meal | Activity) => void
  onEdit: (item: Meal | Activity) => void
  onDelete: (itemId: string) => void
}

export function TimelineGroup({
  dayLabel,
  items,
  onItemClick,
  onEdit,
  onDelete,
}: TimelineGroupProps) {
  // Sort items by startSlot for meals, title for activities
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === 'meal' && b.type === 'meal') {
      return a.startSlot - b.startSlot
    }
    return a.title.localeCompare(b.title)
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
          sortedItems.map((item) => (
            <TimelineItem
              key={item.id}
              item={item}
              onClick={() => onItemClick(item)}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
