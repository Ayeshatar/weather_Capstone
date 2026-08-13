import WeatherIcon from './WeatherIcon'
import { formatTemp } from '../utils/format'

export default function CurrentConditions({
  location,
  current,
  group,
  label,
  unit,
  onToggleUnit,
  isFavorite = false,
  canFavorite = false,
  onToggleFavorite,
}) {
  return (
    <section className="current-panel">
      <header className="current-header">
        <div>
          <h1>{location.name}</h1>
          {location.country && <p className="location-context">{location.country}</p>}
        </div>
        <div className="current-header-actions">
          <button
            type="button"
            className={`favorite-toggle${isFavorite ? ' is-favorite' : ''}${canFavorite ? '' : ' needs-login'}`}
            onClick={onToggleFavorite}
            title={
              canFavorite
                ? isFavorite
                  ? 'Remove from favourites'
                  : 'Save to favourites'
                : 'Log in to save favourites'
            }
            aria-label={
              canFavorite
                ? isFavorite
                  ? 'Remove from favourites'
                  : 'Save to favourites'
                : 'Log in to save favourites'
            }
            aria-pressed={isFavorite}
          >
            <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
          </button>
          <button
            type="button"
            className="unit-toggle"
            onClick={onToggleUnit}
            aria-label={`Switch to degrees ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          >
            °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>
      </header>

      <div className="current-hero">
        <WeatherIcon group={group} isDay={current.is_day === 1} size={64} color="var(--accent)" />
        <span className="current-temp">{formatTemp(current.temperature_2m, unit)}</span>
      </div>
      <p className="current-label">{label}</p>

      <dl className="readouts">
        <div className="readout">
          <dt>FEELS</dt>
          <dd>{formatTemp(current.apparent_temperature, unit)}</dd>
        </div>
        <div className="readout">
          <dt>HUM</dt>
          <dd>{Math.round(current.relative_humidity_2m)}%</dd>
        </div>
        <div className="readout">
          <dt>WIND</dt>
          <dd>{Math.round(current.wind_speed_10m)} km/h</dd>
        </div>
      </dl>
    </section>
  )
}
