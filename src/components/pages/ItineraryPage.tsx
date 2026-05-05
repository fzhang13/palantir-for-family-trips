import { Calendar } from 'lucide-react'

export function ItineraryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Calendar className="w-16 h-16 text-[#8B949E] mb-4" />
      <h2 className="text-2xl font-semibold text-[#C9D1D9] mb-2">
        Itinerary
      </h2>
      <p className="text-[#8B949E] text-center max-w-md">
        View and manage your trip itinerary, including routes, schedules, and daily plans.
      </p>
    </div>
  )
}
