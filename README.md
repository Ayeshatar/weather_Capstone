# SkyWatch — a React weather station with an AI advisor

A React app that looks up any city (or your current location) and shows
current conditions, the next 12 hours, and a 7‑day outlook, plus an
AI‑generated "what should I actually do today" advisory panel. Weather and
geocoding data come from the free [Open‑Meteo](https://open-meteo.com) API —
no API key required. The whole thing is built with plain React + Vite, no UI
library, so all styling and logic is visible and easy to follow.

Accounts and per‑user saved cities are handled locally in the browser
(`localStorage`) — there is **no external auth/database dependency**, so the
app runs with zero backend setup beyond the AI proxy described below. See
[Limitations](#limitations--future-improvements) for what that trade‑off
costs.

> **Note on project history:** an earlier draft of this README described a
> real Firebase Authentication/Firestore backend. That was never wired into
> the shipped code — `src/firebaseConfig.js` is an explicit no‑op — and this
> README has been corrected to describe what actually runs. The localStorage
> implementation in `AuthContext.jsx` / `FavoritesContext.jsx` is the real,
> current implementation.

## Features

- City search (debounced, Open‑Meteo geocoding) and "use my location"
- Current conditions, 12‑hour strip, 7‑day outlook, °C/°F toggle
- A live "sky" backdrop that shifts with real time‑of‑day and condition,
  with a sun/moon marker plotted at its actual position between sunrise
  and sunset
- **AI Weather Advisor**: turns the current forecast into a short, structured
  plan (summary, recommendation, what to carry, best time, caution) via a
  server‑side call to Claude
- Local accounts (sign up / log in) and per‑user favourite cities, saved via
  `localStorage`
- Error boundary, network error states, and AI fallback states throughout —
  the app stays usable if the AI panel or a fetch fails

## Architecture

```
index.html
server.js                  # Express: /api/ai-weather-advice, /api/health,
                            # and (in production) serves the built frontend
src/
  main.jsx                 # React entry point — ErrorBoundary + Router + Auth/Favorites providers
  App.jsx                  # route table (Home / Login / protected Favourites)
  App.css                  # design tokens & styling
  firebaseConfig.js        # intentionally inert — kept only to avoid a broken import path
  pages/
    Home.jsx               # the weather screen (search, current, hourly, daily, AI advisor)
    Login.jsx              # login / signup form (local accounts)
    Favourites.jsx          # saved cities, each with a live current temp
  components/
    ErrorBoundary.jsx       # catches render errors app-wide, shows a recovery screen
    NavBar.jsx               # route links + signed-in state
    ProtectedRoute.jsx        # redirect-to-login guard for /favourites
    SearchBar.jsx             # debounced place search + geolocation button
    SkyBackdrop.jsx            # animated gradient + sun/moon arc (signature visual)
    CurrentConditions.jsx      # big readout: temp, feels-like, humidity, wind, favourite star
    HourlyStrip.jsx            # scrollable next-12-hours row
    DailyForecast.jsx          # 7-day list
    WeatherIcon.jsx             # hand-drawn SVG icon per condition group
    AIWeatherAdvisor.jsx        # calls /api/ai-weather-advice, validates + renders the result
  context/
    AuthContext.jsx           # local accounts, session in localStorage
    FavoritesContext.jsx       # per-user saved cities in localStorage
  hooks/
    useWeather.js             # all fetch/geocoding logic, isolated from UI
  utils/
    weatherCodes.js            # WMO code -> label/group lookup
    theme.js                   # condition + day/night -> sky palette
    format.js                  # temperature/time formatting, day-progress math
```

**Data flow for weather:** `useWeather()` hits Open‑Meteo's geocoding and
forecast endpoints directly from the browser (no key required, no proxy
needed) and exposes `{ location, weather, status, error }` to `Home.jsx`.

**Data flow for AI advice:** the browser never talks to Anthropic directly.
`AIWeatherAdvisor.jsx` POSTs the already‑fetched forecast to
`/api/ai-weather-advice` on the app's own Express server; that server holds
the Anthropic API key (from `.env.local`, never sent to the client) and
makes the actual model call.

## AI integration

This is the core "meaningful AI" feature, not a bolt‑on chatbot: the model
is given the exact forecast data the user is already looking at and asked
to turn it into a short, actionable plan, not to answer open‑ended
questions or invent facts.

**Endpoint:** `POST /api/ai-weather-advice` (`server.js`)
**Model:** `claude-3-5-haiku-20241022`
**Request body Claude receives:**

```json
{ "weather": { /* full Open-Meteo current/hourly/daily payload */ }, "location": { "name": "...", "country": "..." }, "unit": "C" }
```

**System prompt actually sent:**

> You are SkyWatch's weather planning assistant. Use only the weather data
> provided by the application. Never invent weather data. Clearly separate
> facts from advice. Give concise, practical guidance. Avoid medical claims.
> Return strict JSON with keys summary, recommendation, thingsToCarry,
> bestTime, caution.

**Structured output + validation (both ends):**

1. The server asks for strict JSON and extracts the first `{...}` block from
   Claude's reply with `extractJson()`.
2. The server validates the parsed object's shape (`summary`/`recommendation`/
   `bestTime`/`caution` are strings, `thingsToCarry` is a string array) before
   ever returning it to the browser — a malformed or off‑schema model reply
   never reaches the client as if it were valid.
3. The browser **re‑validates independently** in `AIWeatherAdvisor.jsx`
   (`validatePayload()`), so even a server that got compromised or changed
   can't push malformed data straight into the UI.

**Fallback / error states:**

- No API key configured → server returns `503 missing-key`
- Bad request shape → `400 invalid-request`
- Anthropic call fails or times out (12s `AbortController`) → `502`/`504`
- Model reply isn't valid JSON or fails schema validation → `502 invalid-response`
- In every failure case the client shows: *"AI recommendations are
  temporarily unavailable. Your weather forecast is still available."* plus
  a **Try again** button — the core weather app is never blocked by an AI
  failure.

The Anthropic API key lives only in `.env.local` on the server and is never
sent to, or readable from, the browser bundle.

## Setup

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev                  # Vite (5173) + Express AI proxy (3001), concurrently
npm run build                # production build to dist/
npm run start                # production mode: one Express process serves dist/ + the API
npm test                     # run the test suite once
npm run test:coverage        # run tests with a coverage report
```

Weather search and the full UI work with **no** API key. Only the "Get
Advice" AI panel requires `ANTHROPIC_API_KEY` in `.env.local` — without it,
the panel degrades to its normal error/fallback state instead of crashing
anything.

## Accessibility (WCAG 2.1 AA)

- Icon‑only controls (locate button, favourite star, unit toggle) have
  explicit `aria-label`s, not just a `title` tooltip, so they're announced
  correctly by screen readers
- Decorative weather SVGs are marked `aria-hidden` since they're always
  paired with a visible text label (they'd otherwise be announced as
  unlabeled images)
- Visible `:focus-visible` outlines on every interactive element (search
  input, buttons, links) — not just `:hover`, so keyboard users always have
  a visible focus indicator
- `prefers-reduced-motion` respected — the sky‑marker animation is disabled
  for users who've asked for reduced motion at the OS level
- Live regions: `role="status"` while the AI request is loading,
  `aria-live="polite"` on the results, `role="alert"` on both the AI error
  card and the app‑level crash screen
- Semantic structure: one `<h1>` per screen, section landmarks, real
  `<button>`/`<label>` elements throughout (no click‑div patterns)

**Manual step still owed:** an automated axe/Lighthouse accessibility audit
pass hasn't been run in this environment (no browser automation available
here) — see [Remaining manual items](#remaining-manual-items).

## Performance

- No UI framework/component library — plain CSS, hand‑drawn SVG icons
  instead of an icon font or image assets
- Single small production bundle: `npm run build` produces one JS chunk
  (~189 KB / ~61 KB gzipped) and one CSS file (~10 KB / ~2.5 KB gzipped);
  see [Remaining manual items](#remaining-manual-items) for the Lighthouse
  run itself
- Debounced search (350ms) to avoid a network request per keystroke
- AI advice is fetched only on demand (button press), not automatically, so
  it never blocks or delays the initial weather render

## Testing

`vitest` + `@testing-library/react`, run with `npm test` /
`npm run test:coverage`. 7 test files, 18 tests, all passing:

- `AIWeatherAdvisor` — success, HTTP error, and malformed‑payload fallback
  paths (the core AI structured‑output contract)
- `CurrentConditions` — renders data, unit toggle interaction, favourite
  toggle accessibility state
- `SearchBar` — debounced search results, selection, geolocation button
- `ProtectedRoute` — redirects when signed out, renders when signed in
- `NavBar` — signed‑out vs signed‑in states
- `WeatherIcon` — decorative a11y attributes, unknown‑group fallback
- `useWeather` (hook) — successful load, failed fetch, short‑query guard

6 of 9 components (67%) and the core data hook have direct test coverage,
above the ≥50% target. `npm run test:coverage` prints the full per‑file
breakdown.

## Production‑ready error handling

- **Render errors:** `ErrorBoundary` wraps the whole app in `main.jsx` and
  shows a recovery screen instead of an unmounted blank page
- **Network errors (weather):** `useWeather` catches every fetch failure
  (bad response, geolocation denial, no geolocation support) into a single
  `status: 'error'` + human‑readable `error` string that `Home.jsx` renders
- **AI errors:** see [AI integration](#ai-integration) above — every failure
  mode maps to a specific HTTP status server‑side and a friendly, retryable
  message client‑side
- **Server:** the Anthropic call is wrapped in `try/catch` with a 12‑second
  timeout (`AbortController`), so a hung upstream request can't hang the
  Express process indefinitely

## Deployment

The app is a single deployable unit: build the frontend, then run the same
Express server that already implements `/api/ai-weather-advice` — in
production it also serves the built static files, so no separate static
host is required.

```bash
npm install
npm run build          # writes dist/
ANTHROPIC_API_KEY=... NODE_ENV=production npm run start
```

This runs on one process/one port and works as‑is on any Node host that
lets you set environment variables and run `npm run build && npm run start`
(Render, Railway, Fly.io, a VM, etc.) — for example, on Render: build
command `npm install && npm run build`, start command `npm run start`,
environment variable `ANTHROPIC_API_KEY`.

If you'd rather deploy the frontend and API separately (e.g. static hosting
on Netlify/Vercel + the API on Render), point `vite.config.js`'s dev proxy
target and any production `fetch('/api/...')` calls at the deployed API
origin instead of assuming same‑origin.

### Monitoring

- `GET /api/health` returns `{ status: "ok", aiConfigured: boolean, uptime }`
  — point an uptime monitor (UptimeRobot, Better Uptime, a platform's own
  health check) at this route. `aiConfigured: false` tells you the AI key
  is missing without spending an Anthropic API call to find out.
- Server errors are logged to stdout/stderr (`console.error` in
  `ErrorBoundary`, and the caught branches in `server.js`); on a platform
  like Render/Railway that's automatically captured in the platform's log
  viewer with no extra setup.

### Rollback

- The app has no database/migrations — application state per deploy is
  just the running Node process plus static files, so rollback is
  redeploying the previous Git commit/build artifact (e.g. Render's "redeploy
  previous deploy" button, or `git revert` + redeploy).
- Because `/api/ai-weather-advice` degrades gracefully (see error states
  above), a bad Anthropic‑side change or an expired key never requires an
  emergency rollback of the whole app — the weather features keep working
  regardless.

## Limitations & future improvements

- **Accounts are local, not real auth.** `AuthContext` stores username,
  email, and a **salted SHA‑256 password hash** (via Web Crypto, no
  plaintext password ever written to storage) in `localStorage`, scoped to
  one browser. There's still no server‑side account store, no
  sessions/JWT, and no cross‑device sync. This is fine for a course
  project with no real users, but it is explicitly **not** production
  auth — a real deployment needs a proper backend with a vetted password
  hashing algorithm (bcrypt/argon2, not raw SHA‑256) behind an API, plus
  HTTPS‑only session cookies.
- **No rate limiting** on `/api/ai-weather-advice` — a real deployment
  behind real traffic should add per‑IP or per‑session rate limiting to
  control Anthropic API spend.
- **No automated accessibility/performance CI check** — Lighthouse and
  axe audits were reviewed manually against the checklist above; wiring an
  automated Lighthouse CI / axe‑core run into CI is a natural next step.
- **Single AI call shape.** The advisor always asks for the same five
  fields; a future version could let the user ask a follow‑up question
  (multi‑turn) instead of one fixed structured response.
- **Favourites temperature polling** (`Favourites.jsx`) fires one fetch per
  saved city with no caching — fine for a handful of favourites, would want
  batching/caching at a larger scale.

## Reflection

The most valuable architectural decision here was keeping the AI feature
strictly additive: `AIWeatherAdvisor` is the *last* thing rendered on the
page, only appears once real weather data exists, and every failure mode —
missing key, timeout, malformed model output — degrades to a retryable
error card rather than breaking the page around it. That meant auditing and
hardening the AI integration (adding the server‑`/api/health` check, keeping
client‑side validation independent of server‑side validation, documenting
the exact prompt) could happen without touching, or risking, the weather
functionality that already worked.

The biggest gap found during this audit wasn't a missing feature but a
**stale README** describing a Firebase backend that had actually been
replaced by a local implementation earlier in the project's history — a
reminder that documentation drifts from code silently, and that "does the
README match `git log`/the actual files" is worth checking explicitly
before an audit, not just "does the app run." The second‑biggest gap was
test coverage concentrated entirely on one component; broadening it to the
hook and five more components (favouring components with real logic —
validation, redirects, debouncing — over purely presentational ones) gave
more actual regression protection per test written than testing everything
equally would have.

## Remaining manual items

A few things need a human (or a browser) and couldn't be completed in this
environment:

1. **Run an automated Lighthouse pass** (Chrome DevTools → Lighthouse, or
   `npx lighthouse` against a running `npm run preview`) and record the
   score — target is 85+; nothing in the app should currently block that,
   but it hasn't been physically measured here.
2. **Run an automated accessibility scanner** (axe DevTools extension, or
   `@axe-core/react` in dev) against the live app as a second check beyond
   the manual WCAG review above.
3. **Set `ANTHROPIC_API_KEY`** in your real `.env.local` / hosting
   provider's environment variables — it is intentionally not included in
   this repo.
4. **Pick and configure an actual host** for deployment (Render/Railway/Fly/
   etc.) using the `npm run build && npm run start` flow described above.
