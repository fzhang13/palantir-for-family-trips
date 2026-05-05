import { MapPin } from 'lucide-react'

export function ActivitiesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <MapPin className="w-16 h-16 text-[#8B949E] mb-4" />
      <h2 className="text-2xl font-semibold text-[#C9D1D9] mb-2">
        Activities
      </h2>
      <p className="text-[#8B949E] text-center max-w-md">
        Discover and organize activities, attractions, and points of interest along your route.
      </p>
    </div>
  )
}
