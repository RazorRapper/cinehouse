// TicketStubCard — the signature CineHouse component.
// A physical-ticket-stub shape: poster section + dashed perforation with
// notch cutouts + details section. Used in exactly two places: Home movie
// cards, and the final booking confirmation ticket. Do not reuse elsewhere.
//
// Two visual variants:
//  - "movie": poster + title + tags + badge (Home screen)
//  - "booking": wide poster + title on top, QR + booking details on bottom (Ticket screen)

const Perforation = () => (
  <div className="relative w-full h-px flex-shrink-0">
    <div className="absolute inset-0 border-t border-dashed border-border-subtle" />
    <span
      aria-hidden="true"
      className="absolute left-1/2 -translate-x-1/2 -top-2.5 h-5 w-5 rounded-full bg-bg-base border border-border-subtle"
    />
  </div>
)

export function TicketStubCard({
  variant = 'movie',
  movie,
  badge, // 'now-showing' | 'coming-soon' | undefined
  footer, // custom footer node for booking variant (QR etc.)
  onClick,
  className = '',
}) {
  const isComingSoon = badge === 'coming-soon'
  const isBooking = variant === 'booking'

  const posterBlock = (
    <div
      className={`relative overflow-hidden rounded-t-xl w-full flex-shrink-0 ${
        isBooking ? 'aspect-[16/10]' : 'aspect-[2/3]'
      }`}
    >
      <img
        src={isBooking ? movie.backdrop ?? movie.poster : movie.poster}
        alt={`${movie.title} poster`}
        loading="lazy"
        className={`h-full w-full object-cover ${isComingSoon ? 'grayscale opacity-60' : ''}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-base/70 via-transparent to-transparent" />
      {badge === 'now-showing' && (
        <span className="absolute top-2 left-2 rounded-full bg-accent-marquee px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wide text-bg-base">
          Now Showing
        </span>
      )}
      {isComingSoon && (
        <span className="absolute top-2 left-2 rounded-full bg-surface-raised/90 border border-border-subtle px-2.5 py-1 text-[11px] font-mono uppercase tracking-wide text-text-secondary">
          {movie.releaseDate ?? 'Coming Soon'}
        </span>
      )}
      {isBooking && (
        <h3 className="absolute bottom-2 left-3 right-3 font-display text-[28px] leading-none tracking-tight text-text-primary drop-shadow-sm line-clamp-1">
          {movie.title}
        </h3>
      )}
    </div>
  )

  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group text-left w-full rounded-xl border border-border-subtle bg-surface overflow-hidden flex flex-col
        transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee
        ${onClick ? 'hover:shadow-[0_0_0_1px_rgba(232,163,61,0.3),0_0_24px_rgba(232,163,61,0.08)]' : ''}
        ${className}`}
    >
      {posterBlock}
      <Perforation />
      <div className="p-4 flex flex-col gap-2">
        {!isBooking && (
          <h3 className="font-display text-[22px] leading-none tracking-tight text-text-primary line-clamp-1">
            {movie.title}
          </h3>
        )}
        {variant === 'movie' && (
          <div className="flex flex-wrap gap-1.5">
            {movie.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="rounded-full border border-border-subtle px-2 py-0.5 text-[11px] text-text-secondary"
              >
                {g}
              </span>
            ))}
            <span className="rounded-full border border-border-subtle px-2 py-0.5 text-[11px] text-text-secondary">
              {movie.language}
            </span>
          </div>
        )}
        {footer}
      </div>
    </Wrapper>
  )
}

export default TicketStubCard
