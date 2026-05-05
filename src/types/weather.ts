export interface WeatherBundle {
  locations: Record<string, LocationWeather>
  fetchedAt: string
}

export interface LocationWeather {
  locationId: string
  daily: DailyForecast[]
  hourly: HourlyForecast[]
}

export interface DailyForecast {
  date: string
  high: number
  low: number
  condition: WeatherCondition
  precipChance: number
}

export interface HourlyForecast {
  time: string
  temp: number
  condition: WeatherCondition
  precipChance: number
  windSpeed?: number
}

export type WeatherCondition =
  | 'sun'
  | 'partly'
  | 'cloud'
  | 'rain'
  | 'storm'
  | 'fog'
  | 'wind'
  | 'snow'

export interface MapWeatherTarget {
  locationId: string
  coordinates: { lat: number; lng: number }
  label: string
}
