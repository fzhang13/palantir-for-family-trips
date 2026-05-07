export interface WeatherForecast {
  date: string
  condition: string
  temperature: number
  precipitation: number
  fetchedAt: string
}

/**
 * Map Open-Meteo weather codes to human-readable conditions
 * https://open-meteo.com/en/docs
 */
function mapWeatherCode(code: number): string {
  if (code === 0) return 'Clear'
  if (code >= 1 && code <= 3) return 'Partly Cloudy'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rainy'
  if (code >= 71 && code <= 77) return 'Snowy'
  if (code >= 80 && code <= 82) return 'Rain Showers'
  if (code >= 85 && code <= 86) return 'Snow Showers'
  if (code >= 95 && code <= 99) return 'Thunderstorm'
  return 'Cloudy'
}

/**
 * Fetch weather forecast from Open-Meteo API
 */
export async function fetchWeather(
  coordinates: { lat: number; lng: number },
  date: Date
): Promise<WeatherForecast> {
  try {
    const dateStr = date.toISOString().split('T')[0]

    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.append('latitude', coordinates.lat.toString())
    url.searchParams.append('longitude', coordinates.lng.toString())
    url.searchParams.append('start_date', dateStr)
    url.searchParams.append('end_date', dateStr)
    url.searchParams.append('temperature_unit', 'fahrenheit')
    url.searchParams.append('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()

    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      throw new Error('No weather data available for this date')
    }

    const index = 0 // We requested single day
    const weatherCode = data.daily.weathercode[index]
    const tempMax = data.daily.temperature_2m_max[index]
    const precipitation = data.daily.precipitation_sum[index]

    return {
      date: dateStr,
      condition: mapWeatherCode(weatherCode),
      temperature: Math.round(tempMax),
      precipitation: Math.round(precipitation),
      fetchedAt: new Date().toISOString(),
    }
  } catch (error) {
    throw new Error(
      `Failed to fetch weather: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
