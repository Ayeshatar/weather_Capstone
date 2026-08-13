export function formatTemp(celsius, unit) {
  if (celsius === null || celsius === undefined) return '--'
  const value = unit === 'F' ? (celsius * 9) / 5 + 32 : celsius
  return `${Math.round(value)}°`
}

export function formatHour(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric' })
}

export function formatWeekday(isoDateString, index) {
  if (index === 0) return 'Today'
  return new Date(isoDateString).toLocaleDateString([], { weekday: 'short' })
}

// Returns 0 (sunrise) .. 1 (sunset) for how far "now" is between the two,
// clamping to the edges outside daylight hours.
export function dayProgress(sunriseISO, sunsetISO, nowMs = Date.now()) {
  const sunrise = new Date(sunriseISO).getTime()
  const sunset = new Date(sunsetISO).getTime()
  if (!sunrise || !sunset || sunset <= sunrise) return 0.5
  return (nowMs - sunrise) / (sunset - sunrise)
}
