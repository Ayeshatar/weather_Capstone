import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWeather } from '../useWeather'

describe('useWeather', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('loads a location and exposes ready weather data', async () => {
    const forecastPayload = { current: { temperature_2m: 30 } }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => forecastPayload,
    })

    const { result } = renderHook(() => useWeather())

    await act(async () => {
      await result.current.loadLocation({
        name: 'Faisalabad',
        country: 'Pakistan',
        latitude: 31.4,
        longitude: 73.1,
      })
    })

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.weather).toEqual(forecastPayload)
    expect(result.current.location.name).toBe('Faisalabad')
    expect(result.current.error).toBeNull()
  })

  it('surfaces an error status when the forecast request fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })

    const { result } = renderHook(() => useWeather())

    await act(async () => {
      await result.current.loadLocation({
        name: 'Nowhere',
        country: '',
        latitude: 0,
        longitude: 0,
      })
    })

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error).toBe('Forecast request failed')
  })

  it('returns an empty array for a too-short search query without fetching', async () => {
    global.fetch = vi.fn()
    const { result } = renderHook(() => useWeather())

    const found = await result.current.searchLocations('a')
    expect(found).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
