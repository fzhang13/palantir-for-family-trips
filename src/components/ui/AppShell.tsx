import { type ReactNode, useState } from 'react'
import { Settings } from 'lucide-react'
import { PAGE_ICONS } from '@/lib/constants'
import type { PageType } from '@/types'
import { TripSettingsModal } from '@/components/modals'
import { useTripMetadata, useUpdateTripMetadata, useActiveTripId } from '@/hooks'

interface AppShellProps {
  currentPage: PageType
  onPageChange: (page: PageType) => void
  children: ReactNode
}

export function AppShell({ currentPage, onPageChange, children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { data: activeTripId } = useActiveTripId()
  const { data: tripMetadata } = useTripMetadata(activeTripId || undefined)
  const updateTripMetadata = useUpdateTripMetadata()

  const navItems: Array<{ id: PageType; label: string }> = [
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'stay', label: 'Stay' },
    { id: 'meals', label: 'Meals' },
    { id: 'activities', label: 'Activities' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'families', label: 'Families' },
  ]

  const handleSaveSettings = (updates: {
    tripName: string
    startDate: string
    endDate: string
    timezone: string
  }) => {
    if (!activeTripId) return
    updateTripMetadata.mutate({
      tripId: activeTripId,
      metadata: updates,
    })
  }

  return (
    <div className="h-screen flex flex-col bg-[#0A0C10] text-zinc-100">
      {/* Header */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-zinc-800 bg-[#161B22]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-300">
            {tripMetadata?.title || 'Family Trip Command Center'}
          </span>
          {tripMetadata?.start_date && tripMetadata?.end_date && (
            <span className="text-xs text-[#8B949E]">
              {new Date(tripMetadata.start_date).toLocaleDateString()} -{' '}
              {new Date(tripMetadata.end_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#30363D] rounded transition-colors"
          title="Trip Settings"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
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

      {/* Trip Settings Modal */}
      <TripSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTrip={tripMetadata || null}
        onSave={handleSaveSettings}
      />
    </div>
  )
}
