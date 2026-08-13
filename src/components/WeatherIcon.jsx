// Hand-drawn (not emoji) icons keep the "instrument panel" feel consistent
// across light and dark skies, since we can control stroke color directly.
export default function WeatherIcon({ group, isDay = true, size = 28, color = 'currentColor' }) {
  const stroke = color
  const common = { stroke, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
  const a11y = { role: 'img', 'aria-hidden': true, focusable: 'false' }

  switch (group) {
    case 'clear':
      return isDay ? (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <circle cx="16" cy="16" r="6.5" {...common} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="16"
              y1="4"
              x2="16"
              y2="7.5"
              {...common}
              transform={`rotate(${deg} 16 16)`}
            />
          ))}
        </svg>
      ) : (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <path d="M21 12.5a8 8 0 1 1-9.5-9.4 6.5 6.5 0 0 0 9.5 9.4Z" {...common} />
        </svg>
      )
    case 'cloudy':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <path
            d="M9.5 22h13a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 11.6 11 5 5 0 0 0 9.5 22Z"
            {...common}
          />
        </svg>
      )
    case 'fog':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <path d="M9 12h13" {...common} />
          <path d="M6 17h20" {...common} />
          <path d="M9 22h13" {...common} />
        </svg>
      )
    case 'drizzle':
    case 'rain':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <path
            d="M9.5 17.5h13a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 11.6 6 5 5 0 0 0 9.5 17.5Z"
            {...common}
          />
          <line x1="11" y1="21" x2="9.5" y2="25.5" {...common} />
          <line x1="16" y1="21" x2="14.5" y2="25.5" {...common} />
          <line x1="21" y1="21" x2="19.5" y2="25.5" {...common} />
        </svg>
      )
    case 'snow':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <path
            d="M9.5 15.5h13a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 11.6 4 5 5 0 0 0 9.5 15.5Z"
            {...common}
          />
          {[10, 16, 22].map((x) => (
            <g key={x}>
              <line x1={x} y1="19" x2={x} y2="26" {...common} />
              <line x1={x - 2.4} y1="20.5" x2={x + 2.4} y2="24.5" {...common} />
              <line x1={x + 2.4} y1="20.5" x2={x - 2.4} y2="24.5" {...common} />
            </g>
          ))}
        </svg>
      )
    case 'thunder':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <path
            d="M9.5 14.5h13a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 11.6 3 5 5 0 0 0 9.5 14.5Z"
            {...common}
          />
          <path d="M17 17l-4.5 7h4L15 30l6-8.5h-4Z" {...common} />
        </svg>
      )
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" {...a11y}>
          <circle cx="16" cy="16" r="8" {...common} />
        </svg>
      )
  }
}
