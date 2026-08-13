// Open-Meteo reports weather using WMO (World Meteorological Organization)
// codes. This table translates those codes into a human label plus a
// "group" used to pick the sky theme and icon.
export const WEATHER_CODES = {
  0: { label: 'Clear sky', group: 'clear' },
  1: { label: 'Mainly clear', group: 'clear' },
  2: { label: 'Partly cloudy', group: 'cloudy' },
  3: { label: 'Overcast', group: 'cloudy' },
  45: { label: 'Fog', group: 'fog' },
  48: { label: 'Depositing rime fog', group: 'fog' },
  51: { label: 'Light drizzle', group: 'drizzle' },
  53: { label: 'Moderate drizzle', group: 'drizzle' },
  55: { label: 'Dense drizzle', group: 'drizzle' },
  56: { label: 'Light freezing drizzle', group: 'drizzle' },
  57: { label: 'Dense freezing drizzle', group: 'drizzle' },
  61: { label: 'Slight rain', group: 'rain' },
  63: { label: 'Moderate rain', group: 'rain' },
  65: { label: 'Heavy rain', group: 'rain' },
  66: { label: 'Light freezing rain', group: 'rain' },
  67: { label: 'Heavy freezing rain', group: 'rain' },
  71: { label: 'Slight snow fall', group: 'snow' },
  73: { label: 'Moderate snow fall', group: 'snow' },
  75: { label: 'Heavy snow fall', group: 'snow' },
  77: { label: 'Snow grains', group: 'snow' },
  80: { label: 'Slight rain showers', group: 'rain' },
  81: { label: 'Moderate rain showers', group: 'rain' },
  82: { label: 'Violent rain showers', group: 'rain' },
  85: { label: 'Slight snow showers', group: 'snow' },
  86: { label: 'Heavy snow showers', group: 'snow' },
  95: { label: 'Thunderstorm', group: 'thunder' },
  96: { label: 'Thunderstorm, slight hail', group: 'thunder' },
  99: { label: 'Thunderstorm, heavy hail', group: 'thunder' },
}

export function describeWeatherCode(code) {
  return WEATHER_CODES[code] ?? { label: 'Unknown', group: 'cloudy' }
}
