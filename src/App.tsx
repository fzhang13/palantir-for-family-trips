import { TripProvider, useTripContext } from '@/context'
import { AppShell } from '@/components/ui'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import {
  ItineraryPage,
  StayPage,
  MealsPage,
  ActivitiesPage,
  ExpensesPage,
  FamiliesPage,
} from '@/components/pages'

function AppContent() {
  const { currentPage, setCurrentPage } = useTripContext()

  return (
    <AppShell currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === 'itinerary' && <ItineraryPage />}
      {currentPage === 'stay' && <StayPage />}
      {currentPage === 'meals' && <MealsPage />}
      {currentPage === 'activities' && <ActivitiesPage />}
      {currentPage === 'expenses' && <ExpensesPage />}
      {currentPage === 'families' && <FamiliesPage />}
    </AppShell>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <TripProvider>
        <AppContent />
      </TripProvider>
    </ErrorBoundary>
  )
}
