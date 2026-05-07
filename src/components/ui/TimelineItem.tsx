import { Edit2, Trash2, MapPin } from 'lucide-react'
import type { Meal, Activity } from '@/types'

interface TimelineItemProps {
  item: Meal | Activity
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TimelineItem({ item, onClick, onEdit, onDelete }: TimelineItemProps) {
  const isMeal = item.type === 'meal'

  // Get time/window display
  const timeDisplay = isMeal
    ? (item as Meal).timeLabel || 'Time TBD'
    : (item as Activity).window || 'Window TBD'

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

  return (
    <div
      onClick={onClick}
      className="group border border-[#30363D] rounded p-3 hover:border-[#58A6FF] transition-colors bg-[#161B22] cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Time/Window */}
        <div className="text-sm font-mono text-[#8B949E] whitespace-nowrap">
          {timeDisplay}
        </div>

        {/* Center: Title and Location */}
        <div className="flex-1 min-w-0">
          <div className="text-[#C9D1D9] font-semibold mb-1">
            {item.title}
          </div>
          {item.locationId && (
            <div className="flex items-center gap-1 text-xs text-[#8B949E]">
              <MapPin size={12} />
              <span>Location linked</span>
            </div>
          )}
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
