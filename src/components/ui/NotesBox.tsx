import { type ChangeEvent } from 'react'
import { cn } from '@/lib/cn'

interface NotesBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function NotesBox({
  value,
  onChange,
  placeholder = 'Add notes...',
  className,
}: NotesBoxProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded',
        'text-sm text-zinc-300 placeholder:text-zinc-600',
        'focus:outline-none focus:ring-1 focus:ring-blue-500',
        'resize-none',
        className
      )}
      rows={4}
    />
  )
}
