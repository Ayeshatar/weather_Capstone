import WeatherIcon from './WeatherIcon'
import { describeWeatherCode } from '../utils/weatherCodes'
import { formatHour, formatTemp } from '../utils/format'

export default function HourlyStrip({ hourly, unit, nowIndex }) {
  const slice = hourly.time.slice(nowIndex, nowIndex + 12)

  return (
    <section className="hourly-strip">
      <h2>Next hours</h2>
      <div className="hourly-track">
        {slice.map((time, i) => {
          const idx = nowIndex + i
          const { group } = describeWeatherCode(hourly.weather_code[idx])
          return (
            <div className="hourly-item" key={time}>
              <span className="hourly-time">{i === 0 ? 'Now' : formatHour(time)}</span>
              <WeatherIcon group={group} isDay={hourly.is_day[idx] === 1} size={24} color="var(--accent)" />
              <span className="hourly-temp">{formatTemp(hourly.temperature_2m[idx], unit)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
