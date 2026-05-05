export type PageType =
  | 'itinerary'
  | 'stay'
  | 'meals'
  | 'activities'
  | 'expenses'
  | 'families'

// NOTE: Unused placeholder types - actual runtime uses inline types in TripDocument
// Kept for potential future use, but not currently matching runtime structures
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
  type: string
  id: string
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

// GateContext - matches runtime structure from buildOperationGateContext in App.jsx
export interface GateContext {
  dayId: string
  dayMeta: string
  theme: string
  title: string
  operationLabel: string
  code: string
  targetTitle: string
  targetMeta: string
  deploymentLabel: string
  objective: string
  launchLabel: string
  etaLabel: string
  unitCount: number
  routeCount: number
  families: unknown[]
  briefingSummary: string
}
