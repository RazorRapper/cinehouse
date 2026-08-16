import { Router } from 'express'
import { showsCol } from '../services/firestoreService.js'

const router = Router()

// GET /api/shows?cinemaId=&movieId=  — matching shows + showtimes.
// Either filter is optional; at least one is expected in practice but
// neither is enforced so callers can browse broadly.
router.get('/', async (req, res, next) => {
  try {
    let query = showsCol()
    const { cinemaId, movieId } = req.query

    if (cinemaId) query = query.where('cinemaId', '==', cinemaId)
    if (movieId) query = query.where('movieId', '==', Number(movieId))

    const snap = await query.get()
    const shows = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(a.time) - new Date(b.time))

    res.json({ shows })
  } catch (err) {
    next(err)
  }
})

export default router
