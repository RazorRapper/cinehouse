import ShowtimePill from './ShowtimePill.jsx'

// CinemaListItem — cinema row with inline showtime selection (build order
// step 4/5: no separate "select showtime" screen, selection lives here).

export function CinemaListItem({ cinema, selectedShowtimeId, onSelectShowtime }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl tracking-tight leading-tight">{cinema.name}</h3>
        <span className="font-mono text-[12px] text-text-secondary flex-shrink-0 pt-0.5">{cinema.distance}</span>
      </div>
      <p className="text-xs text-text-secondary mt-1">{cinema.address}</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
        {cinema.showtimes.map((st) => (
          <ShowtimePill
            key={st.id}
            time={st.time}
            format={st.format}
            selected={selectedShowtimeId === st.id}
            onClick={() => onSelectShowtime(cinema, st)}
          />
        ))}
      </div>
    </div>
  )
}

export default CinemaListItem
