import 'dotenv/config'
import { setDefaultResultOrder } from 'node:dns'
import express from 'express'
import cors from 'cors'

// This host's IPv6 routing to some external APIs (TMDB in particular)
// resets mid-TLS-handshake — Node's fetch tries IPv6 first (Happy Eyeballs)
// and fails before ever falling back. Prefer IPv4 resolution globally so
// outbound requests don't depend on IPv6 working.
setDefaultResultOrder('ipv4first')

import moviesRouter from './routes/movies.js'
import cinemasRouter from './routes/cinemas.js'
import showsRouter from './routes/shows.js'
import seatsRouter from './routes/seats.js'
import bookingsRouter from './routes/bookings.js'

const app = express()
const PORT = process.env.PORT || 4000

// CORS_ORIGIN is required and explicit — the live frontend's real origin,
// never "*". A comma-separated list is supported for multiple environments
// (e.g. local dev + the deployed Vercel URL).
const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

if (allowedOrigins.length === 0) {
  console.warn('[cinehouse-server] WARNING: CORS_ORIGIN is not set — no browser origin will be allowed.')
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (curl, server-to-server, health checks)
      // that send no Origin header at all.
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

app.use('/api/movies', moviesRouter)
app.use('/api/cinemas', cinemasRouter)
app.use('/api/shows/:showId/seats', seatsRouter)
app.use('/api/shows', showsRouter)
app.use('/api/bookings', bookingsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Centralized error handler — every route's `next(err)` lands here.
app.use((err, req, res, _next) => {
  console.error(err)
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`CineHouse server listening on port ${PORT}`)
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ') || '(none set)'}`)
})
