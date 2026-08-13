/**
 * The backdrop doubles as an instrument: the small marker traveling along the
 * arc is the sun (or moon) plotted at its real position between sunrise and
 * sunset for the viewed location, not a decorative animation.
 */
export default function SkyBackdrop({ sky, accent, progress = 0.5, isDay = true }) {
  const [top, mid, bottom] = sky
  const clamped = Math.min(1, Math.max(0, progress))
  // Arc runs left (sunrise) to right (sunset) across a shallow dome.
  const arcX = 40 + clamped * 320
  const arcY = 210 - Math.sin(clamped * Math.PI) * 150

  return (
    <div className="sky-backdrop" aria-hidden="true">
      <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={top} />
            <stop offset="55%" stopColor={mid} />
            <stop offset="100%" stopColor={bottom} />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#skyGradient)" />
        <path
          d="M20 210 Q200 40 380 210"
          stroke={accent}
          strokeOpacity="0.25"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="2 6"
        />
        <circle cx={arcX} cy={arcY} r={isDay ? 10 : 7} fill={accent} className="sky-marker" />
        {!isDay && (
          <circle cx={arcX - 3} cy={arcY - 2} r="7.5" fill={mid} opacity="0.9" />
        )}
      </svg>
    </div>
  )
}
