// firestoreService — Firestore client access + helpers shared across
// routes/scripts. Route handlers should go through these rather than
// importing config/firebase.js directly, so collection names and shared
// logic (seat grid shape, lock expiry) live in one place.
import { getDb } from '../config/firebase.js'

export const SEAT_HOLD_MS = 60 * 1000 // 60s demo hold, per spec
export const SEAT_COLS = 10

// Row bands within the 8x10 grid, mirroring the tiers already built into
// the 3D seat map (frontend/src/components/SeatMap3D) — front rows are
// cheapest, back rows are the wider "recliner" chairs. Keeping these in
// sync with the frontend's rendering means the seat visuals stay exactly
// as designed; only the data source changes.
export const SEAT_TIER_BANDS = [
  { rows: ['A', 'B', 'C'], tier: 'club', tierLabel: 'Club', price: 150 },
  { rows: ['D', 'E', 'F'], tier: 'royal', tierLabel: 'Royal', price: 220 },
  { rows: ['G', 'H'], tier: 'recliner', tierLabel: 'Royal Recliner', price: 320 },
]

export const cinemasCol = () => getDb().collection('cinemas')
export const showsCol = () => getDb().collection('shows')
export const bookingsCol = () => getDb().collection('bookings')
export const seatsCol = (showId) => showsCol().doc(showId).collection('seats')

// Haversine distance in km between two lat/lng points.
export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Builds the flat seat list for an 8x10 grid (A1..A10 ... H1..H10), each
// seat tagged with its tier/price band per SEAT_TIER_BANDS.
export function buildSeatGrid() {
  const seats = []
  SEAT_TIER_BANDS.forEach(({ rows, tier, tierLabel, price }) => {
    rows.forEach((row) => {
      for (let n = 1; n <= SEAT_COLS; n++) {
        seats.push({
          seatId: `${row}${n}`,
          row,
          number: n,
          status: 'available',
          lockedBy: null,
          lockedAt: null,
          tier,
          tierLabel,
          price,
        })
      }
    })
  })
  return seats
}

// A seat is treated as expired (and should be flipped back to available)
// once its hold has outlived SEAT_HOLD_MS.
export function isLockExpired(seat) {
  if (seat.status !== 'locked' || !seat.lockedAt) return false
  const lockedAtMs = seat.lockedAt.toMillis ? seat.lockedAt.toMillis() : new Date(seat.lockedAt).getTime()
  return Date.now() - lockedAtMs > SEAT_HOLD_MS
}
