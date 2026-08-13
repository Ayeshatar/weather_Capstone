import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { formatTemp } from '../utils/format'

// Small standalone fetch (current temperature only) so this page doesn't
// need to reach into useWeather's single-location state — each favourite
// card fetches its own current reading independently.
async function fetchCurrentTemp(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return data?.current?.temperature_2m ?? null
}

export default function Favourites() {
  const { favorites, removeFavorite } = useFavorites()
  const [temps, setTemps] = useState({}) // key: "name|lat|lon" -> celsius

  useEffect(() => {
    let cancelled = false
    favorites.forEach(async (loc) => {
      const key = `${loc.name}|${loc.lat}|${loc.lon}`
      const temp = await fetchCurrentTemp(loc.lat, loc.lon)
      if (!cancelled) setTemps((prev) => ({ ...prev, [key]: temp }))
    })
    return () => {
      cancelled = true
    }
  }, [favorites])

  return (
    <div className="favourites-page">
      <h1>Favourites</h1>

      {favorites.length === 0 && (
        <p className="favourites-empty">
          No saved cities yet. Search for a place on the home page and tap the star to save it here.
        </p>
      )}

      <ul className="favourites-list">
        {favorites.map((loc) => {
          const key = `${loc.name}|${loc.lat}|${loc.lon}`
          const temp = temps[key]
          return (
            <li key={key} className="favourite-card">
              <div>
                <p className="favourite-name">{loc.name}</p>
                {loc.country && <p className="favourite-country">{loc.country}</p>}
              </div>
              <div className="favourite-actions">
                <span className="favourite-temp">
                  {temp === undefined ? '…' : formatTemp(temp, 'C')}
                </span>
                <Link
                  className="favourite-view"
                  to={`/?lat=${loc.lat}&lon=${loc.lon}&name=${encodeURIComponent(loc.name)}&country=${encodeURIComponent(loc.country ?? '')}`}
                >
                  View
                </Link>
                <button type="button" className="favourite-remove" onClick={() => removeFavorite(loc)}>
                  Remove
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
