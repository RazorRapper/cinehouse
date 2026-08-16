import apiFetch from './fetchClient.js'

export async function fetchNearbyCinemas({ lat, lng, movieId }) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) })
  if (movieId) params.set('movieId', String(movieId))
  const { cinemas } = await apiFetch(`/api/cinemas/nearby?${params}`)
  return cinemas
}
