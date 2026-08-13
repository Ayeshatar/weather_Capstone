import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import SkyBackdrop from '../components/SkyBackdrop'
import CurrentConditions from '../components/CurrentConditions'
import HourlyStrip from '../components/HourlyStrip'
import DailyForecast from '../components/DailyForecast'
import AIWeatherAdvisor from '../components/AIWeatherAdvisor'
import { useWeather } from '../hooks/useWeather'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { describeWeatherCode } from '../utils/weatherCodes'
import { getSkyTheme } from '../utils/theme'
import { dayProgress } from '../utils/format'

const DEFAULT_PLACE = { name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011 }

export default function Home() {
  const { location, weather, status, error, searchLocations, loadLocation, loadCurrentPosition } =
    useWeather()
  const [unit, setUnit] = useState('C')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()

  // On mount: if we arrived here from the Favourites page (lat/lon/name in
  // the query string), load that city. Otherwise fall back to the default.
  // Either way this only runs once, on mount — see the useEffect note below.
  useEffect(() => {
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const name = searchParams.get('name')
    if (lat && lon && name) {
      loadLocation({
        name,
        country: searchParams.get('country') ?? '',
        latitude: Number(lat),
        longitude: Number(lon),
      })
    } else {
      // NOTE: this originally used `useMemo` to trigger the fetch, which is
      // a React anti-pattern (useMemo is for pure derived values, not side
      // effects, and isn't guaranteed to run only once). Moved to useEffect
      // with an empty dependency array so it fires exactly once, on mount.
      loadLocation({
        name: DEFAULT_PLACE.name,
        country: DEFAULT_PLACE.country,
        latitude: DEFAULT_PLACE.latitude,
        longitude: DEFAULT_PLACE.longitude,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = weather?.current
  const { group, label } = current ? describeWeatherCode(current.weather_code) : { group: 'clear', label: '' }
  const isDay = current ? current.is_day === 1 : true
  const theme = getSkyTheme(group, isDay)

  // Open-Meteo returns `current.time`, `hourly.time`, and `daily.sunrise` /
  // `sunset` all as *naive* timestamps already local to the searched place
  // (not the visitor's browser timezone, and not UTC). The first draft
  // compared these against `new Date()` / `Date.now()`, which are anchored
  // to the browser's own timezone — that only ever matched by coincidence
  // when the searched city shared the visitor's UTC offset. Fixed by
  // anchoring every comparison to `current.time`, which lives in the same
  // naive-local frame as the rest of the response.
  const progress = weather?.daily && current
    ? dayProgress(weather.daily.sunrise[0], weather.daily.sunset[0], new Date(current.time).getTime())
    : 0.5

  const nowIndex = useMemo(() => {
    if (!weather?.hourly || !current) return 0
    const nowHourPrefix = current.time.slice(0, 13)
    const idx = weather.hourly.time.findIndex((t) => t.startsWith(nowHourPrefix))
    return idx === -1 ? 0 : idx
  }, [weather, current])

  const favoriteTarget = location ? { name: location.name, country: location.country, lat: location.lat, lon: location.lon } : null

  return (
    <div
      className="app"
      style={{
        '--accent': theme.accent,
        '--ink': theme.ink,
      }}
    >
      <SkyBackdrop sky={theme.sky} accent={theme.accent} progress={progress} isDay={isDay} />

      <main className="app-content">
        <SearchBar
          onSearch={searchLocations}
          onSelect={(place) =>
            loadLocation({
              name: place.name,
              country: place.country,
              latitude: place.latitude,
              longitude: place.longitude,
            })
          }
          onUseLocation={loadCurrentPosition}
        />

        {status === 'loading' && (
          <p className="status-msg" role="status">
            Reading the sky…
          </p>
        )}
        {status === 'error' && (
          <p className="status-msg status-error" role="alert">
            {error}{' '}
            <button
              type="button"
              className="status-retry"
              onClick={() =>
                loadLocation(
                  location
                    ? { name: location.name, country: location.country, latitude: location.lat, longitude: location.lon }
                    : { name: DEFAULT_PLACE.name, country: DEFAULT_PLACE.country, latitude: DEFAULT_PLACE.latitude, longitude: DEFAULT_PLACE.longitude },
                )
              }
            >
              Retry
            </button>
          </p>
        )}

        {status === 'ready' && weather && location && (
          <>
            <CurrentConditions
              location={location}
              current={current}
              group={group}
              label={label}
              unit={unit}
              onToggleUnit={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
              isFavorite={user && favoriteTarget ? isFavorite(favoriteTarget) : false}
              canFavorite={Boolean(user)}
              onToggleFavorite={() => {
                if (!user) {
                  navigate('/login', { state: { from: '/' } })
                  return
                }
                if (favoriteTarget) toggleFavorite(favoriteTarget)
              }}
            />
            <HourlyStrip hourly={weather.hourly} unit={unit} nowIndex={nowIndex} />
            <DailyForecast daily={weather.daily} unit={unit} />
            <AIWeatherAdvisor weather={weather} location={location} unit={unit} />
          </>
        )}
      </main>
    </div>
  )
}
