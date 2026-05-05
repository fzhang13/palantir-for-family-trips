import { useMemo } from 'react'
import type { TripDocument, Route } from '@/types'

export interface RouteProgress {
  routeId: string
  progress: number
  currentPosition: { lat: number; lng: number } | null
  isActive: boolean
}

interface UseRoutePlaybackReturn {
  activeRoutes: RouteProgress[]
  isAnyRouteActive: boolean
}

export function useRoutePlayback(
  doc: TripDocument,
  cursorSlot: number
): UseRoutePlaybackReturn {
  const activeRoutes = useMemo(() => {
    const routes = doc.routes || []
    const progressList: RouteProgress[] = []

    routes.forEach((route) => {
      const isActive =
        cursorSlot >= route.simulationStartSlot &&
        cursorSlot <= route.simulationEndSlot

      if (isActive) {
        const totalSlots = route.simulationEndSlot - route.simulationStartSlot
        const elapsedSlots = cursorSlot - route.simulationStartSlot
        const progress = totalSlots > 0 ? elapsedSlots / totalSlots : 0

        const currentPosition = interpolatePosition(route, progress)

        progressList.push({
          routeId: route.id,
          progress,
          currentPosition,
          isActive: true,
        })
      }
    })

    return progressList
  }, [doc.routes, cursorSlot])

  const isAnyRouteActive = activeRoutes.length > 0

  return {
    activeRoutes,
    isAnyRouteActive,
  }
}

function interpolatePosition(
  route: Route,
  progress: number
): { lat: number; lng: number } | null {
  if (!route.path || route.path.length === 0) {
    return route.originCoordinates
  }

  const index = Math.floor(progress * (route.path.length - 1))
  return route.path[index] || route.originCoordinates
}
