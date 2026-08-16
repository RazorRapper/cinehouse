// ShowtimePill — tappable time pill shown inline on a cinema card.
// Selected state fills with accent-marquee; others stay outlined.

export function ShowtimePill({ time, format, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex-shrink-0 rounded-lg border px-3 py-2 min-h-[44px] min-w-[44px] flex flex-col items-center justify-center
        transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-marquee
        ${
          selected
            ? 'bg-accent-marquee border-accent-marquee text-bg-base'
            : 'border-border-subtle text-text-primary hover:border-accent-marquee-dim'
        }`}
    >
      <span className="font-mono text-[13px] leading-tight">{time}</span>
      <span className={`font-mono text-[10px] leading-tight ${selected ? 'text-bg-base/70' : 'text-text-secondary'}`}>
        {format}
      </span>
    </button>
  )
}

export default ShowtimePill
