import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

interface ActiveTripContextValue {
  activeTripId: string | null
  setActiveTripId: (id: string | null) => void
  isLoading: boolean
}

const ActiveTripContext = createContext<ActiveTripContextValue | null>(null)

export function ActiveTripProvider({ children }: { children: ReactNode }) {
  const [activeTripId, setActiveTripIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem('activeTrip_id')
    if (storedId) {
      setActiveTripIdState(storedId)
    }
    setIsLoading(false)
  }, [])

  const setActiveTripId = (id: string | null) => {
    setActiveTripIdState(id)
    if (id) {
      localStorage.setItem('activeTrip_id', id)
    } else {
      localStorage.removeItem('activeTrip_id')
    }
  }

  const value: ActiveTripContextValue = {
    activeTripId,
    setActiveTripId,
    isLoading,
  }

  return (
    <ActiveTripContext.Provider value={value}>
      {children}
    </ActiveTripContext.Provider>
  )
}

export function useActiveTripContext() {
  const context = useContext(ActiveTripContext)
  if (!context) {
    throw new Error('useActiveTripContext must be used within ActiveTripProvider')
  }
  return context
}
