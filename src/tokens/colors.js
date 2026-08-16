// CineHouse design tokens — colors
// Single source of truth. Mirrored in src/index.css as Tailwind v4 @theme
// vars (bg-base, surface, etc). Import THIS file wherever a raw hex is
// needed in JS — e.g. React Three Fiber materials, which can't read
// Tailwind classes.

export const colors = {
  bgBase: '#0B0D12',
  surface: '#14171F',
  surfaceRaised: '#1C202B',
  borderSubtle: '#262B38',
  textPrimary: '#F4F1EA',
  textSecondary: '#9AA0AC',
  accentMarquee: '#E8A33D',
  accentMarqueeDim: '#7A5A28',
  seatAvailable: '#34D399',
  seatSelected: '#4C8DFF',
  seatBooked: '#4B5160',
  error: '#E5484D',
}

export default colors
