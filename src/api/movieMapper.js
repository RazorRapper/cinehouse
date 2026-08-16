// Adapts the backend's TMDB-shaped movie responses into the exact prop
// shape the existing screens/components were built against (see the old
// src/data/mockMovies.js for the reference shape). Components never change
// — only this mapper knows the backend response shape.

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatBadgeDate(isoDate) {
  if (!isoDate) return null
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return null
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`
}

// TMDB has no cinema "format" (2D/3D/IMAX) or certification-at-list-level
// concept — those are per-show/cinema attributes in a real system. Default
// sensibly rather than fabricate data TMDB doesn't provide.
const DEFAULT_FORMAT = ['2D']
const DEFAULT_RATING = 'UA'

export function mapMovieSummary(movie) {
  return {
    id: movie.id,
    title: movie.title,
    genre: movie.genres?.length ? movie.genres.slice(0, 2) : ['Movie'],
    language: movie.language,
    format: DEFAULT_FORMAT,
    rating: DEFAULT_RATING,
    poster: movie.poster,
    backdrop: movie.backdrop,
    synopsis: movie.overview,
    cast: [],
    releaseDate: formatBadgeDate(movie.releaseDate),
  }
}

export function mapMovieDetail(movie) {
  return {
    id: movie.id,
    title: movie.title,
    genre: movie.genres?.length ? movie.genres : ['Movie'],
    language: movie.language,
    format: DEFAULT_FORMAT,
    rating: movie.certification || DEFAULT_RATING,
    duration: movie.runtimeMinutes ? `${movie.runtimeMinutes} MIN` : '— MIN',
    poster: movie.poster,
    backdrop: movie.backdrop,
    synopsis: movie.overview,
    cast: (movie.cast ?? []).map((c) => ({ name: c.name, avatar: c.avatar })),
    releaseDate: formatBadgeDate(movie.releaseDate),
    // Not part of the original mock shape — additive, used only by the new
    // "Watch Trailer" button. undefined/null when TMDB has no trailer.
    trailer: movie.trailer ?? null,
  }
}
