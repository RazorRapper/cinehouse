// BookingSheet — persistent bottom sheet (fixed side panel on tablet/desktop)
// shown once >=1 seat is selected. Seat numbers, running total, hold
// countdown (mock, client-side), and the Confirm CTA.

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function BookingSheet({ seats, secondsLeft, onConfirm }) {
  if (seats.length === 0) return null

  const total = seats.reduce((sum, s) => sum + s.price, 0)
  const isUrgent = secondsLeft < 60
  const seatLabels = seats
    .slice()
    .sort((a, b) => (a.row === b.row ? a.number - b.number : a.row.localeCompare(b.row)))
    .map((s) => s.id)
    .join(', ')

  return (
    <div
      className="fixed z-30 bg-surface-raised border-border-subtle
        inset-x-0 bottom-0 border-t rounded-t-2xl px-4 pt-3 pb-4
        md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[340px] md:border-t-0 md:border-l md:rounded-t-none md:pt-6 md:flex md:flex-col md:justify-end"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-secondary uppercase tracking-wide">
          {seats.length} seat{seats.length > 1 ? 's' : ''} selected
        </span>
        <span
          className={`font-mono text-sm font-medium ${isUrgent ? 'text-error' : 'text-text-secondary'}`}
          aria-live="polite"
        >
          Hold: {formatTime(secondsLeft)}
        </span>
      </div>

      <p className="font-mono text-sm text-text-primary mb-3 line-clamp-2">{seatLabels}</p>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">Total</span>
        <span className="font-mono text-lg font-semibold text-accent-marquee">₹{total}</span>
      </div>

      <button
        type="button"
        onClick={onConfirm}
        className="w-full rounded-lg bg-accent-marquee text-bg-base font-medium py-3.5 min-h-[44px]
          hover:bg-accent-marquee/90 active:scale-[0.99] transition-colors
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
      >
        Confirm Booking
      </button>
    </div>
  )
}

export default BookingSheet
