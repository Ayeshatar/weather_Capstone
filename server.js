import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config({ path: '.env.local' })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'

const app = express()
app.use(express.json())

// Lightweight liveness/readiness check for uptime monitors and platform
// health checks (Render/Railway/Fly/etc). Reports whether the AI key is
// configured so a monitor can distinguish "server down" from "AI advice
// unavailable" without hitting the paid Anthropic endpoint.
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    uptime: process.uptime(),
  })
})

app.post('/api/ai-weather-advice', async (req, res) => {
  const { weather, location, unit } = req.body || {}

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'missing-key' })
  }

  if (!weather || !location) {
    return res.status(400).json({ error: 'invalid-request' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are SkyWatch's weather planning assistant. Use only the weather data provided by the application. Never invent weather data. Clearly separate facts from advice. Give concise, practical guidance. Avoid medical claims. Return strict JSON with keys summary, recommendation, thingsToCarry, bestTime, caution.`,
        messages: [
          {
            role: 'user',
            content: `Weather data: ${JSON.stringify({ weather, location, unit })}`,
          },
        ],
      }),
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '')
      console.error(`[ai-weather-advice] Anthropic API returned ${response.status} ${response.statusText}: ${bodyText.slice(0, 500)}`)
      return res.status(502).json({ error: 'provider-error' })
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text ?? ''
    const payload = extractJson(text)

    if (!payload) {
      return res.status(502).json({ error: 'invalid-response' })
    }

    return res.json(payload)
  } catch (error) {
    console.error('[ai-weather-advice] request failed:', error.message)
    return res.status(504).json({ error: 'timeout' })
  }
})

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[0])
    const valid = typeof parsed.summary === 'string' && typeof parsed.recommendation === 'string' && Array.isArray(parsed.thingsToCarry) && typeof parsed.bestTime === 'string' && typeof parsed.caution === 'string'
    return valid ? parsed : null
  } catch {
    return null
  }
}

// In production, this same process also serves the built frontend
// (`npm run build` output in dist/), so the whole app — static assets, the
// AI proxy, and the health check — deploys as one Node service with no
// separate static host required. In dev, Vite serves the frontend on 5173
// and proxies /api to this server instead (see vite.config.js).
if (isProduction) {
  const distPath = path.join(__dirname, 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`SkyWatch server listening on port ${PORT}${isProduction ? ' (production)' : ''}`)
})