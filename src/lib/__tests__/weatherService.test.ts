import { describe, it, expect, vi } from 'vitest'
import { fetchWeather, WeatherForecast } from '../weatherService'

// Mock fetch globally
global.fetch = vi.fn()

describe('weatherService', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches weather from Open-Meteo API', async () => {
    const mockResponse = {
      daily: {
        time: ['2026-05-15'],
        temperature_2m_max: [75],
        temperature_2m_min: [60],
        precipitation_sum: [0],
        weathercode: [0],
      },
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await fetchWeather(
      { lat: 36.05, lng: -112.14 },
      new Date('2026-05-15')
    )

    expect(result).toMatchObject({
      date: '2026-05-15',
      condition: 'Clear',
      temperature: 75,
      precipitation: 0,
    })
    expect(result.fetchedAt).toBeDefined()
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    await expect(
      fetchWeather({ lat: 36.05, lng: -112.14 }, new Date('2026-05-15'))
    ).rejects.toThrow('Failed to fetch weather')
  })

  it('maps weather codes correctly', async () => {
    const mockResponse = {
      daily: {
        time: ['2026-05-15'],
        temperature_2m_max: [65],
        temperature_2m_min: [55],
        precipitation_sum: [5],
        weathercode: [61], // Rain
      },
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await fetchWeather(
      { lat: 36.05, lng: -112.14 },
      new Date('2026-05-15')
    )

    expect(result.condition).toBe('Rainy')
  })
})
