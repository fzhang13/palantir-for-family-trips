// src/components/ui/DayBadge.tsx
import { getDayName } from '@/lib/dateUtils'

interface DayBadgeProps {
  date: string // ISO date string
  isCheckout?: boolean
}

export function DayBadge({ date, isCheckout = false }: DayBadgeProps) {
  const dateObj = new Date(date + 'T00:00:00')
  const dayName = getDayName(dateObj).slice(0, 3) // Mon, Tue, etc.
  const day = dateObj.getDate()
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
        isCheckout ? 'bg-[#30363D] text-[#8B949E]' : 'bg-[#238636] text-white'
      }`}
    >
      {dayName} {month} {day}
      {isCheckout && ' (checkout)'}
    </span>
  )
}
