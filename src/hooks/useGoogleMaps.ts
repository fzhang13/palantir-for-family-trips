import { useEffect, useRef, useState, type RefObject } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { env } from '@/lib/env'
import { DARK_MAP_STYLES } from '@/lib/constants'

interface UseGoogleMapsReturn {
  map: google.maps.Map | null
  isLoaded: boolean
  error: Error | null
}

export function useGoogleMaps(
  containerRef: RefObject<HTMLDivElement>,
  options: Partial<google.maps.MapOptions> = {}
): UseGoogleMapsReturn {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const loaderRef = useRef<Loader | null>(null)

  useEffect(() => {
    if (!containerRef.current || !env.googleMapsApiKey) {
      setError(new Error('Missing container or API key'))
      return
    }

    const initMap = async () => {
      try {
        if (!loaderRef.current) {
          loaderRef.current = new Loader({
            apiKey: env.googleMapsApiKey!,
            version: 'weekly',
            libraries: ['places', 'routes'],
          })
        }

        // @ts-ignore - Loader API compatibility
        await loaderRef.current.load()

        const defaultOptions: google.maps.MapOptions = {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 8,
          styles: DARK_MAP_STYLES,
          disableDefaultUI: true,
          mapId: env.googleMapId,
          ...options,
        }

        const mapInstance = new google.maps.Map(
          containerRef.current!,
          defaultOptions
        )

        setMap(mapInstance)
        setIsLoaded(true)
      } catch (err) {
        setError(err as Error)
      }
    }

    initMap()
  }, [containerRef, options])

  return {
    map,
    isLoaded,
    error,
  }
}
