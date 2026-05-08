import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import { AddressAutocomplete, TimePeriodPicker, TripDaySelector } from '@/components/forms'
import { useAddActivity, useActiveTripId } from '@/hooks'
import { useActivitiesForConflictCheck } from '@/hooks/useTripQueries'
import { checkActivityConflicts } from '@/lib/conflictDetection'
import { fetchWeather, type WeatherForecast } from '@/lib/weatherService'
import type { CreateActivityInput, CreateLocationInput } from '@/types/inputs'

interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const { data: activeTripId } = useActiveTripId()
  const [title, setTitle] = useState('')
  const [activityDate, setActivityDate] = useState('')
  const [timePeriod, setTimePeriod] = useState<
    'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible'
  >('all_day')
  const [startTime, setStartTime] = useState<string>()
  const [endTime, setEndTime] = useState<string>()
  const [status, setStatus] = useState<'Go' | 'Watch'>('Go')
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low')
  const [locationData, setLocationData] = useState<CreateLocationInput | null>(null)
  const [hasBackup, setHasBackup] = useState(false)
  const [backupLocationData, setBackupLocationData] = useState<CreateLocationInput | null>(null)
  const [weather, setWeather] = useState<WeatherForecast | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [note, setNote] = useState('')

  const { data: existingActivities = [] } = useActivitiesForConflictCheck(activeTripId || '')
  const addActivity = useAddActivity()

  // Conflict detection
  const [conflict, setConflict] = useState<{ hasConflict: boolean; message: string }>({
    hasConflict: false,
    message: '',
  })

  useEffect(() => {
    if (activityDate && startTime && endTime) {
      const check = checkActivityConflicts(existingActivities, activityDate, startTime, endTime)
      if (check.hasConflict) {
        const conflictActivity = check.conflicts[0]
        setConflict({
          hasConflict: true,
          message: `Overlaps with "${conflictActivity.title}" (${conflictActivity.time})`,
        })
      } else {
        setConflict({ hasConflict: false, message: '' })
      }
    }
  }, [activityDate, startTime, endTime, existingActivities])

  // Auto-fetch weather when location and date are set
  useEffect(() => {
    if (locationData?.coordinates && activityDate) {
      handleFetchWeather()
    }
  }, [locationData?.coordinates, activityDate])

  const handleFetchWeather = async () => {
    if (!locationData?.coordinates || !activityDate) return

    setWeatherLoading(true)
    setWeatherError(null)

    try {
      const forecast = await fetchWeather(
        locationData.coordinates,
        new Date(activityDate + 'T00:00:00')
      )
      setWeather(forecast)
    } catch (error) {
      setWeatherError('Unable to fetch weather')
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

    const input: CreateActivityInput = {
      title: title.trim(),
      activityDate,
      timePeriod,
      startTime,
      endTime,
      status,
      riskLevel,
      createLocation: locationData || undefined,
      createBackupLocation: hasBackup ? backupLocationData || undefined : undefined,
      weatherData: weather || undefined,
      description: description.trim() || undefined,
      note: note.trim() || undefined,
      // Keep old fields for backward compatibility
      dayId: 'thu',
    }

    try {
      await addActivity.mutateAsync({ tripId: activeTripId, input })
      handleClose()
    } catch (error) {
      alert('Failed to add activity. Please try again.')
      console.error(error)
    }
  }

  const handleClose = () => {
    setTitle('')
    setActivityDate('')
    setTimePeriod('all_day')
    setStartTime(undefined)
    setEndTime(undefined)
    setStatus('Go')
    setRiskLevel('low')
    setLocationData(null)
    setHasBackup(false)
    setBackupLocationData(null)
    setWeather(null)
    setWeatherError(null)
    setDescription('')
    setNote('')
    setConflict({ hasConflict: false, message: '' })
    onClose()
  }

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Add Activity">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Title <span className="text-[#F85149]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="e.g., Hiking Trail"
            required
          />
        </div>

        {/* Trip Day Selector (replaces date picker) */}
        <TripDaySelector
          value={activityDate}
          onChange={date => {
            setActivityDate(date)
          }}
          error={!activityDate ? 'Please select a day' : undefined}
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

        {/* Conflict Warning */}
        {conflict.hasConflict && (
          <div className="p-3 bg-[#F0883E]/10 border border-[#F0883E]/30 rounded">
            <p className="text-sm text-[#F0883E]">⚠️ {conflict.message}</p>
            <p className="text-xs text-[#8B949E] mt-1">Adjust times or continue anyway.</p>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="Go">Go</option>
            <option value="Watch">Watch</option>
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Risk Level</label>
          <select
            value={riskLevel}
            onChange={e => setRiskLevel(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
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
                title: place?.name || address.split(',')[0],
                address,
                coordinates: { lat, lng },
                placeId: place?.place_id,
                category: 'activity',
              })
            }}
            onCoordinatesChange={(lat, lng) => {
              setLocationData(prev => (prev ? { ...prev, coordinates: { lat, lng } } : null))
            }}
            placeholder="Search for activity location..."
          />
        </div>

        {/* Weather Display */}
        {locationData && activityDate && (
          <div className="p-3 bg-[#161B22] border border-[#30363D] rounded">
            {weatherLoading && <p className="text-sm text-[#8B949E]">Fetching weather...</p>}
            {weatherError && <p className="text-sm text-[#F85149]">{weatherError}</p>}
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
                      <p className="text-xs text-[#F0883E]">⚠️ Consider backup plan</p>
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
                    title: place?.name || address.split(',')[0],
                    address,
                    coordinates: { lat, lng },
                    placeId: place?.place_id,
                    category: 'activity',
                  })
                }}
                onCoordinatesChange={(lat, lng) => {
                  setBackupLocationData(prev =>
                    prev ? { ...prev, coordinates: { lat, lng } } : null
                  )
                }}
                placeholder="Alternative if primary doesn't work..."
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="What is this activity about?"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">Notes</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
            placeholder="Additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-[#21262D] text-[#C9D1D9] rounded hover:bg-[#30363D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addActivity.isPending}
            className="flex-1 px-4 py-2 bg-[#238636] text-white rounded hover:bg-[#2EA043] transition-colors disabled:opacity-50"
          >
            {addActivity.isPending ? 'Adding...' : 'Add Activity'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
