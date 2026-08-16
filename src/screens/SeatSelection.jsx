import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SeatMap from '../components/SeatMap3D/SeatMap.jsx'
import Legend from '../components/SeatMap3D/Legend.jsx'
import BookingSheet from '../components/BookingSheet.jsx'
import { fetchSeats, lockSeats, releaseSeats, groupSeatsByRow, myLockedSeatIds } from '../api/seatsApi.js'
import { getSessionUserId } from '../utils/sessionUser.js'
import { useBooking } from '../context/BookingContext.jsx'

// Matches the backend's real seat-lock TTL (server/src/services/firestoreService.js
// SEAT_HOLD_MS) — the countdown must reflect the actual hold, not an
// arbitrary client-side number. Restarts to 60s on every newly locked seat.
const HOLD_SECONDS = 60
// With only 60s total, "under 60s" (the original spec threshold) would be
// permanently red — narrowed to the final quarter so it still reads as a
// late warning rather than constant urgency.
const URGENT_THRESHOLD_SECONDS = 15
const BACKGROUND_REFRESH_MS = 15000

export function SeatSelection() {
  const navigate = useNavigate()
  const { movie, cinema, showtime, seats, setSeats } = useBooking()
  const userId = useRef(getSessionUserId()).current
  const showId = showtime?.id

  const [seatRows, setSeatRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS)

  const selectedIds = seats.map((s) => s.id)

  const refreshSeats = useCallback(
    (preserveSelection = true) => {
      if (!showId) return Promise.resolve()
      return fetchSeats(showId).then((flatSeats) => {
        setSeatRows(groupSeatsByRow(flatSeats, userId))
        if (preserveSelection) {
          // Re-derive selection from server truth (handles page refresh
          // mid-hold, and drops any seat whose lock expired server-side).
          const lockedIds = new Set(myLockedSeatIds(flatSeats, userId))
          setSeats((prev) => prev.filter((s) => lockedIds.has(s.id)))
        }
      })
    },
    [showId, userId, setSeats],
  )

  // Initial load.
  useEffect(() => {
    if (!showId) return
    setLoading(true)
    setLoadError(null)
    fetchSeats(showId)
      .then((flatSeats) => {
        setSeatRows(groupSeatsByRow(flatSeats, userId))
        const locked = flatSeats.filter((s) => s.status === 'locked' && s.lockedBy === userId)
        if (locked.length) {
          setSeats(locked.map((s) => ({ id: s.id, row: s.row, number: s.number, price: s.price })))
        }
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId])

  // Light background poll so another user's booking/lock activity shows up
  // without requiring this tab to take an action first.
  useEffect(() => {
    if (!showId) return undefined
    const interval = setInterval(() => refreshSeats(), BACKGROUND_REFRESH_MS)
    return () => clearInterval(interval)
  }, [showId, refreshSeats])

  // Countdown — runs while >=1 seat is held; on expiry, re-sync with the
  // server (which lazily expires locks past their hold window) rather than
  // just optimistically clearing local state.
  useEffect(() => {
    if (seats.length === 0) {
      setSecondsLeft(HOLD_SECONDS)
      return undefined
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          refreshSeats()
          return HOLD_SECONDS
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seats.length > 0, refreshSeats])

  const handleToggleSeat = useCallback(
    async (seat) => {
      setActionError(null)
      const alreadySelected = seats.some((s) => s.id === seat.id)

      if (alreadySelected) {
        setSeats((prev) => prev.filter((s) => s.id !== seat.id))
        releaseSeats(showId, [seat.id], userId).catch(() => {
          /* best-effort — server-side hold will still expire on its own */
        })
        return
      }

      try {
        await lockSeats(showId, [seat.id], userId)
        setSeats((prev) => [...prev, { id: seat.id, row: seat.row, number: seat.number, price: seat.price }])
        setSecondsLeft(HOLD_SECONDS) // a fresh lock resets the shared countdown
      } catch (err) {
        // Someone else grabbed it between render and click — resync so it
        // shows correctly (grey/unavailable) instead of staying green.
        setActionError(err.status === 409 ? 'That seat was just taken — try another.' : err.message)
        refreshSeats(false)
      }
    },
    [seats, showId, userId, setSeats, refreshSeats],
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">Loading seat map…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">Couldn't load seats: {loadError}</p>
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

      {actionError && (
        <div className="px-4 py-2 bg-error/10 border-b border-error/30">
          <p className="text-xs text-error text-center">{actionError}</p>
        </div>
      )}

      <SeatMap seatRows={seatRows} selectedIds={selectedIds} onToggleSeat={handleToggleSeat} />

      <Legend />

      <div className={seats.length > 0 ? 'pb-56 md:pb-6' : 'pb-6'} />

      <BookingSheet
        seats={seats}
        secondsLeft={secondsLeft}
        urgentThreshold={URGENT_THRESHOLD_SECONDS}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

export default SeatSelection
