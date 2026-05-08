import { useEffect, useRef, useState } from 'react'
import { initGoogleMapsOptions, importLibrary } from '@/lib/googleMapsLoader'
import { env } from '@/lib/env'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, place?: google.maps.places.PlaceResult) => void
  onCoordinatesChange?: (lat: number, lng: number) => void
  placeholder?: string
  error?: string
  id?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onCoordinatesChange,
  placeholder = 'Enter address...',
  error,
  id = 'address',
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  // Keep stable refs to callbacks so the effect never needs to re-run due to them
  const onChangeRef = useRef(onChange)
  const onCoordinatesChangeRef = useRef(onCoordinatesChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])
  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange
  }, [onCoordinatesChange])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    const init = async () => {
      try {
        if (!env.googleMapsApiKey) {
          setIsFallback(true)
          return
        }

        initGoogleMapsOptions()
        await importLibrary('places')

        if (cancelled || !containerRef.current) return

        const autocompleteElement = new google.maps.places.PlaceAutocompleteElement({})

        autocompleteElement.style.width = '100%'
        containerRef.current.appendChild(autocompleteElement)
        elementRef.current = autocompleteElement

        autocompleteElement.addEventListener('gmp-select', async (event: Event) => {
          try {
            const { placePrediction } = event as unknown as {
              placePrediction: google.maps.places.PlacePrediction
            }
            if (!placePrediction) return

            const place = placePrediction.toPlace()
            await place.fetchFields({
              fields: ['formattedAddress', 'location', 'displayName', 'id'],
            })

            const address = place.formattedAddress || place.displayName || ''
            const lat = place.location?.lat()
            const lng = place.location?.lng()

            // Create a compatible PlaceResult object
            const placeResult: google.maps.places.PlaceResult = {
              place_id: place.id || undefined,
              formatted_address: place.formattedAddress ?? undefined,
              geometry:
                lat !== undefined && lng !== undefined
                  ? ({
                      location: place.location!,
                    } as google.maps.places.PlaceGeometry)
                  : undefined,
              name: place.displayName ?? undefined,
            }

            if (address) {
              onChangeRef.current(address, placeResult)
            }

            if (lat !== undefined && lng !== undefined && onCoordinatesChangeRef.current) {
              onCoordinatesChangeRef.current(lat, lng)
            }
          } catch (err) {
            console.error('Failed to fetch place details:', err)
          }
        })

        setIsFallback(false)
      } catch (err) {
        console.error('Failed to initialize Google Places Autocomplete:', err)
        if (!cancelled) setIsFallback(true)
      }
    }

    init()

    return () => {
      cancelled = true
      if (elementRef.current && containerRef.current?.contains(elementRef.current)) {
        containerRef.current.removeChild(elementRef.current)
      }
      elementRef.current = null
    }
  }, []) // only run once on mount

  return (
    <div>
      {isFallback ? (
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value)
            onChange(e.target.value)
          }}
          placeholder={placeholder}
          className="w-full rounded border border-[#30363D] bg-[#0D1117] px-3 py-2 text-[#C9D1D9] focus:border-[#58A6FF] focus:outline-none"
        />
      ) : (
        <div ref={containerRef} className="gmp-autocomplete-container" />
      )}
      {error && <p className="mt-1 text-sm text-[#F85149]">{error}</p>}
    </div>
  )
}
