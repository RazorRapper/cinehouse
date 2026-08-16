// tmdbService — the ONLY file that talks to TMDB. Routes call these
// functions; they never construct a TMDB URL themselves and the Bearer
// token never leaves this process, let alone the server.

const BASE_URL = process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = process.env.TMDB_IMAGE_BASE_URL ?? 'https://image.tmdb.org/t/p/w500'
// Backdrops read better at a wider size than the poster default.
const BACKDROP_BASE_URL = IMAGE_BASE_URL.replace(/w\d+$/, 'w1280')

async function tmdbRequest(path, params = {}) {
  const token = process.env.TMDB_ACCESS_TOKEN
  if (!token) {
    throw new Error('TMDB_ACCESS_TOKEN is not set in server/.env')
  }

  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err = new Error(`TMDB request failed: ${res.status} ${res.statusText} — ${path}`)
    err.status = res.status
    err.body = body
    throw err
  }

  return res.json()
}

// Turns TMDB's relative path fields into ready-to-use absolute URLs so the
// frontend never has to know TMDB's image CDN shape.
export function toImageUrl(path, kind = 'poster') {
  if (!path) return null
  const base = kind === 'backdrop' ? BACKDROP_BASE_URL : IMAGE_BASE_URL
  return `${base}${path}`
}

export async function getNowPlaying({ page = 1, region = 'IN' } = {}) {
  return tmdbRequest('/movie/now_playing', { language: 'en-US', region, page })
}

export async function getUpcoming({ page = 1, region = 'IN' } = {}) {
  return tmdbRequest('/movie/upcoming', { language: 'en-US', region, page })
}

export async function getPopular({ page = 1, region = 'IN' } = {}) {
  return tmdbRequest('/movie/popular', { language: 'en-US', region, page })
}

export async function searchMovies(query, { page = 1 } = {}) {
  return tmdbRequest('/search/movie', { query, language: 'en-US', page, include_adult: false })
}

export async function getMovieDetail(movieId) {
  return tmdbRequest(`/movie/${movieId}`, {
    language: 'en-US',
    // videos/credits for trailer + cast in one round trip; release_dates so
    // we can resolve an India (or fallback) certification for `rating`.
    append_to_response: 'videos,credits,release_dates',
  })
}

// Genre id -> name. TMDB's genre list is a small, stable, rarely-changing
// set — fetch once and cache for the process lifetime rather than re-fetch
// per request.
let genreMapCache = null

export async function getGenreMap() {
  if (genreMapCache) return genreMapCache
  const { genres } = await tmdbRequest('/genre/movie/list', { language: 'en-US' })
  genreMapCache = new Map(genres.map((g) => [g.id, g.name]))
  return genreMapCache
}
