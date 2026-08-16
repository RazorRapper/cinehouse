import { useNavigate, useParams } from 'react-router-dom'
import { getMovieById } from '../data/mockMovies.js'
import { useBooking } from '../context/BookingContext.jsx'

export function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { startBooking } = useBooking()
  const movie = getMovieById(id)

  if (!movie) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
        <p className="text-text-secondary text-sm">Movie not found.</p>
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
        <img src={movie.backdrop} alt="" className="h-full w-full object-cover" />
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

        <section className="mt-6">
          <h2 className="font-display text-xl tracking-tight mb-2">Synopsis</h2>
          <p className="text-sm text-text-secondary leading-relaxed">{movie.synopsis}</p>
        </section>

        <section className="mt-6">
          <h2 className="font-display text-xl tracking-tight mb-3">Cast</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {movie.cast.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="h-14 w-14 rounded-full object-cover border border-border-subtle"
                />
                <span className="text-[11px] text-text-secondary text-center leading-tight line-clamp-2">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </section>
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
