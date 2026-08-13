import WeatherIcon from './WeatherIcon'
import { describeWeatherCode } from '../utils/weatherCodes'
import { formatTemp, formatWeekday } from '../utils/format'

export default function DailyForecast({ daily, unit }) {
  return (
    <section className="daily-forecast">
      <h2>7-day outlook</h2>
      <ul>
        {daily.time.map((date, i) => {
          const { group, label } = describeWeatherCode(daily.weather_code[i])
          return (
            <li key={date} className="daily-row">
              <span className="daily-day">{formatWeekday(date, i)}</span>
              <span className="daily-icon">
                <WeatherIcon group={group} size={22} color="var(--accent)" />
              </span>
              <span className="daily-label">{label}</span>
              <span className="daily-range">
                <span className="daily-max">{formatTemp(daily.temperature_2m_max[i], unit)}</span>
                <span className="daily-min">{formatTemp(daily.temperature_2m_min[i], unit)}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
