import { createContext, useContext, useMemo, useState, useCallback } from 'react'

// Client-side-only booking state shared across the flow (no backend yet).
// Holds the in-progress selection: movie -> cinema -> showtime -> seats.

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [movie, setMovie] = useState(null)
  const [cinema, setCinema] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([]) // array of seat objects {id, row, number, price}
  const [bookingId, setBookingId] = useState(null)

  const reset = useCallback(() => {
    setMovie(null)
    setCinema(null)
    setShowtime(null)
    setSeats([])
    setBookingId(null)
  }, [])

  const startBooking = useCallback((m) => {
    setMovie(m)
    setCinema(null)
    setShowtime(null)
    setSeats([])
    setBookingId(null)
  }, [])

  const value = useMemo(
    () => ({
      movie,
      cinema,
      showtime,
      seats,
      bookingId,
      setMovie,
      setCinema,
      setShowtime,
      setSeats,
      setBookingId,
      startBooking,
      reset,
    }),
    [movie, cinema, showtime, seats, bookingId, startBooking, reset],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
