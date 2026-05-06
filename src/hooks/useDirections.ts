import { useEffect, useState } from 'react'

interface UseDirectionsOptions {
  origin: { lat: number; lng: number } | string
  destination: { lat: number; lng: number } | string
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'
}

interface DirectionsResult {
  distance: string | null
  duration: string | null
  polyline: Array<{ lat: number; lng: number }> | null
  isLoading: boolean
  error: Error | null
}

export function useDirections(options: UseDirectionsOptions): DirectionsResult {
  const { origin, destination, travelMode = 'DRIVING' } = options

  const [distance, setDistance] = useState<string | null>(null)
  const [duration, setDuration] = useState<string | null>(null)
  const [polyline, setPolyline] = useState<Array<{ lat: number; lng: number }> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Serialize coordinates to primitives for dependency comparison
  const originKey = typeof origin === 'string' ? origin : `${origin.lat},${origin.lng}`
  const destKey = typeof destination === 'string' ? destination : `${destination.lat},${destination.lng}`

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google?.maps) {
      setError(new Error('Google Maps API not loaded'))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    let cancelled = false

    const directionsService = new google.maps.DirectionsService()

    directionsService.route(
      {
        origin,
        destination,
        travelMode: travelMode as google.maps.TravelMode,
      },
      (result, status) => {
        // Ignore callback if request was cancelled or component unmounted
        if (cancelled) return

        setIsLoading(false)

        if (status === 'OK' && result) {
          const route = result.routes[0]
          const leg = route.legs[0]

          setDistance(leg.distance?.text || null)
          setDuration(leg.duration?.text || null)

          // Extract polyline coordinates
          const path: Array<{ lat: number; lng: number }> = []
          route.overview_path.forEach((point) => {
            path.push({
              lat: point.lat(),
              lng: point.lng(),
            })
          })
          setPolyline(path)
        } else {
          setError(new Error(`Directions request failed: ${status}`))
          setDistance(null)
          setDuration(null)
          setPolyline(null)
        }
      }
    )

    // Cleanup: mark request as cancelled on unmount or dependency change
    return () => {
      cancelled = true
    }
  }, [originKey, destKey, travelMode])

  return {
    distance,
    duration,
    polyline,
    isLoading,
    error,
  }
}
