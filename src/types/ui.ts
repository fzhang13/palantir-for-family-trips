export type PageType =
  | 'itinerary'
  | 'stay'
  | 'meals'
  | 'activities'
  | 'expenses'
  | 'families'

export interface UIState {
  currentPage: PageType
  timeline: TimelineState
  selection: EntitySelection | null
  map: MapState
  pageNotes: Record<PageType, string>
  search: SearchState
}

export interface TimelineState {
  cursorSlot: number
  isPlaying: boolean
  playbackSpeed: number
  showBriefing: boolean
  showMissionLaunch: boolean
  missionGateId?: string
}

export interface EntitySelection {
  entityType: string
  entityId: string
}

export interface MapState {
  showWeather: boolean
  showRoutes: boolean
  showLocations: boolean
  visibleLayers: string[]
}

export interface SearchState {
  query: string
  results: unknown[]
  isOpen: boolean
}

export type ToneName =
  | 'default'
  | 'Transit'
  | 'Activity'
  | 'Meal'
  | 'Critical'
  | 'Warning'
  | 'Success'

export interface GateContext {
  gate: unknown
  relatedRoutes: unknown[]
  estimatedArrivals: string[]
  readinessStatus: string
}
