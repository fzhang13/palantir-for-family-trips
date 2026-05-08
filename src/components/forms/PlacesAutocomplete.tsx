import { useEffect, useRef, useState } from 'react'

interface PlaceResult {
  title: string
  address: string
  coordinates: { lat: number; lng: number }
  placeId: string
}

interface PlacesAutocompleteProps {
  value: string
  onChange: (place: PlaceResult) => void
  placeholder?: string
  error?: string
  className?: string
}

export function PlacesAutocomplete({
  value,
  onChange,
  placeholder = 'Search for a location...',
  error,
  className = '',
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (!inputRef.current) return

    // Initialize Google Places Autocomplete
    const options: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry', 'name', 'place_id'],
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, options)

    // Handle place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()

      if (!place || !place.geometry || !place.geometry.location) {
        return
      }

      const result: PlaceResult = {
        title: place.name || '',
        address: place.formatted_address || '',
        coordinates: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        placeId: place.place_id || '',
      }

      setInputValue(result.address)
      onChange(result)
    })

    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [onChange])

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        className={`w-full bg-[#0d1117] border border-[#30363D] rounded px-3 py-2 text-[#C9D1D9] placeholder-[#8B949E] focus:border-[#58A6FF] focus:outline-none ${className}`}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-sm text-[#F85149]">{error}</p>}
    </div>
  )
}
