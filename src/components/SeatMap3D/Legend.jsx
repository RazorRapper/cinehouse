import { colors } from '../../tokens/colors.js'

// Always-visible seat legend — never hidden behind a tap. Color is paired
// with a text label so state is never conveyed by hue alone.
export function Legend() {
  const items = [
    { color: colors.seatAvailable, label: 'Available' },
    { color: colors.seatSelected, label: 'Selected' },
    { color: colors.seatBooked, label: 'Booked' },
  ]
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className="text-xs text-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export default Legend
