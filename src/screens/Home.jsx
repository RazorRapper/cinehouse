import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TicketStubCard from '../components/TicketStubCard.jsx'
import LocationPill from '../components/LocationPill.jsx'
import { nowShowing, comingSoon, filterOptions } from '../data/mockMovies.js'
import { mockCity } from '../data/mockCinemas.js'
import { useBooking } from '../context/BookingContext.jsx'

const FILTER_CHIPS = [
  ...filterOptions.language.map((v) => ({ type: 'language', value: v })),
  ...filterOptions.genre.map((v) => ({ type: 'genre', value: v })),
  ...filterOptions.format.map((v) => ({ type: 'format', value: v })),
]

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 rounded-full border px-3.5 py-2 min-h-[36px] text-sm whitespace-nowrap transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee
        ${
          active
            ? 'bg-accent-marquee border-accent-marquee text-bg-base font-medium'
            : 'border-border-subtle text-text-secondary hover:text-text-primary hover:border-text-secondary'
        }`}
    >
      {label}
    </button>
  )
}

function MovieRow({ title, movies, badge, onSelect }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-[22px] tracking-tight px-4 mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1 snap-x snap-mandatory">
        {movies.map((movie) => (
          <div key={movie.id} className="w-[168px] flex-shrink-0 snap-start">
            <TicketStubCard movie={movie} badge={badge} onClick={() => onSelect(movie)} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function Home() {
  const navigate = useNavigate()
  const { startBooking } = useBooking()
  const [query, setQuery] = useState('')
  const [activeChips, setActiveChips] = useState(new Set())

  const toggleChip = (chip) => {
    setActiveChips((prev) => {
      const key = `${chip.type}:${chip.value}`
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const matchesFilters = (movie) => {
    if (query && !movie.title.toLowerCase().includes(query.toLowerCase())) return false
    if (activeChips.size === 0) return true
    return [...activeChips].every((key) => {
      const [type, value] = key.split(':')
      if (type === 'language') return movie.language === value
      if (type === 'genre') return movie.genre.includes(value)
      if (type === 'format') return movie.format.includes(value)
      return true
    })
  }

  const filteredNowShowing = useMemo(() => nowShowing.filter(matchesFilters), [query, activeChips])
  const filteredComingSoon = useMemo(() => comingSoon.filter(matchesFilters), [query, activeChips])

  const handleSelect = (movie) => {
    startBooking(movie)
    navigate(`/movie/${movie.id}`)
  }

  return (
    <div className="min-h-screen bg-bg-base pb-10">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 bg-bg-base/95 backdrop-blur border-b border-border-subtle">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-display text-2xl tracking-tight">
            Cine<span className="text-accent-marquee">House</span>
          </h1>
          <div className="flex items-center gap-2">
            <LocationPill city={mockCity} onClick={() => {}} />
            <Link
              to="/login"
              aria-label="Log in"
              className="flex items-center justify-center h-9 w-9 rounded-full border border-border-subtle text-text-secondary
                hover:text-text-primary hover:border-accent-marquee-dim transition-colors
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies"
              className="w-full rounded-lg bg-surface border border-border-subtle pl-9 pr-3 py-2.5 min-h-[44px]
                text-sm text-text-primary placeholder:text-text-secondary
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-3">
          {FILTER_CHIPS.map((chip) => {
            const key = `${chip.type}:${chip.value}`
            return (
              <FilterChip
                key={key}
                label={chip.value}
                active={activeChips.has(key)}
                onClick={() => toggleChip(chip)}
              />
            )
          })}
        </div>
      </header>

      {filteredNowShowing.length > 0 && (
        <MovieRow title="Now Showing" movies={filteredNowShowing} badge="now-showing" onSelect={handleSelect} />
      )}
      {filteredComingSoon.length > 0 && (
        <MovieRow title="Coming Soon" movies={filteredComingSoon} badge="coming-soon" onSelect={handleSelect} />
      )}
      {filteredNowShowing.length === 0 && filteredComingSoon.length === 0 && (
        <div className="px-4 py-16 text-center text-text-secondary">
          <p className="text-sm">No movies match your filters.</p>
        </div>
      )}
    </div>
  )
}

export default Home
