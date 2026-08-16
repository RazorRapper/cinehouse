// Shared seeding logic — used by both the CLI script (npm run seed) and
// the protected POST /api/admin/seed route (for environments where a
// one-off CLI job isn't available, e.g. Render's free tier).
import { getNowPlaying } from './tmdbService.js'
import { buildSeatGrid } from './firestoreService.js'

// Cinemas across major Indian cities — real-ish coordinates, backend-owned.
// Nationwide (not just one city) so "cinemas near me" returns something
// sensible regardless of where the browser's geolocation resolves to.
export const CINEMAS = [
  // Bengaluru
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
  // Mumbai
  {
    id: 'cn-mum-001',
    name: 'PVR Icon — Infiniti Mall',
    city: 'Mumbai',
    address: 'Malad West, Mumbai',
    location: { lat: 19.1863, lng: 72.8493 },
    screens: ['Screen 1', 'Screen 2'],
  },
  {
    id: 'cn-mum-002',
    name: 'INOX — R City Mall',
    city: 'Mumbai',
    address: 'Ghatkopar West, Mumbai',
    location: { lat: 19.0863, lng: 72.9081 },
    screens: ['Screen 1', 'Screen 2', 'Screen 3'],
  },
  // Delhi
  {
    id: 'cn-del-001',
    name: 'PVR Priya',
    city: 'Delhi',
    address: 'Vasant Vihar, New Delhi',
    location: { lat: 28.5657, lng: 77.159 },
    screens: ['Screen 1'],
  },
  {
    id: 'cn-del-002',
    name: 'INOX — Nehru Place',
    city: 'Delhi',
    address: 'Nehru Place, New Delhi',
    location: { lat: 28.5487, lng: 77.2519 },
    screens: ['Screen 1', 'Screen 2'],
  },
  // Hyderabad
  {
    id: 'cn-hyd-001',
    name: 'PVR — Forum Sujana Mall',
    city: 'Hyderabad',
    address: 'Kukatpally, Hyderabad',
    location: { lat: 17.4948, lng: 78.3996 },
    screens: ['Screen 1', 'Screen 2'],
  },
  {
    id: 'cn-hyd-002',
    name: 'AMB Cinemas',
    city: 'Hyderabad',
    address: 'Gachibowli, Hyderabad',
    location: { lat: 17.4401, lng: 78.3489 },
    screens: ['Screen 1'],
  },
  // Chennai
  {
    id: 'cn-che-001',
    name: 'PVR — Ampa Skywalk',
    city: 'Chennai',
    address: 'Aminjikarai, Chennai',
    location: { lat: 13.0732, lng: 80.2216 },
    screens: ['Screen 1', 'Screen 2'],
  },
  {
    id: 'cn-che-002',
    name: 'Sathyam Cinemas',
    city: 'Chennai',
    address: 'Royapettah, Chennai',
    location: { lat: 13.0524, lng: 80.2645 },
    screens: ['Screen 1', 'Screen 2', 'Screen 3'],
  },
  // Kolkata
  {
    id: 'cn-kol-001',
    name: 'INOX — South City Mall',
    city: 'Kolkata',
    address: 'Prince Anwar Shah Road, Kolkata',
    location: { lat: 22.5006, lng: 88.3616 },
    screens: ['Screen 1', 'Screen 2'],
  },
  {
    id: 'cn-kol-002',
    name: 'PVR — Diamond Plaza',
    city: 'Kolkata',
    address: 'Diamond Harbour Road, Kolkata',
    location: { lat: 22.539, lng: 88.3306 },
    screens: ['Screen 1'],
  },
  // Pune
  {
    id: 'cn-pun-001',
    name: 'PVR — Phoenix Marketcity',
    city: 'Pune',
    address: 'Viman Nagar, Pune',
    location: { lat: 18.5621, lng: 73.9188 },
    screens: ['Screen 1', 'Screen 2'],
  },
  {
    id: 'cn-pun-002',
    name: 'INOX — Bund Garden',
    city: 'Pune',
    address: 'Bund Garden Road, Pune',
    location: { lat: 18.5362, lng: 73.8827 },
    screens: ['Screen 1'],
  },
  // Ahmedabad
  {
    id: 'cn-ahm-001',
    name: 'PVR — Acropolis Mall',
    city: 'Ahmedabad',
    address: 'Thaltej, Ahmedabad',
    location: { lat: 23.0348, lng: 72.5079 },
    screens: ['Screen 1', 'Screen 2'],
  },
  {
    id: 'cn-ahm-002',
    name: 'Cinepolis — Alpha One Mall',
    city: 'Ahmedabad',
    address: 'Vastrapur, Ahmedabad',
    location: { lat: 23.0396, lng: 72.5266 },
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

// Every (cinema, movie, showtime) combination is independent — write them
// all concurrently rather than one round trip at a time. With 18 cinemas x
// 2 movies x 2 showtimes = 72 shows, a serial loop risked running past a
// free-tier request timeout; this finishes in a few seconds instead.
async function seedShowsAndSeats(db, movieIds) {
  const times = showtimes()
  const jobs = []

  for (const cinema of CINEMAS) {
    for (const movieId of movieIds) {
      for (const time of times) {
        jobs.push(
          (async () => {
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

            return seats.length
          })(),
        )
      }
    }
  }

  const seatCounts = await Promise.all(jobs)
  return { showCount: jobs.length, seatCount: seatCounts.reduce((sum, n) => sum + n, 0) }
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
