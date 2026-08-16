// Mock seat map generator — tiered like a real multiplex layout:
// CLUB (front, cheapest) -> ROYAL (middle) -> ROYAL RECLINER (back, fewest
// seats per row, priciest, extra legroom). Row letters run A -> Z across
// tiers, front to back, matching how physical halls are lettered.

const TIERS = [
  { key: 'club', label: 'Club', price: 150, rows: ['A', 'B', 'C'], seatsPerRow: 12 },
  { key: 'royal', label: 'Royal', price: 220, rows: ['D', 'E', 'F', 'G', 'H'], seatsPerRow: 12 },
  { key: 'recliner', label: 'Royal Recliner', price: 380, rows: ['I', 'J'], seatsPerRow: 8 },
]

// Deterministic "booked" seats so the layout is stable across reloads.
const PRE_BOOKED = new Set([
  'B3', 'B4', 'B5', 'C8', 'C9',
  'D1', 'D2', 'E11', 'E12', 'F6', 'F7',
  'G2', 'G3', 'G4', 'H9', 'H10',
  'I3', 'I4', 'J1', 'J6',
])

export const generateSeats = () => {
  const rows = []
  let rowIndex = 0
  TIERS.forEach((tier) => {
    tier.rows.forEach((rowLabel) => {
      const seats = Array.from({ length: tier.seatsPerRow }, (_, i) => {
        const seatNumber = i + 1
        const id = `${rowLabel}${seatNumber}`
        return {
          id,
          row: rowLabel,
          rowIndex,
          number: seatNumber,
          status: PRE_BOOKED.has(id) ? 'booked' : 'available',
          price: tier.price,
          tier: tier.key,
          tierLabel: tier.label,
        }
      })
      rows.push({
        row: rowLabel,
        rowIndex,
        tier: tier.key,
        tierLabel: tier.label,
        price: tier.price,
        isFirstOfTier: rowIndex === 0 || rows[rows.length - 1]?.tier !== tier.key,
        seats,
      })
      rowIndex += 1
    })
  })
  return rows
}

export const SEAT_TIERS = TIERS
export const SEAT_ROWS = TIERS.flatMap((t) => t.rows)
