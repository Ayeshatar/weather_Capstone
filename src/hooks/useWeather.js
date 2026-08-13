import { useCallback, useState } from 'react'

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'weather_code',
  'wind_speed_10m',
].join(',')

const HOURLY_FIELDS = ['temperature_2m', 'weather_code', 'is_day'].join(',')

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
].join(',')

/**
 * Encapsulates every network concern for the app: turning a place name into
 * coordinates, and turning coordinates into a forecast. Keeping this in one
 * hook means <App /> only ever deals with plain state, not fetch details.
 */
export function useWeather() {
  const [location, setLocation] = useState(null) // { name, country, lat, lon }
  const [weather, setWeather] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | error | ready
  const [error, setError] = useState(null)

  const searchLocations = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return []
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Location search failed')
    const data = await res.json()
    return data.results ?? []
  }, [])

  const fetchForecast = useCallback(async (lat, lon) => {
    const url =
      `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      `&current=${CURRENT_FIELDS}&hourly=${HOURLY_FIELDS}&daily=${DAILY_FIELDS}` +
      `&timezone=auto&forecast_days=7`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Forecast request failed')
    return res.json()
  }, [])

  const loadLocation = useCallback(
    async (place) => {
      setStatus('loading')
      setError(null)
      try {
        const data = await fetchForecast(place.latitude, place.longitude)
        setLocation({
          name: place.name,
          country: place.country ?? place.country_code ?? '',
          lat: place.latitude,
          lon: place.longitude,
        })
        setWeather(data)
        setStatus('ready')
      } catch (err) {
        setError(err.message || 'Something went wrong fetching the forecast')
        setStatus('error')
      }
    },
    [fetchForecast],
  )

  const loadCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const data = await fetchForecast(latitude, longitude)
          setLocation({ name: 'Your location', country: '', lat: latitude, lon: longitude })
          setWeather(data)
          setStatus('ready')
        } catch (err) {
          setError(err.message || 'Something went wrong fetching the forecast')
          setStatus('error')
        }
      },
      () => {
        setError('Location permission was denied')
        setStatus('error')
      },
      { timeout: 10000 },
    )
  }, [fetchForecast])

  return {
    location,
    weather,
    status,
    error,
    searchLocations,
    loadLocation,
    loadCurrentPosition,
  }
}
