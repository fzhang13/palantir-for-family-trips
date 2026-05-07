import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { TripDocument, PageType, EntitySelection, Entity } from '@/types'
import {
  useTripSelection,
  useTimelineSimulation,
  useExpenseCalculations,
  useActiveTripId,
} from '@/hooks'
import { useTrip } from '@/hooks/useTripQueries'

interface TripContextValue {
  // Core state
  doc: TripDocument
  updateDoc: (updater: (doc: TripDocument) => TripDocument) => void

  // Page state
  currentPage: PageType
  setCurrentPage: (page: PageType) => void

  // Selection (from useTripSelection)
  selection: EntitySelection | null
  selectedEntity: Entity | null
  selectEntity: (entityType: string, entityId: string) => void
  selectEntityByRef: (entity: Entity) => void
  clearSelection: () => void

  // Timeline (from useTimelineSimulation)
  cursorSlot: number
  isPlaying: boolean
  playbackSpeed: number
  play: () => void
  pause: () => void
  jumpToCursor: (slot: number) => void
  resetToLive: () => void
  setPlaybackSpeed: (speed: number) => void

  // Expenses (from useExpenseCalculations)
  familyBurdens: Record<string, number>
  updateExpense: (expenseId: string, updates: Partial<any>) => void
  getTotalExpenses: () => number

  // Common mutations
  updatePageNote: (page: PageType, note: string) => void
}

const TripContext = createContext<TripContextValue | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const { data: activeTripId } = useActiveTripId()
  const { data: doc, isLoading, error } = useTrip(activeTripId ?? undefined)
  const [currentPage, setCurrentPage] = useState<PageType>('itinerary')

  // Show loading state while fetching trip
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0C10]">
        <div className="w-12 h-12 border-4 border-[#30363D] border-t-[#58A6FF] rounded-full animate-spin" />
      </div>
    )
  }

  // Show error state if trip fetch failed
  if (error || !doc) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0C10]">
        <div className="max-w-md p-8 border border-[#30363D] bg-[#0D1117] rounded text-center">
          <h1 className="text-xl font-semibold text-[#E6EDF3] mb-4">
            Failed to Load Trip
          </h1>
          <p className="text-[#8B949E]">
            {error?.message || 'Unable to load trip data'}
          </p>
        </div>
      </div>
    )
  }

  // No-op function for hooks that still require onUpdateDoc
  const noopUpdateDoc = useCallback(() => {
    console.warn('updateDoc is deprecated - use React Query mutation hooks')
  }, [])

  const selection = useTripSelection(doc, currentPage, noopUpdateDoc)
  const timeline = useTimelineSimulation(doc, noopUpdateDoc)
  const expenses = useExpenseCalculations(doc, noopUpdateDoc)

  const updatePageNote = useCallback(
    (_page: PageType, _note: string) => {
      // Page notes are no longer persisted - could add Supabase mutation here if needed
      console.warn('Page notes are not persisted after LocalStorage removal')
    },
    []
  )

  const value: TripContextValue = {
    doc,
    updateDoc: () => {
      // No-op - mutations happen through React Query hooks
      console.warn('updateDoc is deprecated - use React Query mutation hooks')
    },
    currentPage,
    setCurrentPage,
    ...selection,
    ...timeline,
    ...expenses,
    updatePageNote,
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTripContext() {
  const context = useContext(TripContext)
  if (!context) {
    throw new Error('useTripContext must be used within TripProvider')
  }
  return context
}
