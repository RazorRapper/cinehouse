import { Router } from 'express'
import {
  getNowPlaying,
  getUpcoming,
  getPopular,
  searchMovies,
  getMovieDetail,
  getGenreMap,
  toImageUrl,
} from '../services/tmdbService.js'

const router = Router()

// Common ISO 639-1 codes we're likely to see from TMDB's `original_language`
// field, expanded to a display name. Falls back to the raw code (uppercased)
// for anything not in this list rather than failing.
const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  mr: 'Marathi',
  bn: 'Bengali',
  pa: 'Punjabi',
  ja: 'Japanese',
  ko: 'Korean',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  zh: 'Chinese',
}

const languageName = (code) => LANGUAGE_NAMES[code] ?? (code ? code.toUpperCase() : 'Unknown')

// ---- In-memory response cache (10 min TTL) for the three list endpoints,
// per the spec: avoid hammering TMDB's rate limit on every Home load.
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map() // key -> { data, fetchedAt }

async function cached(key, loader) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) return hit.data
  const data = await loader()
  cache.set(key, { data, fetchedAt: Date.now() })
  return data
}

async function mapSummary(raw) {
  const genreMap = await getGenreMap()
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview,
    releaseDate: raw.release_date || null,
    voteAverage: raw.vote_average ?? null,
    originalLanguage: raw.original_language,
    language: languageName(raw.original_language),
    genres: (raw.genre_ids ?? []).map((id) => genreMap.get(id)).filter(Boolean),
    poster: toImageUrl(raw.poster_path, 'poster'),
    backdrop: toImageUrl(raw.backdrop_path, 'backdrop'),
  }
}

function pickTrailer(videos) {
  const results = videos?.results ?? []
  const trailer =
    results.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ??
    results.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
    results.find((v) => v.site === 'YouTube')
  if (!trailer) return null
  return { key: trailer.key, name: trailer.name, url: `https://www.youtube.com/watch?v=${trailer.key}` }
}

function pickCertification(releaseDates) {
  const results = releaseDates?.results ?? []
  const preferredOrder = ['IN', 'US', 'GB']
  for (const country of preferredOrder) {
    const entry = results.find((r) => r.iso_3166_1 === country)
    const cert = entry?.release_dates?.find((d) => d.certification)?.certification
    if (cert) return cert
  }
  const anyCert = results.flatMap((r) => r.release_dates ?? []).find((d) => d.certification)?.certification
  return anyCert ?? null
}

function mapDetail(raw) {
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview,
    releaseDate: raw.release_date || null,
    runtimeMinutes: raw.runtime ?? null,
    voteAverage: raw.vote_average ?? null,
    originalLanguage: raw.original_language,
    language: languageName(raw.original_language),
    genres: (raw.genres ?? []).map((g) => g.name),
    poster: toImageUrl(raw.poster_path, 'poster'),
    backdrop: toImageUrl(raw.backdrop_path, 'backdrop'),
    certification: pickCertification(raw.release_dates),
    trailer: pickTrailer(raw.videos),
    cast: (raw.credits?.cast ?? []).slice(0, 8).map((c) => ({
      name: c.name,
      character: c.character,
      avatar: toImageUrl(c.profile_path, 'poster'),
    })),
  }
}

router.get('/now-showing', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1
    const data = await cached(`now-showing:${page}`, () => getNowPlaying({ page }))
    const results = await Promise.all(data.results.map(mapSummary))
    res.json({ page: data.page, totalPages: data.total_pages, results })
  } catch (err) {
    next(err)
  }
})

router.get('/upcoming', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1
    const data = await cached(`upcoming:${page}`, () => getUpcoming({ page }))
    const results = await Promise.all(data.results.map(mapSummary))
    res.json({ page: data.page, totalPages: data.total_pages, results })
  } catch (err) {
    next(err)
  }
})

router.get('/popular', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1
    const data = await cached(`popular:${page}`, () => getPopular({ page }))
    const results = await Promise.all(data.results.map(mapSummary))
    res.json({ page: data.page, totalPages: data.total_pages, results })
  } catch (err) {
    next(err)
  }
})

// Search is inherently live/user-driven — never cached.
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q ?? '').trim()
    if (!q) return res.json({ page: 1, totalPages: 0, results: [] })
    const data = await searchMovies(q, { page: Number(req.query.page) || 1 })
    const results = await Promise.all(data.results.map(mapSummary))
    res.json({ page: data.page, totalPages: data.total_pages, results })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid movie id' })
    const raw = await getMovieDetail(id)
    res.json(mapDetail(raw))
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: 'Movie not found' })
    next(err)
  }
})

export default router
