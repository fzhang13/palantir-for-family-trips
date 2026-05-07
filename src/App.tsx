import { lazy, Suspense } from 'react'
import { TripProvider, useTripContext } from '@/context'
import { AppShell } from '@/components/ui'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TripSetupPage } from '@/components/pages'
import { useActiveTripId } from '@/hooks'

const ItineraryPage = lazy(() =>
  import('@/components/pages/ItineraryPage').then((mod) => ({
    default: mod.ItineraryPage,
  }))
)
const StayPage = lazy(() =>
  import('@/components/pages/StayPage').then((mod) => ({ default: mod.StayPage }))
)
const MealsPage = lazy(() =>
  import('@/components/pages/MealsPage').then((mod) => ({ default: mod.MealsPage }))
)
const ActivitiesPage = lazy(() =>
  import('@/components/pages/ActivitiesPage').then((mod) => ({
    default: mod.ActivitiesPage,
  }))
)
const ExpensesPage = lazy(() =>
  import('@/components/pages/ExpensesPage').then((mod) => ({
    default: mod.ExpensesPage,
  }))
)
const FamiliesPage = lazy(() =>
  import('@/components/pages/FamiliesPage').then((mod) => ({
    default: mod.FamiliesPage,
  }))
)

function PageLoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#30363D] border-t-[#58A6FF] rounded-full animate-spin" />
    </div>
  )
}

function AppContent() {
  const { currentPage, setCurrentPage } = useTripContext()

  return (
    <AppShell currentPage={currentPage} onPageChange={setCurrentPage}>
      <Suspense fallback={<PageLoadingSpinner />}>
        {currentPage === 'itinerary' && <ItineraryPage />}
        {currentPage === 'stay' && <StayPage />}
        {currentPage === 'meals' && <MealsPage />}
        {currentPage === 'activities' && <ActivitiesPage />}
        {currentPage === 'expenses' && <ExpensesPage />}
        {currentPage === 'families' && <FamiliesPage />}
      </Suspense>
    </AppShell>
  )
}

function App() {
  const { data: activeTripId, isLoading } = useActiveTripId()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0A0C10]">
        <div className="w-12 h-12 border-4 border-[#30363D] border-t-[#58A6FF] rounded-full animate-spin" />
      </div>
    )
  }

  if (!activeTripId) {
    return (
      <ErrorBoundary>
        <TripSetupPage />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <TripProvider>
        <AppContent />
      </TripProvider>
    </ErrorBoundary>
  )
}

export default App
