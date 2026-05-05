import { type ReactNode } from 'react'

interface SectionTitleProps {
  eyebrow?: string
  title: string | ReactNode
  meta?: string | ReactNode
}

export function SectionTitle({ eyebrow, title, meta }: SectionTitleProps) {
  return (
    <div className="mb-4 pb-3 border-b border-zinc-800">
      {eyebrow && (
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
          {eyebrow}
        </div>
      )}
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
        {meta && <div className="text-sm text-zinc-400">{meta}</div>}
      </div>
    </div>
  )
}
