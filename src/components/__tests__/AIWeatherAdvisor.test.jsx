import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AIWeatherAdvisor from '../AIWeatherAdvisor'

const weatherFixture = {
  current: {
    temperature_2m: 24,
    apparent_temperature: 22,
    relative_humidity_2m: 64,
    wind_speed_10m: 18,
    weather_code: 3,
    is_day: 1,
    time: '2026-08-11T12:00',
  },
  hourly: {
    time: ['2026-08-11T12:00', '2026-08-11T13:00'],
    temperature_2m: [24, 26],
    weather_code: [3, 2],
    is_day: [1, 1],
  },
  daily: {
    sunrise: ['2026-08-11T05:00'],
    sunset: ['2026-08-11T19:00'],
    temperature_2m_max: [28],
    temperature_2m_min: [20],
    weather_code: [3],
  },
}

describe('AIWeatherAdvisor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders AI recommendations from the server response', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        summary: 'A light jacket will be useful today.',
        recommendation: 'Outdoor plans are workable in the late afternoon.',
        thingsToCarry: ['Light jacket', 'Water'],
        bestTime: 'Late afternoon',
        caution: 'Keep an eye on the breeze.',
      }),
    })

    render(<AIWeatherAdvisor weather={weatherFixture} location={{ name: 'Karachi', country: 'Pakistan' }} unit="C" />)

    await user.click(screen.getByRole('button', { name: /get advice/i }))

    expect(await screen.findByText('A light jacket will be useful today.')).toBeInTheDocument()
    expect(screen.getByText(/Outdoor plans are workable/i)).toBeInTheDocument()
    expect(screen.getByText('Light jacket')).toBeInTheDocument()
    expect(screen.getByText('Late afternoon')).toBeInTheDocument()
  })

  it('shows a friendly error when the request fails', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'server' }) })

    render(<AIWeatherAdvisor weather={weatherFixture} location={{ name: 'Karachi', country: 'Pakistan' }} unit="C" />)

    await user.click(screen.getByRole('button', { name: /get advice/i }))

    expect(await screen.findByText(/AI recommendations are temporarily unavailable/i)).toBeInTheDocument()
  })

  it('shows a fallback for malformed responses', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ summary: 123 }),
    })

    render(<AIWeatherAdvisor weather={weatherFixture} location={{ name: 'Karachi', country: 'Pakistan' }} unit="C" />)

    await user.click(screen.getByRole('button', { name: /get advice/i }))

    expect(await screen.findByText(/AI recommendations are temporarily unavailable/i)).toBeInTheDocument()
  })
})
