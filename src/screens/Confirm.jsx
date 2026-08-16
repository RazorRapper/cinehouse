import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext.jsx'

const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'CH-'
  for (let i = 0; i < 7; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

export function Confirm() {
  const navigate = useNavigate()
  const { movie, cinema, showtime, seats, setBookingId } = useBooking()
  const [submitting, setSubmitting] = useState(false)

  if (!movie || !cinema || !showtime || seats.length === 0) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">Nothing to confirm yet.</p>
      </div>
    )
  }

  const total = seats.reduce((sum, s) => sum + s.price, 0)
  const seatLabels = seats
    .slice()
    .sort((a, b) => (a.row === b.row ? a.number - b.number : a.row.localeCompare(b.row)))
    .map((s) => s.id)

  const handleConfirm = () => {
    setSubmitting(true)
    // Mock payment: transition selected seats blue -> grey happens visually
    // on the seat map screen state; here we just simulate a short delay.
    setTimeout(() => {
      setBookingId(generateBookingId())
      navigate('/ticket')
    }, 700)
  }

  return (
    <div className="min-h-screen bg-bg-base pb-28">
      <header className="sticky top-0 z-20 bg-bg-base/95 backdrop-blur border-b border-border-subtle px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          disabled={submitting}
          className="flex items-center justify-center h-9 w-9 -ml-1 rounded-full flex-shrink-0
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#F4F1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-display text-lg tracking-tight">Confirm Booking</h1>
      </header>

      <div className="px-4 py-4">
        <div className="rounded-xl border border-border-subtle bg-surface overflow-hidden">
          <div className="flex gap-3 p-4">
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-display text-xl tracking-tight leading-tight truncate">{movie.title}</h2>
              <p className="text-xs text-text-secondary mt-1 truncate">{cinema.name}</p>
              <p className="font-mono text-xs text-text-secondary mt-0.5">
                {showtime.time} · {showtime.format}
              </p>
            </div>
          </div>

          <div className="border-t border-dashed border-border-subtle mx-4" />

          <dl className="p-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Seats</dt>
              <dd className="font-mono text-text-primary">{seatLabels.join(', ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Tickets</dt>
              <dd className="text-text-primary">
                {seats.length} × avg ₹{Math.round(total / seats.length)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Convenience fee</dt>
              <dd className="text-text-primary">₹0</dd>
            </div>
            <div className="border-t border-border-subtle pt-3 flex justify-between items-center">
              <dt className="text-text-primary font-medium">Total</dt>
              <dd className="font-mono text-lg font-semibold text-accent-marquee">₹{total}</dd>
            </div>
          </dl>
        </div>

        <p className="text-xs text-text-secondary text-center mt-4">
          This is a demo — no real payment will be processed.
        </p>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 bg-bg-base/95 backdrop-blur border-t border-border-subtle px-4 py-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full rounded-lg bg-accent-marquee text-bg-base font-medium py-3.5 min-h-[44px]
            hover:bg-accent-marquee/90 active:scale-[0.99] transition-colors disabled:opacity-60
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
        >
          {submitting ? 'Confirming…' : `Confirm Booking · ₹${total}`}
        </button>
      </div>
    </div>
  )
}

export default Confirm
