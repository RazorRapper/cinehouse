import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SeatMap from '../components/SeatMap3D/SeatMap.jsx'
import Legend from '../components/SeatMap3D/Legend.jsx'
import BookingSheet from '../components/BookingSheet.jsx'
import { generateSeats } from '../data/mockSeats.js'
import { useBooking } from '../context/BookingContext.jsx'

// Seat hold window for this demo. Countdown turns urgent (error red) under
// 60s remaining, per spec.
const HOLD_SECONDS = 5 * 60

export function SeatSelection() {
  const navigate = useNavigate()
  const { movie, cinema, showtime, seats, setSeats } = useBooking()
  const seatRows = useMemo(() => generateSeats(), [])
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS)

  const selectedIds = seats.map((s) => s.id)

  // Countdown starts once the first seat is selected.
  useEffect(() => {
    if (seats.length === 0) return undefined
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setSeats([]) // hold expired — release seats
          return HOLD_SECONDS
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seats.length > 0])

  const handleToggleSeat = useCallback(
    (seat) => {
      setSeats((prev) => {
        const exists = prev.find((s) => s.id === seat.id)
        if (exists) return prev.filter((s) => s.id !== seat.id)
        return [...prev, { id: seat.id, row: seat.row, number: seat.number, price: seat.price }]
      })
    },
    [setSeats],
  )

  const handleConfirm = () => {
    navigate('/confirm')
  }

  if (!movie || !cinema || !showtime) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">Select a cinema and showtime first.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base md:pr-[340px]">
      <header className="sticky top-0 z-20 bg-bg-base/95 backdrop-blur border-b border-border-subtle px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex items-center justify-center h-9 w-9 -ml-1 rounded-full flex-shrink-0
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#F4F1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-lg tracking-tight leading-tight truncate">{movie.title}</h1>
          <p className="text-xs text-text-secondary truncate">
            {cinema.name} · <span className="font-mono">{showtime.time}</span>
          </p>
        </div>
      </header>

      <SeatMap seatRows={seatRows} selectedIds={selectedIds} onToggleSeat={handleToggleSeat} />

      <Legend />

      <div className={seats.length > 0 ? 'pb-56 md:pb-6' : 'pb-6'} />

      <BookingSheet seats={seats} secondsLeft={secondsLeft} onConfirm={handleConfirm} />
    </div>
  )
}

export default SeatSelection
