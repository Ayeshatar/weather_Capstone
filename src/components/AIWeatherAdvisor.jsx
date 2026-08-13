import { useCallback, useEffect, useMemo, useState } from 'react'

function buildPromptPayload(weather, location, unit) {
  return {
    weather,
    location,
    unit,
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (typeof payload.summary !== 'string' || typeof payload.recommendation !== 'string') return null
  if (typeof payload.bestTime !== 'string' || typeof payload.caution !== 'string') return null
  if (!Array.isArray(payload.thingsToCarry)) return null
  if (!payload.thingsToCarry.every((item) => typeof item === 'string')) return null
  return payload
}

function messageForReason(reason) {
  switch (reason) {
    case 'missing-key':
      return "AI advice isn't configured yet (no ANTHROPIC_API_KEY on the server). Your weather forecast is still available."
    case 'timeout':
      return 'The AI advisor took too long to respond. Please try again.'
    case 'provider-error':
      return 'The AI provider had a problem generating advice. Please try again shortly.'
    case 'invalid-response':
    case 'invalid':
      return 'The AI advisor returned an unexpected response. Please try again.'
    case 'invalid-request':
      return "We're missing weather data to base advice on — try reloading the forecast."
    default:
      return 'AI recommendations are temporarily unavailable. Your weather forecast is still available.'
  }
}

export default function AIWeatherAdvisor({ weather, location, unit }) {
  const [advice, setAdvice] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const canRequest = useMemo(() => Boolean(weather && location), [weather, location])

  const requestAdvice = useCallback(async () => {
    if (!canRequest || status === 'loading') return
    setStatus('loading')
    setError('')
    setAdvice(null)

    try {
      const response = await fetch('/api/ai-weather-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPromptPayload(weather, location, unit)),
      })

      if (!response.ok) {
        let reason = 'unavailable'
        try {
          const body = await response.json()
          reason = body?.error || reason
        } catch {
          // response wasn't JSON — keep the generic reason
        }
        throw new Error(reason)
      }

      const payload = await response.json()
      const safePayload = validatePayload(payload)
      if (!safePayload) {
        throw new Error('invalid-response')
      }

      setAdvice(safePayload)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setError(messageForReason(err.message))
    }
  }, [canRequest, status, weather, location, unit])

  useEffect(() => {
    return () => {
      setAdvice(null)
      setStatus('idle')
      setError('')
    }
  }, [])

  if (!canRequest) {
    return null
  }

  return (
    <section className="ai-panel" aria-labelledby="ai-advisor-heading">
      <div className="ai-panel-header">
        <div>
          <p className="eyebrow">AI Weather Advisor</p>
          <h2 id="ai-advisor-heading">Plan your day with guidance based on the forecast</h2>
        </div>
        <button type="button" className="ai-action" onClick={requestAdvice} disabled={status === 'loading'}>
          {status === 'loading' ? 'Thinking…' : 'Get Advice'}
        </button>
      </div>

      <p className="ai-description">
        SkyWatch turns current conditions and the next few hours of weather into practical advice.
      </p>

      {status === 'loading' && <p className="status-msg" role="status">Fetching tailored recommendations…</p>}

      {status === 'error' && (
        <div className="ai-card ai-error" role="alert">
          <p>{error}</p>
          <button type="button" className="ai-retry" onClick={requestAdvice}>
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && advice && (
        <div className="ai-results" aria-live="polite">
          <div className="ai-card">
            <h3>Weather summary</h3>
            <p>{advice.summary}</p>
          </div>
          <div className="ai-card">
            <h3>Recommendation</h3>
            <p>{advice.recommendation}</p>
          </div>
          <div className="ai-card">
            <h3>What to carry</h3>
            <ul>
              {advice.thingsToCarry.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="ai-card">
            <h3>Best time</h3>
            <p>{advice.bestTime}</p>
          </div>
          <div className="ai-card">
            <h3>Weather caution</h3>
            <p>{advice.caution}</p>
          </div>
        </div>
      )}
    </section>
  )
}
