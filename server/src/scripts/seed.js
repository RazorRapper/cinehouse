// One-off seed script — NOT an API route. Run with `npm run seed` from
// server/. Populates Firestore with mock cinemas + shows linking those
// cinemas to real TMDB now-playing movie ids, and generates each show's
// seat grid.
import 'dotenv/config'
import { setDefaultResultOrder } from 'node:dns'
import { getDb } from '../config/firebase.js'

// See server/src/index.js for why this is needed on this network.
setDefaultResultOrder('ipv4first')
import { getNowPlaying } from '../services/tmdbService.js'
import { buildSeatGrid } from '../services/firestoreService.js'

// Bengaluru-area cinemas — same names/city used in the frontend's original
// mock data, now backend-owned with real-ish coordinates.
const CINEMAS = [
  {
    id: 'cn-001',
    name: 'PVR Marquee — Orion Mall',
    city: 'Bengaluru',
    address: 'Rajajinagar, Bengaluru',
    location: { lat: 12.9931, lng: 77.5553 },
    screens: ['Screen 1', 'Screen 2', 'Screen 3'],
  },
  {
    id: 'cn-002',
    name: 'INOX Grand — Garuda Mall',
    city: 'Bengaluru',
    address: 'Magrath Road, Bengaluru',
    location: { lat: 12.9716, lng: 77.6068 },
    screens: ['Screen 1', 'Screen 2'],
  },
  {
    id: 'cn-003',
    name: 'Cinepolis — Nexus Koramangala',
    city: 'Bengaluru',
    address: 'Koramangala, Bengaluru',
    location: { lat: 12.9352, lng: 77.6146 },
    screens: ['Screen 1', 'Screen 2', 'Screen 3'],
  },
  {
    id: 'cn-004',
    name: 'INOX — Mantri Square',
    city: 'Bengaluru',
    address: 'Malleshwaram, Bengaluru',
    location: { lat: 12.9975, lng: 77.57 },
    screens: ['Screen 1'],
  },
]

const SHOWTIMES = () => {
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const at = (date, h, m) => {
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }
  return [at(today, 18, 30), at(tomorrow, 15, 0)]
}

async function seedCinemas(db) {
  const batch = db.batch()
  CINEMAS.forEach((cinema) => {
    const { id, ...data } = cinema
    batch.set(db.collection('cinemas').doc(id), data)
  })
  await batch.commit()
  console.log(`✓ Seeded ${CINEMAS.length} cinemas`)
}

async function seedShowsAndSeats(db, movieIds) {
  const showtimes = SHOWTIMES()
  let showCount = 0
  let seatCount = 0

  for (const cinema of CINEMAS) {
    for (const movieId of movieIds) {
      for (const time of showtimes) {
        const showId = `show-${cinema.id}-${movieId}-${new Date(time).getTime()}`
        const screenId = cinema.screens[0]

        await db
          .collection('shows')
          .doc(showId)
          .set({ movieId, cinemaId: cinema.id, screenId, time, seatMapId: showId })

        const seats = buildSeatGrid()
        const batch = db.batch()
        seats.forEach((seat) => {
          batch.set(db.collection('shows').doc(showId).collection('seats').doc(seat.seatId), seat)
        })
        await batch.commit()

        showCount += 1
        seatCount += seats.length
      }
    }
  }

  console.log(`✓ Seeded ${showCount} shows (${seatCount} seats total)`)
}

async function main() {
  const db = getDb()

  console.log('Fetching real now-playing movie ids from TMDB…')
  const nowPlaying = await getNowPlaying({ page: 1 })
  const movieIds = nowPlaying.results.slice(0, 2).map((m) => m.id)
  if (movieIds.length === 0) throw new Error('TMDB now_playing returned no movies — check TMDB_ACCESS_TOKEN')
  console.log(
    `Using movies: ${nowPlaying.results
      .slice(0, 2)
      .map((m) => `${m.title} (#${m.id})`)
      .join(', ')}`,
  )

  await seedCinemas(db)
  await seedShowsAndSeats(db, movieIds)

  console.log('Seed complete.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
