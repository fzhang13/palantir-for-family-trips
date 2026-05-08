import { useEffect, useRef, useState, useCallback } from 'react'
import { initGoogleMapsOptions, importLibrary } from '@/lib/googleMapsLoader'
import { env } from '@/lib/env'
import { DARK_MAP_STYLES } from '@/lib/constants'

interface UseGoogleMapsReturn {
  mapRef: (node: HTMLDivElement | null) => void
  map: google.maps.Map | null
  isLoaded: boolean
  error: Error | null
}

export function useGoogleMaps(options: Partial<google.maps.MapOptions> = {}): UseGoogleMapsReturn {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const initStartedRef = useRef(false)
  const optionsRef = useRef(options)

  const mapRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainer(node)
    }
  }, [])

  useEffect(() => {
    if (!container) {
      return
    }

    if (!env.googleMapsApiKey) {
      setError(new Error('Missing API key'))
      return
    }

    if (initStartedRef.current) {
      return
    }

    initStartedRef.current = true

    const initMap = async () => {
      try {
        // Set API options (must be called before importLibrary, only once globally)
        initGoogleMapsOptions()

        const { Map } = await importLibrary('maps')

        const defaultOptions: google.maps.MapOptions = {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 8,
          styles: DARK_MAP_STYLES,
          disableDefaultUI: true,
          mapTypeControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT },
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
          ...optionsRef.current,
        }

        const mapInstance = new Map(container, defaultOptions)

        setMap(mapInstance)
        setIsLoaded(true)
      } catch (err) {
        console.error('❌ Google Maps initialization failed:', err)
        setError(err as Error)
      }
    }

    initMap()
  }, [container])

  return {
    mapRef,
    map,
    isLoaded,
    error,
  }
}
