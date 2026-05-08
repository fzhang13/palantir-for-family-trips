import { useState, useEffect } from 'react'
import { Wifi, Key, Eye, EyeOff } from 'lucide-react'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete, DayRangeSelector } from '@/components/forms'
import { useUpdateLocation, useActiveTripId } from '@/hooks'
import type { Location } from '@/types'

interface EditLocationModalProps {
  isOpen: boolean
  onClose: () => void
  location: Location
}

export function EditLocationModal({ isOpen, onClose, location }: EditLocationModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const updateLocation = useUpdateLocation()

  const [title, setTitle] = useState(location.title)
  const [address, setAddress] = useState(location.address)
  const [placeId, setPlaceId] = useState<string | undefined>(location.placeId || undefined)
  const [coordinates, setCoordinates] = useState(location.coordinates || { lat: 0, lng: 0 })
  const [summary, setSummary] = useState(location.summary || '')
  const [startDay, setStartDay] = useState<number | null>(location.startDayNumber || null)
  const [endDay, setEndDay] = useState<number | null>(location.endDayNumber || null)
  const [wifiNetwork, setWifiNetwork] = useState(location.wifiNetwork || '')
  const [wifiPassword, setWifiPassword] = useState(location.wifiPassword || '')
  const [showWifiPassword, setShowWifiPassword] = useState(false)
  const [hostName, setHostName] = useState(location.hostName || '')
  const [lockNote, setLockNote] = useState(location.lockNote || '')
  const [checkIn, setCheckIn] = useState(location.checkIn || '')
  const [checkOut, setCheckOut] = useState(location.checkOut || '')
  const [accessNote, setAccessNote] = useState(location.accessNote || '')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Reset form when location changes
  useEffect(() => {
    setTitle(location.title)
    setAddress(location.address)
    setPlaceId(location.placeId || undefined)
    setCoordinates(location.coordinates || { lat: 0, lng: 0 })
    setSummary(location.summary || '')
    setStartDay(location.startDayNumber || null)
    setEndDay(location.endDayNumber || null)
    setWifiNetwork(location.wifiNetwork || '')
    setWifiPassword(location.wifiPassword || '')
    setHostName(location.hostName || '')
    setLockNote(location.lockNote || '')
    setCheckIn(location.checkIn || '')
    setCheckOut(location.checkOut || '')
    setAccessNote(location.accessNote || '')
    setHasChanges(false)
  }, [location])

  // Track changes
  useEffect(() => {
    const changed =
      title !== location.title ||
      address !== location.address ||
      summary !== (location.summary || '') ||
      startDay !== (location.startDayNumber || null) ||
      endDay !== (location.endDayNumber || null) ||
      wifiNetwork !== (location.wifiNetwork || '') ||
      wifiPassword !== (location.wifiPassword || '') ||
      hostName !== (location.hostName || '') ||
      lockNote !== (location.lockNote || '') ||
      checkIn !== (location.checkIn || '') ||
      checkOut !== (location.checkOut || '') ||
      accessNote !== (location.accessNote || '')
    setHasChanges(changed)
  }, [title, address, summary, startDay, endDay, wifiNetwork, wifiPassword, hostName, lockNote, checkIn, checkOut, accessNote, location])

  const handleDayRangeChange = (start: number, end: number) => {
    setStartDay(start)
    setEndDay(end)
    setErrors(prev => ({ ...prev, dayRange: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeTripId) return

    // Validation
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Location name is required'
    if (!address.trim()) newErrors.address = 'Address is required'
    if (location.category === 'stay' && (startDay === null || endDay === null)) {
      newErrors.dayRange = 'Please select stay duration'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const updates: any = {
      title: title.trim(),
      address: address.trim(),
      coordinates,
      placeId,
      summary: summary.trim(),
      wifiNetwork: wifiNetwork.trim(),
      wifiPassword: wifiPassword.trim(),
      hostName: hostName.trim(),
      lockNote: lockNote.trim(),
      checkIn: checkIn.trim(),
      checkOut: checkOut.trim(),
      accessNote: accessNote.trim(),
    }

    // Add day range for stay locations
    if (location.category === 'stay') {
      updates.startDayNumber = startDay
      updates.endDayNumber = endDay
    }

    updateLocation.mutate(
      { tripId: activeTripId, locationId: location.id, updates },
      {
        onSuccess: () => {
          handleClose()
        },
      }
    )
  }

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?')
      if (!confirmed) return
    }
    setErrors({})
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Edit Stay Location">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location Name */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Location Name <span className="text-[#F85149]">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors(prev => ({ ...prev, title: '' }))
            }}
            type="text"
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Grand Canyon Lodge"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-[#F85149]">{errors.title}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Address <span className="text-[#F85149]">*</span>
          </label>
          <AddressAutocomplete
            value={address}
            onChange={(addr, place) => {
              if (!addr) return
              setAddress(addr)
              setErrors(prev => ({ ...prev, address: '' }))
              if (place?.place_id) {
                setPlaceId(place.place_id)
              }
            }}
            onCoordinatesChange={(lat, lng) => {
              setCoordinates({ lat, lng })
            }}
            placeholder="Search for accommodation..."
            error={errors.address}
          />
        </div>

        {/* Day Range Selector (for stay category) */}
        {location.category === 'stay' && (
          <DayRangeSelector
            startDay={startDay}
            endDay={endDay}
            onChange={handleDayRangeChange}
            error={errors.dayRange}
          />
        )}

        {/* WiFi Credentials Section */}
        <div
          style={{
            background: '#23863620',
            border: '1px solid #238636',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <Wifi size={14} className="text-[#238636]" />
            <label className="text-sm font-medium text-[#238636]">
              WiFi Credentials (Optional)
            </label>
          </div>

          {/* Network Name */}
          <div style={{ marginBottom: '12px' }}>
            <label className="block text-[13px] font-medium text-[#C9D1D9] mb-1">
              Network Name (SSID)
            </label>
            <input
              value={wifiNetwork}
              onChange={(e) => setWifiNetwork(e.target.value)}
              type="text"
              className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none text-[13px]"
              placeholder="e.g., Parc Omega Guest"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-medium text-[#C9D1D9] mb-1">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                type={showWifiPassword ? 'text' : 'password'}
                className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 pr-10 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none text-[13px]"
                placeholder="WiFi password"
              />
              <button
                type="button"
                onClick={() => setShowWifiPassword(!showWifiPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-[#C9D1D9] transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {showWifiPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Info text */}
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              color: '#8B949E',
              display: 'flex',
              alignItems: 'start',
              gap: '6px'
            }}
          >
            <span style={{ marginTop: '2px' }}>ℹ️</span>
            <span>When both fields are filled, a QR code will appear on the stay card for easy mobile connection</span>
          </div>
        </div>

        {/* Access Information Section */}
        <div
          style={{
            background: '#58A6FF20',
            border: '1px solid #58A6FF',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <Key size={14} className="text-[#58A6FF]" />
            <label className="text-sm font-medium text-[#58A6FF]">
              Access Information (Optional)
            </label>
          </div>

          {/* Host Name */}
          <div style={{ marginBottom: '12px' }}>
            <label className="block text-[13px] font-medium text-[#C9D1D9] mb-1">
              Host Name
            </label>
            <input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              type="text"
              className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none text-[13px]"
              placeholder="e.g., John Smith"
            />
          </div>

          {/* Lock Code */}
          <div style={{ marginBottom: '12px' }}>
            <label className="block text-[13px] font-medium text-[#C9D1D9] mb-1">
              Lock/Access Code
            </label>
            <input
              value={lockNote}
              onChange={(e) => setLockNote(e.target.value)}
              type="text"
              className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none text-[13px] font-mono"
              placeholder="e.g., 1234# or lockbox code"
            />
          </div>

          {/* Check-in / Check-out Times (side-by-side) */}
          <div style={{ marginBottom: '12px' }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-[#C9D1D9] mb-1">
                  Check-in Time
                </label>
                <input
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  type="text"
                  className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none text-[13px]"
                  placeholder="e.g., 3:00 PM"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#C9D1D9] mb-1">
                  Check-out Time
                </label>
                <input
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  type="text"
                  className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none text-[13px]"
                  placeholder="e.g., 11:00 AM"
                />
              </div>
            </div>
          </div>

          {/* Access Instructions */}
          <div>
            <label className="block text-[13px] font-medium text-[#C9D1D9] mb-1">
              Access Instructions
            </label>
            <textarea
              value={accessNote}
              onChange={(e) => setAccessNote(e.target.value)}
              rows={3}
              className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none resize-none text-[13px]"
              placeholder="Enter through side gate, key in lockbox by door..."
            />
          </div>
        </div>

        {/* Summary (Optional) */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-1">
            Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none resize-none"
            placeholder="Additional information about this location..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded bg-[#21262D] text-[#C9D1D9] hover:bg-[#30363D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateLocation.isPending || !hasChanges}
            className="px-4 py-2 rounded bg-[#238636] text-white hover:bg-[#2EA043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updateLocation.isPending ? 'Updating...' : 'Update Stay'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
