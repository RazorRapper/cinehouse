import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CinemaListItem from '../components/CinemaListItem.jsx'
import LocationPill from '../components/LocationPill.jsx'
import { mockCity } from '../data/mockCinemas.js' // display label only; cinemas themselves are real (Firestore-backed)
import { fetchNearbyCinemas } from '../api/cinemasApi.js'
import { fetchShows } from '../api/showsApi.js'
import { useBooking } from '../context/BookingContext.jsx'

// Bengaluru city-center fallback — used only if the browser denies/lacks
// geolocation, via the "browse by city" fallback button.
const FALLBACK_COORDS = { lat: 12.9716, lng: 77.5946 }

// Seat pricing lives per-seat-tier in Firestore (Club/Royal/Recliner), not
// on the show itself — this is the Club (lowest) tier price, used only as
// a "starting from" figure on the showtime pill/CTA.
const STARTING_PRICE = 150

function formatShowTime(iso) {
  // Explicit locale + hour12 — leaving these implicit lets the browser's
  // default locale drop AM/PM and render midnight as "0:00" instead of
  // "12:00 AM".
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-2/3 rounded bg-surface-raised" />
        <div className="h-4 w-12 rounded bg-surface-raised" />
      </div>
      <div className="h-3 w-1/2 rounded bg-surface-raised mt-2" />
      <div className="flex gap-2 mt-3">
        <div className="h-11 w-16 rounded-lg bg-surface-raised" />
        <div className="h-11 w-16 rounded-lg bg-surface-raised" />
        <div className="h-11 w-16 rounded-lg bg-surface-raised" />
      </div>
    </div>
  )
}

export function SelectCinema() {
  const navigate = useNavigate()
  const { movie, cinema, showtime, setCinema, setShowtime } = useBooking()
  const [loading, setLoading] = useState(true)
  const [cinemas, setCinemas] = useState([])
  const [geoError, setGeoError] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const loadCinemas = (coords) => {
    setLoading(true)
    setLoadError(null)
    Promise.all([fetchNearbyCinemas({ ...coords, movieId: movie.id }), fetchShows({ movieId: movie.id })])
      .then(([nearby, shows]) => {
        const showsByCinema = new Map()
        shows.forEach((show) => {
          if (!showsByCinema.has(show.cinemaId)) showsByCinema.set(show.cinemaId, [])
          showsByCinema.get(show.cinemaId).push(show)
        })

        const withShowtimes = nearby.map((c) => ({
          ...c,
          distance: c.distanceKm != null ? `${c.distanceKm} km` : '—',
          showtimes: (showsByCinema.get(c.id) ?? [])
            .sort((a, b) => new Date(a.time) - new Date(b.time))
            .map((show) => ({
              id: show.id, // real Firestore show doc id — used directly as showId downstream
              time: formatShowTime(show.time),
              format: '2D', // per-show format isn't modeled in the seed data yet
              price: STARTING_PRICE,
            })),
        }))

        setCinemas(withShowtimes)
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!movie) return
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not available in this browser.')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoError(null)
        loadCinemas({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => {
        setGeoError(err.message || 'Location access was denied.')
        setLoading(false)
      },
      { timeout: 8000 },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie?.id])

  const handleBrowseByCity = () => {
    setGeoError(null)
    loadCinemas(FALLBACK_COORDS)
  }

  const handleSelectShowtime = (cn, st) => {
    setCinema(cn)
    setShowtime(st)
  }

  const handleContinue = () => {
    navigate('/seats')
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">Pick a movie first.</p>
      </div>
    )
  }

  const noResults = !loading && !geoError && !loadError && cinemas.length === 0

  return (
    <div className="min-h-screen bg-bg-base pb-24">
      <header className="sticky top-0 z-20 bg-bg-base/95 backdrop-blur border-b border-border-subtle px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex items-center justify-center h-9 w-9 -ml-2 rounded-full
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="#F4F1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center justify-between mt-1">
          <h1 className="font-display text-xl tracking-tight flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent-marquee">
              <path
                d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            Cinemas near {mockCity}
          </h1>
          <LocationPill city={mockCity} onClick={() => {}} className="text-xs" />
        </div>
        <p className="text-xs text-text-secondary mt-1 line-clamp-1">{movie.title}</p>
      </header>

      <div className="px-4 py-4 flex flex-col gap-3">
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {!loading && (geoError || loadError) && (
          <div className="flex flex-col items-center text-center px-4 py-16 gap-3">
            <p className="text-sm text-text-secondary">
              {geoError ? `Couldn't get your location: ${geoError}` : `Couldn't load cinemas: ${loadError}`}
            </p>
            <button
              type="button"
              onClick={handleBrowseByCity}
              className="rounded-lg border border-accent-marquee text-accent-marquee px-4 py-2.5 min-h-[44px] text-sm font-medium
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
            >
              Browse by city
            </button>
          </div>
        )}

        {noResults && (
          <div className="flex flex-col items-center text-center px-4 py-16 gap-3">
            <p className="text-sm text-text-secondary">No cinemas found nearby showing {movie.title}.</p>
            <button
              type="button"
              onClick={handleBrowseByCity}
              className="rounded-lg border border-accent-marquee text-accent-marquee px-4 py-2.5 min-h-[44px] text-sm font-medium
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
            >
              Browse by city
            </button>
          </div>
        )}

        {!loading &&
          !geoError &&
          !loadError &&
          cinemas.map((cn) => (
            <CinemaListItem
              key={cn.id}
              cinema={cn}
              selectedShowtimeId={cinema?.id === cn.id ? showtime?.id : null}
              onSelectShowtime={handleSelectShowtime}
            />
          ))}
      </div>

      {showtime && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-bg-base/95 backdrop-blur border-t border-border-subtle px-4 py-3">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-lg bg-accent-marquee text-bg-base font-medium py-3.5 min-h-[44px]
              hover:bg-accent-marquee/90 active:scale-[0.99] transition-colors
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
          >
            Continue · {showtime.time} · from ₹{showtime.price}
          </button>
        </div>
      )}
    </div>
  )
}

export default SelectCinema
