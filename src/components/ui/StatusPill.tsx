import { memo, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ToneName =
  | 'default'
  | 'Transit'
  | 'Activity'
  | 'Meal'
  | 'Critical'
  | 'Warning'
  | 'Success'

interface StatusPillProps {
  children: ReactNode
  tone?: ToneName
  className?: string
}

export const StatusPill = memo(function StatusPill({
  children,
  tone = 'default',
  className,
}: StatusPillProps) {
  const toneClasses = {
    default: 'bg-zinc-800 text-zinc-300',
    Transit: 'bg-blue-900/30 text-blue-400',
    Activity: 'bg-green-900/30 text-green-400',
    Meal: 'bg-amber-900/30 text-amber-400',
    Critical: 'bg-red-900/30 text-red-400',
    Warning: 'bg-yellow-900/30 text-yellow-400',
    Success: 'bg-green-900/30 text-green-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  )
})
