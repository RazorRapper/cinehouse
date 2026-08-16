import { Router } from 'express'
import { cinemasCol, showsCol, distanceKm } from '../services/firestoreService.js'

const router = Router()

// GET /api/cinemas/nearby?lat=&lng=&movieId=
// Seeded cinemas, distance-sorted from the given point. If movieId is
// passed, only cinemas with at least one show for that movie are returned.
router.get('/nearby', async (req, res, next) => {
  try {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'lat and lng query params are required' })
    }
    const movieId = req.query.movieId ? Number(req.query.movieId) : null

    const snap = await cinemasCol().get()
    let cinemas = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    if (movieId) {
      const showsSnap = await showsCol().where('movieId', '==', movieId).get()
      const cinemaIdsWithShow = new Set(showsSnap.docs.map((d) => d.data().cinemaId))
      cinemas = cinemas.filter((c) => cinemaIdsWithShow.has(c.id))
    }

    const withDistance = cinemas
      .map((c) => ({
        ...c,
        distanceKm: c.location ? Number(distanceKm(lat, lng, c.location.lat, c.location.lng).toFixed(1)) : null,
      }))
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))

    res.json({ cinemas: withDistance })
  } catch (err) {
    next(err)
  }
})

export default router
