import {
  LayoutGrid,
  Home,
  Utensils,
  Map as MapIcon,
  Receipt,
  Users,
  Sun,
  Cloud,
  CloudRain,
  type LucideIcon,
} from 'lucide-react'

export const PAGE_ICONS: Record<string, LucideIcon> = {
  itinerary: LayoutGrid,
  stay: Home,
  meals: Utensils,
  activities: MapIcon,
  expenses: Receipt,
  families: Users,
}

export const WEATHER_ICONS: Record<string, LucideIcon> = {
  sun: Sun,
  partly: Cloud,
  cloud: Cloud,
  rain: CloudRain,
  storm: CloudRain,
  fog: Cloud,
  wind: Cloud,
  snow: Cloud,
}

export const TONE_COLORS = {
  info: '#58A6FF',
  warning: '#D29922',
  success: '#3FB950',
  critical: '#F85149',
  violet: '#A371F7',
  muted: '#8B949E',
} as const

export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b0f14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0f14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#30363d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#11161d' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1712' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3fb950' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2a34' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#161b22' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#24313d' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#58a6ff' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1b2028' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#08111d' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#58a6ff' }] },
]

export const SPEED_REDUCTION_FACTOR = 0.75
export const MIN_ROUTE_LOOP_SECONDS = 16
export const MAX_ROUTE_LOOP_SECONDS = 34
export const PLAYBACK_SPEEDS = [1, 2, 4, 8] as const
