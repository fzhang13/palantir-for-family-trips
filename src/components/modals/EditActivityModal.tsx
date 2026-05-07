import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import {
  AddressAutocomplete,
  TripDaySelector,
  TimePeriodPicker
} from '@/components/forms'
import { useUpdateActivity, useActiveTripId, useLocations } from '@/hooks'
import { fetchWeather, type WeatherForecast } from '@/lib/weatherService'
import type { Activity } from '@/types'
import type { CreateActivityInput, CreateLocationInput } from '@/types/inputs'

interface EditActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activity: Activity
}

export function EditActivityModal({ isOpen, onClose, activity }: EditActivityModalProps) {
  const { data: activeTripId } = useActiveTripId()

  // Pre-populate from existing activity
  const [title, setTitle] = useState(activity.title)
  const [activityDate, setActivityDate] = useState(activity.activityDate || '')
  const [timePeriod, setTimePeriod] = useState<'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible'>(
    (activity.timePeriod || 'all_day') as any
  )
  const [startTime, setStartTime] = useState<string | undefined>(activity.startTime || undefined)
  const [endTime, setEndTime] = useState<string | undefined>(activity.endTime || undefined)
  const [status, setStatus] = useState<'Go' | 'Watch'>(activity.status)
  const [riskLevel, setRiskLevel] = useState(activity.riskLevel || 'low')
  const [weatherSensitivity, setWeatherSensitivity] = useState(activity.weatherSensitivity || '')
  const [locationData, setLocationData] = useState<CreateLocationInput | null>(null)
  const [hasBackup, setHasBackup] = useState(false)
  const [backupLocationData, setBackupLocationData] = useState<CreateLocationInput | null>(null)
  const [weather, setWeather] = useState<WeatherForecast | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [description, setDescription] = useState(activity.description || '')
  const [note, setNote] = useState(activity.note || '')

  const { data: locations = [] } = useLocations(activeTripId || undefined)
  const updateActivity = useUpdateActivity()

  // Update form when activity prop changes
  useEffect(() => {
    setTitle(activity.title)
    setActivityDate(activity.activityDate || '')
    setTimePeriod((activity.timePeriod || 'all_day') as any)
    setStartTime(activity.startTime || undefined)
    setEndTime(activity.endTime || undefined)
    setStatus(activity.status)
    setRiskLevel(activity.riskLevel || 'low')
    setWeatherSensitivity(activity.weatherSensitivity || '')
    setDescription(activity.description || '')
    setNote(activity.note || '')

    // Pre-populate location if exists
    const activityLocation = activity.locationId
      ? locations.find(loc => loc.id === activity.locationId)
      : undefined

    if (activityLocation) {
      setLocationData({
        title: activityLocation.title,
        address: activityLocation.address,
        coordinates: activityLocation.coordinates,
        placeId: activityLocation.placeId || undefined,
        category: 'activity'
      })
    }

    // Pre-populate backup location if exists
    const backupLocation = activity.backupLocationId
      ? locations.find(loc => loc.id === activity.backupLocationId)
      : undefined

    if (backupLocation) {
      setHasBackup(true)
      setBackupLocationData({
        title: backupLocation.title,
        address: backupLocation.address,
        coordinates: backupLocation.coordinates,
        placeId: backupLocation.placeId || undefined,
        category: 'activity'
      })
    }

    // Pre-populate weather if exists
    if (activity.weatherData) {
      setWeather(activity.weatherData as WeatherForecast)
    }
  }, [activity, locations])

  // Auto-fetch weather when location and date are set
  useEffect(() => {
    if (locationData?.coordinates && activityDate) {
      handleFetchWeather()
    }
  }, [locationData?.coordinates, activityDate])

  const handleFetchWeather = async () => {
    if (!locationData?.coordinates || !activityDate) return

    setWeatherLoading(true)

    try {
      const forecast = await fetchWeather(
        locationData.coordinates,
        new Date(activityDate + 'T00:00:00')
      )
      setWeather(forecast)
    } catch (error) {
      console.error(error)
    } finally {
      setWeatherLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeTripId) return
    if (!title.trim() || !activityDate) {
      alert('Title and date are required')
      return
    }

    const input: Partial<CreateActivityInput> = {
      title: title.trim(),
      activityDate,
      timePeriod,
      startTime,
      endTime,
      status,
      riskLevel,
      weatherSensitivity: weatherSensitivity || undefined,
      createLocation: locationData || undefined,
      createBackupLocation: hasBackup ? backupLocationData || undefined : undefined,
      weatherData: weather || undefined,
      description: description.trim() || undefined,
      note: note.trim() || undefined,
    }

    try {
      await updateActivity.mutateAsync({
        tripId: activeTripId,
        activityId: activity.id,
        updates: input
      })
      onClose()
    } catch (error) {
      alert('Failed to update activity. Please try again.')
      console.error(error)
    }
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Activity">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Title <span className="text-[#F85149]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Hiking Trail"
            required
          />
        </div>

        {/* Trip Day Selector */}
        <TripDaySelector
          value={activityDate}
          onChange={(date) => setActivityDate(date)}
        />

        {/* Time Period Picker */}
        <TimePeriodPicker
          timePeriod={timePeriod}
          startTime={startTime}
          endTime={endTime}
          onChange={({ timePeriod: tp, startTime: st, endTime: et }) => {
            setTimePeriod(tp)
            setStartTime(st)
            setEndTime(et)
          }}
        />

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="Go">Go</option>
            <option value="Watch">Watch</option>
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Risk Level
          </label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Weather Sensitivity */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Weather Sensitivity
          </label>
          <input
            type="text"
            value={weatherSensitivity}
            onChange={(e) => setWeatherSensitivity(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., High, Moderate, Low"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Location <span className="text-[#F85149]">*</span>
          </label>
          <AddressAutocomplete
            value={locationData?.address || ''}
            onChange={(address, place) => {
              if (!address) return

              const lat = place?.geometry?.location?.lat() ?? 0
              const lng = place?.geometry?.location?.lng() ?? 0

              setLocationData({
                title: place?.name|| address.split(',')[0],
                address,
                coordinates: { lat, lng },
                placeId: place?.place_id,
                category: 'activity',
              })
            }}
            onCoordinatesChange={(lat, lng) => {
              setLocationData(prev => prev ? { ...prev, coordinates: { lat, lng } } : null)
            }}
            placeholder="Search for activity location..."
          />
        </div>

        {/* Weather Display */}
        {locationData && activityDate && (
          <div className="p-3 bg-[#161B22] border border-[#30363D] rounded">
            {weatherLoading && (
              <p className="text-sm text-[#8B949E]">Fetching weather...</p>
            )}
            {weather && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {weather.condition === 'Clear' && '☀️'}
                    {weather.condition === 'Partly Cloudy' && '⛅'}
                    {weather.condition.includes('Rain') && '🌧️'}
                    {weather.condition.includes('Cloud') && '☁️'}
                    {weather.condition.includes('Storm') && '⛈️'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#C9D1D9]">
                      {weather.condition}, {weather.temperature}°F
                    </p>
                    {weather.condition.includes('Rain') && (
                      <p className="text-xs text-[#F0883E]">
                        ⚠️ Consider backup plan
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFetchWeather}
                  className="text-[#58A6FF] hover:text-[#79C0FF] text-sm"
                >
                  ↻
                </button>
              </div>
            )}
          </div>
        )}

        {/* Backup Plan Toggle */}
        <div className="p-3 bg-[#161B22] border border-[#30363D] rounded">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#C9D1D9]">Has backup plan</span>
            <button
              type="button"
              onClick={() => setHasBackup(!hasBackup)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hasBackup ? 'bg-[#238636]' : 'bg-[#30363D]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hasBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {hasBackup && (
            <div className="pt-3 border-t border-[#238636]">
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
                Backup Location
              </label>
              <AddressAutocomplete
                value={backupLocationData?.address || ''}
                onChange={(address, place) => {
                  if (!address) return

                  const lat = place?.geometry?.location?.lat() ?? 0
                  const lng = place?.geometry?.location?.lng() ?? 0

                  setBackupLocationData({
                    title: place?.name|| address.split(',')[0],
                    address,
                    coordinates: { lat, lng },
                    placeId: place?.place_id,
                    category: 'activity',
                  })
                }}
                onCoordinatesChange={(lat, lng) => {
                  setBackupLocationData(prev => prev ? { ...prev, coordinates: { lat, lng } } : null)
                }}
                placeholder="Alternative if primary doesn't work..."
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="What is this activity about?"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#21262D] text-[#C9D1D9] rounded hover:bg-[#30363D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateActivity.isPending}
            className="flex-1 px-4 py-2 bg-[#238636] text-white rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50"
          >
            {updateActivity.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
