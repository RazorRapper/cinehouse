import apiFetch from './fetchClient.js'

export async function fetchShows({ cinemaId, movieId }) {
  const params = new URLSearchParams()
  if (cinemaId) params.set('cinemaId', cinemaId)
  if (movieId) params.set('movieId', String(movieId))
  const { shows } = await apiFetch(`/api/shows?${params}`)
  return shows
}
