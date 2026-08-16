import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchMovieDetail } from '../api/moviesApi.js'
import { useBooking } from '../context/BookingContext.jsx'

function CastAvatar({ name, avatar }) {
  if (avatar) {
    return <img src={avatar} alt={name} className="h-14 w-14 rounded-full object-cover border border-border-subtle" />
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
  return (
    <div className="h-14 w-14 rounded-full border border-border-subtle bg-surface-raised flex items-center justify-center">
      <span className="text-xs text-text-secondary">{initials}</span>
    </div>
  )
}

export function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { startBooking } = useBooking()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMovieDetail(id)
      .then((m) => {
        if (!cancelled) setMovie(m)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">Loading…</p>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">{error ? `Couldn't load movie: ${error}` : 'Movie not found.'}</p>
      </div>
    )
  }

  const handleBook = () => {
    startBooking(movie)
    navigate('/cinemas')
  }

  return (
    <div className="min-h-screen bg-bg-base pb-28">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="fixed top-3 left-3 z-20 flex items-center justify-center h-11 w-11 rounded-full
          bg-bg-base/70 backdrop-blur border border-border-subtle
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 19l-7-7 7-7" stroke="#F4F1EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Backdrop */}
      <div className="relative w-full aspect-[16/9]">
        {movie.backdrop && <img src={movie.backdrop} alt="" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-base/40 to-bg-base" />
      </div>

      <div className="px-4 -mt-8 relative">
        <h1 className="font-display text-[40px] leading-[0.95] tracking-tight text-text-primary">
          {movie.title}
        </h1>

        <p className="font-mono-num text-[13px] text-text-secondary mt-3 uppercase tracking-wide">
          {movie.duration} · {movie.language.toUpperCase()} · {movie.rating}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {movie.genre.map((g) => (
            <span key={g} className="rounded-full border border-border-subtle px-2.5 py-1 text-[11px] text-text-secondary">
              {g}
            </span>
          ))}
          {movie.format.map((f) => (
            <span
              key={f}
              className="rounded-full border border-accent-marquee-dim px-2.5 py-1 text-[11px] text-accent-marquee"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Not in the original screens spec — additive: only shown when TMDB
            actually has a trailer for this movie, silently omitted otherwise. */}
        {movie.trailer && (
          <a
            href={movie.trailer.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 rounded-lg border border-border-subtle px-3.5 py-2 min-h-[44px] text-sm text-text-primary
              hover:border-accent-marquee-dim transition-colors
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent-marquee">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
            </svg>
            Watch Trailer
          </a>
        )}

        <section className="mt-6">
          <h2 className="font-display text-xl tracking-tight mb-2">Synopsis</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{movie.synopsis}</p>
        </section>

        {movie.cast.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-xl tracking-tight mb-3">Cast</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {movie.cast.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
                  <CastAvatar name={c.name} avatar={c.avatar} />
                  <span className="text-[11px] text-text-secondary text-center leading-tight line-clamp-2">
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-bg-base/95 backdrop-blur border-t border-border-subtle px-4 py-3">
        <button
          type="button"
          onClick={handleBook}
          className="w-full rounded-lg bg-accent-marquee text-bg-base font-medium py-3.5 min-h-[44px]
            hover:bg-accent-marquee/90 active:scale-[0.99] transition-colors
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
        >
          Book Tickets
        </button>
      </div>
    </div>
  )
}

export default MovieDetail
