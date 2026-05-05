import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { TripDocument, PageType, EntitySelection, Entity } from '@/types'
import {
  usePersistedTripState,
  useTripSelection,
  useTimelineSimulation,
  useExpenseCalculations,
} from '@/hooks'

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
  const [doc, updateDoc] = usePersistedTripState()
  const [currentPage, setCurrentPage] = useState<PageType>('itinerary')

  const selection = useTripSelection(doc, currentPage, updateDoc)
  const timeline = useTimelineSimulation(doc, updateDoc)
  const expenses = useExpenseCalculations(doc, updateDoc)

  const updatePageNote = useCallback(
    (page: PageType, note: string) => {
      updateDoc((doc) => ({
        ...doc,
        pageNotes: { ...doc.pageNotes, [page]: note },
      }))
    },
    [updateDoc]
  )

  const value: TripContextValue = {
    doc,
    updateDoc,
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
