import { useEffect, useRef } from 'react'
import type { Route } from '@/types'

interface RouteRendererProps {
  map: google.maps.Map | null
  routes: Route[]
  selectedRouteId?: string
}

const DEFAULT_ROUTE_COLOR = '#58A6FF' // Info blue
const SELECTED_ROUTE_COLOR = '#3FB950' // Success green
const DEFAULT_STROKE_WEIGHT = 4
const SELECTED_STROKE_WEIGHT = 6

export function RouteRenderer({ map, routes, selectedRouteId }: RouteRendererProps) {
  const polylinesRef = useRef<google.maps.Polyline[]>([])

  useEffect(() => {
    if (!map || !window.google) {
      return
    }

    // Clear existing polylines
    polylinesRef.current.forEach(polyline => polyline.setMap(null))
    polylinesRef.current = []

    // Render each route
    routes.forEach(route => {
      if (!route.path || route.path.length === 0) {
        return
      }

      const isSelected = route.id === selectedRouteId

      const polyline = new google.maps.Polyline({
        path: route.path.map(point => ({
          lat: point.lat,
          lng: point.lng,
        })),
        geodesic: true,
        strokeColor: isSelected ? SELECTED_ROUTE_COLOR : DEFAULT_ROUTE_COLOR,
        strokeOpacity: 0.8,
        strokeWeight: isSelected ? SELECTED_STROKE_WEIGHT : DEFAULT_STROKE_WEIGHT,
        map,
      })

      polylinesRef.current.push(polyline)
    })

    // Cleanup on unmount
    return () => {
      polylinesRef.current.forEach(polyline => polyline.setMap(null))
      polylinesRef.current = []
    }
  }, [map, routes, selectedRouteId])

  return null
}
