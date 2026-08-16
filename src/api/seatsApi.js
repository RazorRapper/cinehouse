import apiFetch from './fetchClient.js'

// A seat's backend status is available | locked | booked. The 3D seat map's
// Seat component only knows two base states (available | booked) — "selected"
// is a separate isSelected prop driven by local selection state. A seat
// locked by ME renders as an interactive "available" base + isSelected=true
// (renders blue). A seat locked by someone else renders as "booked" (grey,
// non-interactive) — there's no distinct visual for "someone else has it",
// which matches the original 3-state design.
function toBaseStatus(seat, userId) {
  if (seat.status === 'booked') return 'booked'
  if (seat.status === 'locked') return seat.lockedBy === userId ? 'available' : 'booked'
  return 'available'
}

// Reshapes the backend's flat seat list into the {row, rowIndex, tier,
// tierLabel, price, isFirstOfTier, seats[]} grouping that
// SeatMap3D/SeatMap.jsx's layoutSeats() already expects — so that
// component doesn't change at all, only where its input data comes from.
export function groupSeatsByRow(flatSeats, userId) {
  const byRow = new Map()
  flatSeats.forEach((seat) => {
    if (!byRow.has(seat.row)) byRow.set(seat.row, [])
    byRow.get(seat.row).push(seat)
  })

  const rows = [...byRow.keys()].sort()
  let prevTier = null

  return rows.map((row, rowIndex) => {
    const seatsInRow = byRow.get(row).sort((a, b) => a.number - b.number)
    const tier = seatsInRow[0]?.tier
    const tierLabel = seatsInRow[0]?.tierLabel
    const price = seatsInRow[0]?.price
    const isFirstOfTier = tier !== prevTier
    prevTier = tier

    const seats = seatsInRow.map((seat) => ({
      id: seat.id,
      row: seat.row,
      rowIndex,
      number: seat.number,
      price: seat.price,
      tier: seat.tier,
      tierLabel: seat.tierLabel,
      status: toBaseStatus(seat, userId),
    }))

    return { row, rowIndex, tier, tierLabel, price, isFirstOfTier, seats }
  })
}

// Seat ids this userId currently holds a live lock on — used to
// re-populate local selection state if the seat map is reloaded mid-hold.
export function myLockedSeatIds(flatSeats, userId) {
  return flatSeats.filter((s) => s.status === 'locked' && s.lockedBy === userId).map((s) => s.id)
}

export async function fetchSeats(showId) {
  const { seats } = await apiFetch(`/api/shows/${showId}/seats`)
  return seats
}

export async function lockSeats(showId, seatIds, userId) {
  return apiFetch(`/api/shows/${showId}/seats/lock`, {
    method: 'POST',
    body: JSON.stringify({ seatIds, userId }),
  })
}

export async function releaseSeats(showId, seatIds, userId) {
  return apiFetch(`/api/shows/${showId}/seats/release`, {
    method: 'POST',
    body: JSON.stringify({ seatIds, userId }),
  })
}
