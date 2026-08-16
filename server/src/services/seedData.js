// Shared seeding logic — used by both the CLI script (npm run seed) and
// the protected POST /api/admin/seed route (for environments where a
// one-off CLI job isn't available, e.g. Render's free tier).
import { getNowPlaying } from './tmdbService.js'
import { buildSeatGrid } from './firestoreService.js'

// Bengaluru-area cinemas — real-ish coordinates, backend-owned.
export const CINEMAS = [
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

const showtimes = () => {
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
  return CINEMAS.length
}

async function seedShowsAndSeats(db, movieIds) {
  const times = showtimes()
  let showCount = 0
  let seatCount = 0

  for (const cinema of CINEMAS) {
    for (const movieId of movieIds) {
      for (const time of times) {
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

  return { showCount, seatCount }
}

export async function runSeed(db, { log = console.log } = {}) {
  log('Fetching real now-playing movie ids from TMDB…')
  const nowPlaying = await getNowPlaying({ page: 1 })
  const chosen = nowPlaying.results.slice(0, 2)
  const movieIds = chosen.map((m) => m.id)
  if (movieIds.length === 0) throw new Error('TMDB now_playing returned no movies — check TMDB_ACCESS_TOKEN')
  log(`Using movies: ${chosen.map((m) => `${m.title} (#${m.id})`).join(', ')}`)

  const cinemaCount = await seedCinemas(db)
  log(`✓ Seeded ${cinemaCount} cinemas`)

  const { showCount, seatCount } = await seedShowsAndSeats(db, movieIds)
  log(`✓ Seeded ${showCount} shows (${seatCount} seats total)`)

  return { cinemaCount, showCount, seatCount, movies: chosen.map((m) => ({ id: m.id, title: m.title })) }
}
