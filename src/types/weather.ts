// WeatherBundle - matches runtime structure from fetchWeatherBundle in weather.js
export interface WeatherBundle {
  label: string
  coordinates: {
    lat: number
    lng: number
  }
  placeLabel: string
  forecastPeriods: ForecastPeriod[]
  hourlyPeriods: HourlyPeriod[]
  live: {
    summary: string
    temperature: string
    iconKey: WeatherCondition
    timestamp: string | null
    wind?: number
  }
}

export interface ForecastPeriod {
  name?: string
  startTime: string
  endTime?: string
  isDaytime?: boolean
  temperature: number
  temperatureUnit?: string
  shortForecast: string
  detailedForecast?: string
}

export interface HourlyPeriod {
  startTime: string
  endTime?: string
  temperature: number
  temperatureUnit?: string
  shortForecast: string
  windSpeed?: string
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
