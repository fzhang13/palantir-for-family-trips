import { useState, useEffect } from 'react'
import { TIME_PERIODS } from '@/lib/dateUtils'

interface TimePeriodPickerProps {
  timePeriod: 'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible'
  startTime?: string
  endTime?: string
  onChange: (data: {
    timePeriod: 'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible'
    startTime?: string
    endTime?: string
  }) => void
}

export function TimePeriodPicker({
  timePeriod,
  startTime,
  endTime,
  onChange,
}: TimePeriodPickerProps) {
  const [localStart, setLocalStart] = useState(startTime || '')
  const [localEnd, setLocalEnd] = useState(endTime || '')

  // Generate time options for dropdowns based on period
  const generateTimeOptions = (period: 'morning' | 'afternoon' | 'evening') => {
    const { start, end } = TIME_PERIODS[period]
    const options: string[] = []

    let current: string = start
    while (current < end) {
      options.push(current)
      // Increment by 30 minutes
      const [hours, minutes] = current.split(':').map(Number)
      const totalMinutes = hours * 60 + minutes + 30
      const newHours = Math.floor(totalMinutes / 60)
      const newMinutes = totalMinutes % 60
      current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
    }
    options.push(end)

    return options
  }

  const showTimeInputs = ['morning', 'afternoon', 'evening'].includes(timePeriod)

  useEffect(() => {
    if (!showTimeInputs) {
      setLocalStart('')
      setLocalEnd('')
      onChange({ timePeriod, startTime: undefined, endTime: undefined })
    }
  }, [timePeriod, showTimeInputs, onChange])

  const handleStartTimeChange = (value: string) => {
    setLocalStart(value)
    onChange({ timePeriod, startTime: value, endTime: localEnd })
  }

  const handleEndTimeChange = (value: string) => {
    setLocalEnd(value)
    onChange({ timePeriod, startTime: localStart, endTime: value })
  }

  return (
    <div className="space-y-3">
      {/* Time Period Select */}
      <div>
        <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
          Time Period <span className="text-[#F85149]">*</span>
        </label>
        <select
          value={timePeriod}
          onChange={e =>
            onChange({
              timePeriod: e.target.value as any,
              startTime: undefined,
              endTime: undefined,
            })
          }
          className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="all_day">All Day</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      {/* Time Range Inputs (conditional) */}
      {showTimeInputs && (
        <div className="pl-4 border-l-2 border-[#58A6FF]">
          <p className="text-xs text-[#8B949E] mb-2">
            {timePeriod === 'morning' && 'Morning hours: 6 AM - 12 PM'}
            {timePeriod === 'afternoon' && 'Afternoon hours: 12 PM - 6 PM'}
            {timePeriod === 'evening' && 'Evening hours: 6 PM - 11 PM'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8B949E] mb-1">From</label>
              <select
                value={localStart}
                onChange={e => handleStartTimeChange(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#0A0C10] border border-[#30363D] rounded text-sm text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
              >
                <option value="">Select time</option>
                {generateTimeOptions(timePeriod as any).map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8B949E] mb-1">To</label>
              <select
                value={localEnd}
                onChange={e => handleEndTimeChange(e.target.value)}
                className="w-full px-2 py-1.5 bg-[#0A0C10] border border-[#30363D] rounded text-sm text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
              >
                <option value="">Select time</option>
                {generateTimeOptions(timePeriod as any).map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
