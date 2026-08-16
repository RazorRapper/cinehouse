import apiFetch from './fetchClient.js'
import { mapMovieSummary, mapMovieDetail } from './movieMapper.js'

export async function fetchNowShowing() {
  const { results } = await apiFetch('/api/movies/now-showing')
  return results.map(mapMovieSummary)
}

export async function fetchUpcoming() {
  const { results } = await apiFetch('/api/movies/upcoming')
  return results.map(mapMovieSummary)
}

export async function fetchPopular() {
  const { results } = await apiFetch('/api/movies/popular')
  return results.map(mapMovieSummary)
}

export async function searchMovies(query) {
  if (!query.trim()) return []
  const { results } = await apiFetch(`/api/movies/search?q=${encodeURIComponent(query)}`)
  return results.map(mapMovieSummary)
}

export async function fetchMovieDetail(id) {
  const movie = await apiFetch(`/api/movies/${id}`)
  return mapMovieDetail(movie)
}
