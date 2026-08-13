// Every "group" (clear / cloudy / fog / drizzle / rain / snow / thunder) gets
// a day palette and a night palette. The gradient stops paint the backdrop,
// and `accent` tints the readout numbers + the sun/moon marker.
const PALETTES = {
  clear: {
    day: { sky: ['#4A90D9', '#8FC7E8', '#F4E3B2'], accent: '#F2A93B', ink: '#12293F' },
    night: { sky: ['#0B1230', '#1B2856', '#2E3B6E'], accent: '#C9D3F2', ink: '#E9ECFA' },
  },
  cloudy: {
    day: { sky: ['#7C8CA0', '#A9B6C4', '#D8DEE4'], accent: '#8A97A8', ink: '#232C34' },
    night: { sky: ['#151A22', '#2A3340', '#3F4A58'], accent: '#AEB9C6', ink: '#E7EBEF' },
  },
  fog: {
    day: { sky: ['#9AA3A0', '#C3C9C4', '#E4E6E1'], accent: '#7C8A82', ink: '#25302B' },
    night: { sky: ['#181D1B', '#2B332F', '#414B44'], accent: '#AAB6AF', ink: '#E7EBE8' },
  },
  drizzle: {
    day: { sky: ['#4C6B7A', '#6F97A3', '#B7D2CE'], accent: '#3FA6A0', ink: '#122A2A' },
    night: { sky: ['#0B1B22', '#173038', '#25454C'], accent: '#7FD6CE', ink: '#E4F3F0' },
  },
  rain: {
    day: { sky: ['#3B5468', '#4E7286', '#7C9BA6'], accent: '#2FB6C4', ink: '#0E212B' },
    night: { sky: ['#08131D', '#122736', '#1D3B4B'], accent: '#6FD6E4', ink: '#E3F3F6' },
  },
  snow: {
    day: { sky: ['#7C8FB0', '#B4C4DC', '#EDF2F9'], accent: '#5D77A6', ink: '#1E2A3D' },
    night: { sky: ['#151B2C', '#2A3550', '#4B5A7E'], accent: '#C7D3EE', ink: '#EDF0FA' },
  },
  thunder: {
    day: { sky: ['#2B2740', '#4A3F63', '#7A6A8E'], accent: '#B98CE0', ink: '#F1EAF8' },
    night: { sky: ['#0A0814', '#1D1730', '#332851'], accent: '#C9A6EC', ink: '#F3ECFB' },
  },
}

export function getSkyTheme(group, isDay) {
  const entry = PALETTES[group] ?? PALETTES.cloudy
  return entry[isDay ? 'day' : 'night']
}
