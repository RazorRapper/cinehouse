import apiFetch from './fetchClient.js'

export async function confirmBooking({ showId, seatIds, userId }) {
  return apiFetch('/api/bookings/confirm', {
    method: 'POST',
    body: JSON.stringify({ showId, seatIds, userId }),
  })
}

export async function fetchBooking(bookingId) {
  return apiFetch(`/api/bookings/${bookingId}`)
}
