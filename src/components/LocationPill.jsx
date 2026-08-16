// LocationPill — tappable mock-city indicator used in the sticky top bar
// and on Select Cinema. Purely cosmetic in this demo (no real geolocation).

export function LocationPill({ city, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface
        px-3 py-2 min-h-[36px] text-sm text-text-primary
        hover:border-accent-marquee-dim transition-colors
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-accent-marquee flex-shrink-0">
        <path
          d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      <span className="truncate max-w-[120px]">{city}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-text-secondary flex-shrink-0">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export default LocationPill
