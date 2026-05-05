import { type ReactNode } from 'react'
import { PAGE_ICONS } from '@/lib/constants'
import type { PageType } from '@/types'

interface AppShellProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  children: ReactNode
}

export function AppShell({ currentPage, onPageChange, children }: AppShellProps) {
  const navItems: Array<{ id: PageType; label: string }> = [
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'stay', label: 'Stay' },
    { id: 'meals', label: 'Meals' },
    { id: 'activities', label: 'Activities' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'families', label: 'Families' },
  ]

  return (
    <div className="h-screen flex flex-col bg-[#0A0C10] text-zinc-100">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-zinc-800 bg-[#161B22]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-300">
            Family Trip Command Center
          </span>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar nav */}
        <nav className="w-48 border-r border-zinc-800 bg-[#161B22] overflow-y-auto">
          <div className="p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = PAGE_ICONS[item.id]
              const isActive = currentPage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded text-sm
                    transition-colors
                    ${
                      isActive
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                    }
                  `}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
