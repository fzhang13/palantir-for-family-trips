import { UtensilsCrossed } from 'lucide-react'

export function MealsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <UtensilsCrossed className="w-16 h-16 text-[#8B949E] mb-4" />
      <h2 className="text-2xl font-semibold text-[#C9D1D9] mb-2">
        Meals
      </h2>
      <p className="text-[#8B949E] text-center max-w-md">
        Plan and track meal stops, restaurants, and dining reservations for your trip.
      </p>
    </div>
  )
}
