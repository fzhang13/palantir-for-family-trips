import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, Calendar } from 'lucide-react'
import { MapContainer } from '@/components/map'
import { AddRouteModal, EditRouteModal } from '@/components/modals'
import { useRoutes, useFamilies, useLocations, useDeleteRoute, useActiveTripId } from '@/hooks'
import type { Route } from '@/types'

export function ItineraryPage() {
  const { data: activeTripId } = useActiveTripId()
  const { data: routes = [], isLoading } = useRoutes()
  const { data: families = [] } = useFamilies()
  const { data: locations = [] } = useLocations()
  const deleteRoute = useDeleteRoute()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [selectedRouteId, setSelectedRouteId] = useState<string>()

  const handleDelete = (routeId: string) => {
    if (!activeTripId) return
    const confirmed = window.confirm('Are you sure you want to delete this route?')
    if (!confirmed) return

    // Use mutate instead of mutateAsync - hook handles toasts via onSuccess/onError
    deleteRoute.mutate({ tripId: activeTripId, routeId })
  }

  const getFamilyName = (familyId: string) => {
    const family = families.find((f) => f.id === familyId)
    return family ? family.name : '(Deleted Family)'
  }

  const getLocationTitle = (locationId?: string) => {
    if (!locationId) return null
    const location = locations.find((l) => l.id === locationId)
    return location ? location.title : '(Deleted)'
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (families.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-[#8B949E]">
        <MapPin size={48} className="mb-4 opacity-50" />
        <p className="text-lg">No families yet</p>
        <p className="text-sm">Add families first to create routes</p>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-[#8B949E]">
        <MapPin size={48} className="mb-4 opacity-50" />
        <p className="text-lg">No locations yet</p>
        <p className="text-sm">Add locations first to create routes</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full gap-4">
        {/* Left Sidebar - Route List */}
        <div className="flex w-80 flex-col bg-[#161B22]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#30363D] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#C9D1D9]">
              Routes
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded bg-[#238636] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2EA043]"
            >
              <Plus size={16} />
              Add Route
            </button>
          </div>

          {/* Route List */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <p className="text-sm text-[#8B949E]">Loading routes...</p>
            ) : routes.length === 0 ? (
              <div className="text-center text-[#8B949E]">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No routes yet</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 text-sm text-[#58A6FF] hover:underline"
                >
                  Add your first route
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {routes.map((route) => {
                  const familyName = getFamilyName(route.familyId)
                  const destTitle = getLocationTitle(route.destinationLocationId)
                  const duration = formatDuration(route.durationSeconds)
                  const isSelected = selectedRouteId === route.id

                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`cursor-pointer rounded border p-3 transition-colors ${
                        isSelected
                          ? 'border-[#3FB950] bg-[#0D1117]'
                          : 'border-[#30363D] bg-[#0D1117] hover:border-[#58A6FF]'
                      }`}
                    >
                      {/* Route Title */}
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="font-semibold text-[#C9D1D9]">
                          {familyName} → {destTitle || 'Destination'}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingRoute(route)
                            }}
                            className="text-[#8B949E] hover:text-[#58A6FF]"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(route.id)
                            }}
                            className="text-[#8B949E] hover:text-[#F85149]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Route subtitle */}
                      <p className="mb-2 text-xs text-[#8B949E]">
                        {route.title}
                      </p>

                      {/* Duration */}
                      {duration && (
                        <p className="mb-2 font-mono text-xs text-[#8B949E]">
                          <span className="text-[#3FB950]">{duration}</span>
                        </p>
                      )}

                      {/* Day ID */}
                      <div className="flex items-center gap-3 text-xs text-[#8B949E]">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {route.dayId}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right - Map */}
        <div className="flex-1">
          <MapContainer
            routes={routes}
            selectedRouteId={selectedRouteId}
          />
        </div>
      </div>

      {/* Modals */}
      <AddRouteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {editingRoute && (
        <EditRouteModal
          isOpen={true}
          onClose={() => setEditingRoute(null)}
          route={editingRoute}
        />
      )}
    </>
  )
}
