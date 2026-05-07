import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, Home, Calendar, FileText, Wifi, Key, Lock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useLocations, useDeleteLocation, useActiveTripId } from '@/hooks'
import { AddLocationModal, EditLocationModal } from '@/components/modals'
import type { Location } from '@/types'

export function StayPage() {
  const { data: activeTripId } = useActiveTripId()
  const { data: allLocations = [], isLoading, isError } = useLocations()
  const deleteLocation = useDeleteLocation()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)

  // Filter locations to only show 'stay' category
  const stayLocations = allLocations.filter(location => location.category === 'stay')

  const handleDelete = (locationId: string) => {
    if (!activeTripId) return
    if (window.confirm('Are you sure you want to delete this stay location?')) {
      deleteLocation.mutate({ tripId: activeTripId, locationId })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#8B949E]">Loading stay locations...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#F85149]">Failed to load stay locations. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto bg-[#0A0C10]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B949E] mb-1">
            Lodging
          </div>
          <h1 className="text-2xl font-bold text-[#C9D1D9]">Stay Locations</h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
          aria-label="Add new stay location"
        >
          <Plus size={16} />
          Add Stay
        </button>
      </div>

      {/* Empty State */}
      {stayLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 border border-[#30363D] rounded bg-[#161B22]">
          <Home size={48} className="text-[#8B949E] mb-4" />
          <p className="text-[#8B949E] text-lg mb-2">No stay locations yet</p>
          <p className="text-[#8B949E] text-sm mb-4">Get started by adding your first lodging location</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white text-sm font-medium rounded hover:bg-[#2EA043] transition-colors"
            aria-label="Add your first stay location"
          >
            <Plus size={16} />
            Add Stay
          </button>
        </div>
      ) : (
        /* Stay Locations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stayLocations.map((location) => (
            <StayCard
              key={location.id}
              location={location}
              onEdit={setEditingLocation}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Location Modal */}
      {editingLocation && (
        <EditLocationModal
          isOpen={true}
          onClose={() => setEditingLocation(null)}
          location={editingLocation}
        />
      )}
    </div>
  )
}

interface StayCardProps {
  location: Location
  onEdit: (location: Location) => void
  onDelete: (locationId: string) => void
}

function StayCard({ location, onEdit, onDelete }: StayCardProps) {
  return (
    <div className="border border-[#30363D] rounded bg-[#161B22] p-5 hover:border-[#58A6FF] transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#C9D1D9] mb-1">
            {location.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#8B949E]">
            <MapPin size={14} />
            <span>{location.address}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(location)}
            className="p-1.5 rounded text-[#8B949E] hover:text-[#58A6FF] hover:bg-[#21262D] transition-colors"
            aria-label={`Edit ${location.title}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(location.id)}
            className="p-1.5 rounded text-[#8B949E] hover:text-[#DA3633] hover:bg-[#21262D] transition-colors"
            aria-label={`Delete ${location.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5">
        {/* Day Range or Check-in/Check-out Dates */}
        {(location.startDayNumber && location.endDayNumber) ? (
          <div className="pt-2 border-t border-[#30363D]">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#8B949E]" />
              <span className="text-sm text-[#C9D1D9] font-medium">
                Day {location.startDayNumber}
                {location.endDayNumber !== location.startDayNumber && ` - Day ${location.endDayNumber}`}
              </span>
              <span className="text-xs text-[#8B949E]">
                ({location.endDayNumber - location.startDayNumber + 1} {location.endDayNumber === location.startDayNumber ? 'day' : 'days'})
              </span>
            </div>
          </div>
        ) : (location.checkInDate || location.checkOutDate) && (
          <div className="pt-2 border-t border-[#30363D]">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {location.checkInDate && (
                <div>
                  <span className="text-[#8B949E] text-xs">Check-in</span>
                  <p className="text-[#C9D1D9] font-medium mt-0.5">
                    {new Date(location.checkInDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[#8B949E] text-xs mt-0.5">
                    {new Date(location.checkInDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                    })}
                  </p>
                </div>
              )}
              {location.checkOutDate && (
                <div>
                  <span className="text-[#8B949E] text-xs">Check-out</span>
                  <p className="text-[#C9D1D9] font-medium mt-0.5">
                    {new Date(location.checkOutDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-[#8B949E] text-xs mt-0.5">
                    {new Date(location.checkOutDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {location.summary && (
          <div className="flex items-start gap-2 text-sm pt-2 border-t border-[#30363D]">
            <FileText size={14} className="text-[#8B949E] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-[#8B949E]">Summary:</span>
              <p className="text-[#C9D1D9] mt-1 line-clamp-3">{location.summary}</p>
            </div>
          </div>
        )}

        {/* Host information */}
        {(location.hostName || location.coHostName) && (
          <div className="text-sm pt-2 border-t border-[#30363D]">
            <span className="text-[#8B949E]">Host:</span>
            <p className="text-[#C9D1D9]">
              {location.hostName}
              {location.coHostName && ` & ${location.coHostName}`}
            </p>
          </div>
        )}

        {/* Access Information */}
        {(location.accessNote || location.lockNote || location.checkIn || location.checkOut) && (
          <div className="pt-2 border-t border-[#30363D]">
            <div className="flex items-center gap-2 mb-2">
              <Key size={14} className="text-[#8B949E]" />
              <span className="text-xs text-[#8B949E] uppercase tracking-wider">Access Info</span>
            </div>
            <div className="space-y-2 text-sm">
              {(location.checkIn || location.checkOut) && (
                <div className="grid grid-cols-2 gap-2">
                  {location.checkIn && (
                    <div>
                      <span className="text-[#8B949E] text-xs">Check-in time:</span>
                      <p className="text-[#C9D1D9] font-mono">{location.checkIn}</p>
                    </div>
                  )}
                  {location.checkOut && (
                    <div>
                      <span className="text-[#8B949E] text-xs">Check-out time:</span>
                      <p className="text-[#C9D1D9] font-mono">{location.checkOut}</p>
                    </div>
                  )}
                </div>
              )}
              {location.accessNote && (
                <div>
                  <span className="text-[#8B949E] text-xs">Access:</span>
                  <p className="text-[#C9D1D9] mt-0.5">{location.accessNote}</p>
                </div>
              )}
              {location.lockNote && (
                <div className="flex items-start gap-2">
                  <Lock size={12} className="text-[#8B949E] mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-[#8B949E] text-xs">Lock code:</span>
                    <p className="text-[#C9D1D9] font-mono mt-0.5">{location.lockNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WiFi Information */}
        {(location.wifiNetwork || location.wifiPassword) && (
          <div className="pt-2 border-t border-[#30363D]">
            <div className="flex items-center gap-2 mb-2">
              <Wifi size={14} className="text-[#8B949E]" />
              <span className="text-xs text-[#8B949E] uppercase tracking-wider">WiFi</span>
            </div>
            <div className="space-y-2 text-sm">
              {location.wifiNetwork && (
                <div>
                  <span className="text-[#8B949E] text-xs">Network:</span>
                  <p className="text-[#C9D1D9] font-mono">{location.wifiNetwork}</p>
                </div>
              )}
              {location.wifiPassword && (
                <div>
                  <span className="text-[#8B949E] text-xs">Password:</span>
                  <p className="text-[#C9D1D9] font-mono">{location.wifiPassword}</p>
                </div>
              )}
              {location.wifiNetwork && location.wifiPassword && (
                <div className="bg-white p-3 rounded inline-block">
                  <QRCodeSVG
                    value={`WIFI:T:WPA;S:${location.wifiNetwork};P:${location.wifiPassword};;`}
                    size={120}
                    level="M"
                  />
                  <p className="text-[#8B949E] text-xs text-center mt-2">Scan to connect</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
