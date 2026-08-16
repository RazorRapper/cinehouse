# CineHouse

A frontend-only demo of a movie ticket booking app — browse movies, pick a
cinema and showtime, choose seats on a 3D seat map, and get a QR ticket. No
backend, no real payment; everything runs on mock data.

**Stack:** React 19 · Tailwind CSS v4 · React Three Fiber · React Router

## Flow

Login → Home (browse movies) → Movie Detail → Select Cinema (with inline
showtime pills) → 3D Seat Map → Confirm → QR Ticket

## Highlights

- **3D seat map** — real chair-shaped seats (cushion, backrest, armrests)
  arranged in curved, tiered rows: Club (front, cheapest) → Royal (middle)
  → Royal Recliner (back, priciest, wider chairs). Hover glow, click to
  select/deselect, a persistent bottom sheet with a mock hold countdown.
- **`TicketStubCard`** — a reusable dashed-perforation ticket-stub component,
  used for movie cards on Home and for the final QR ticket.
- Fully responsive, mobile-first (390px) up to desktop, where the seat
  booking sheet becomes a fixed side panel.
- Respects `prefers-reduced-motion`.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Project structure

```
src/
  components/       Reusable UI (TicketStubCard, SeatMap3D, BookingSheet, ...)
  screens/          One file per screen in the booking flow
  context/          Client-side booking state shared across screens
  data/             Mock movies, cinemas, and seat layouts
  tokens/           Design tokens (colors, typography) mirrored in index.css
```

## Design tokens

Colors, type, spacing, and motion rules are defined in `src/tokens/` and
`src/index.css` (Tailwind v4 `@theme`). See those files for the source of
truth — dimmed-theater dark palette, an amber marquee accent, and distinct
green/blue/grey seat states.
