import { useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { useGoogleMaps } from '@/hooks'
import { RouteRenderer } from './RouteRenderer'
import type { Route } from '@/types'

interface MapContainerProps {
  routes: Route[]
  selectedRouteId?: string
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 } // San Francisco
const DEFAULT_ZOOM = 7

export function MapContainer({ routes, selectedRouteId }: MapContainerProps) {
  const { mapRef, map, isLoaded, error } = useGoogleMaps({
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    disableDefaultUI: false,
    mapTypeControl: true,
    zoomControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  })

  // Set initial location to user's current position
  useEffect(() => {
    if (!map || !isLoaded) return

    // If we have routes, skip geolocation (we'll fit bounds to routes instead)
    if (routes.length > 0) return

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          map.setCenter(userLocation)
          map.setZoom(12)
        },
        error => {
          console.warn('⚠️ Geolocation failed:', error.message)
          // Keep default SF location
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        }
      )
    }
  }, [map, isLoaded, routes.length])

  // Auto-fit bounds to show selected route or all routes
  useEffect(() => {
    if (!map || !window.google || routes.length === 0) {
      return
    }

    const bounds = new google.maps.LatLngBounds()
    let hasPoints = false

    // If there's a selected route, only fit to that route
    const routesToShow = selectedRouteId ? routes.filter(r => r.id === selectedRouteId) : routes

    routesToShow.forEach(route => {
      if (route.path && route.path.length > 0) {
        route.path.forEach(point => {
          bounds.extend(new google.maps.LatLng(point.lat, point.lng))
          hasPoints = true
        })
      }
    })

    if (hasPoints) {
      map.fitBounds(bounds, 50)
    }
  }, [map, routes, selectedRouteId])

  return (
    <div className="relative h-full w-full">
      {/* Always render the map container so the ref can attach */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Overlay loading/error states */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0C10] text-[#8B949E]">
          <MapPin size={48} className="mb-4 animate-pulse opacity-50" />
          <p className="text-lg">Loading map...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0C10] text-[#8B949E]">
          <MapPin size={48} className="mb-4 opacity-50" />
          <p className="text-lg">Map unavailable</p>
          <p className="text-sm">Check your API key configuration</p>
          <p className="mt-2 text-xs text-red-400">{error.message}</p>
          <p className="mt-2 text-xs">Routes can still be managed via the sidebar</p>
        </div>
      )}

      {/* Render routes once map is loaded */}
      {map && isLoaded && (
        <RouteRenderer map={map} routes={routes} selectedRouteId={selectedRouteId} />
      )}
    </div>
  )
}
