import { Router } from 'express'
import { FieldValue } from 'firebase-admin/firestore'
import { getDb } from '../config/firebase.js'
import { seatsCol, isLockExpired } from '../services/firestoreService.js'

// Mounted at /api/shows/:showId/seats — showId comes from the parent path.
const router = Router({ mergeParams: true })

// GET /api/shows/:showId/seats
// Lazily expires any locked seat past its hold window before responding,
// so the frontend never has to poll a separate "sweep" endpoint.
router.get('/', async (req, res, next) => {
  try {
    const { showId } = req.params
    const snap = await seatsCol(showId).get()
    if (snap.empty) return res.status(404).json({ error: 'Show not found or has no seat map' })

    const db = getDb()
    const expired = []
    const seats = snap.docs.map((doc) => {
      const data = { id: doc.id, ...doc.data() }
      if (isLockExpired(data)) expired.push(doc.ref)
      return data
    })

    if (expired.length) {
      const batch = db.batch()
      expired.forEach((ref) => batch.update(ref, { status: 'available', lockedBy: null, lockedAt: null }))
      await batch.commit()
      seats.forEach((s) => {
        if (expired.some((ref) => ref.id === s.id)) {
          s.status = 'available'
          s.lockedBy = null
          s.lockedAt = null
        }
      })
    }

    seats.sort((a, b) => (a.row === b.row ? a.number - b.number : a.row.localeCompare(b.row)))
    res.json({ seats })
  } catch (err) {
    next(err)
  }
})

// POST /api/shows/:showId/seats/lock  { seatIds, userId }
// Transactional: all-or-nothing. Rejects with the specific seats that are
// unavailable so the frontend can show exactly why.
router.post('/lock', async (req, res, next) => {
  try {
    const { showId } = req.params
    const { seatIds, userId } = req.body ?? {}
    if (!Array.isArray(seatIds) || seatIds.length === 0 || !userId) {
      return res.status(400).json({ error: 'seatIds (array) and userId are required' })
    }

    const db = getDb()
    const refs = seatIds.map((id) => seatsCol(showId).doc(id))

    const unavailable = await db.runTransaction(async (tx) => {
      const docs = await tx.getAll(...refs)
      const blocked = []

      docs.forEach((doc) => {
        if (!doc.exists) {
          blocked.push({ seatId: doc.id, reason: 'not_found' })
          return
        }
        const seat = doc.data()
        if (seat.status === 'booked') {
          blocked.push({ seatId: doc.id, reason: 'booked' })
        } else if (seat.status === 'locked' && seat.lockedBy !== userId && !isLockExpired(seat)) {
          blocked.push({ seatId: doc.id, reason: 'locked_by_other' })
        }
      })

      if (blocked.length > 0) return blocked

      docs.forEach((doc) => {
        tx.update(doc.ref, { status: 'locked', lockedBy: userId, lockedAt: FieldValue.serverTimestamp() })
      })
      return []
    })

    if (unavailable.length > 0) {
      return res.status(409).json({ error: 'Some seats are unavailable', unavailable })
    }

    res.json({ locked: seatIds })
  } catch (err) {
    next(err)
  }
})

// POST /api/shows/:showId/seats/release  { seatIds, userId }
// Only releases seats actually locked by this userId — one tab can't
// release another user's hold.
router.post('/release', async (req, res, next) => {
  try {
    const { showId } = req.params
    const { seatIds, userId } = req.body ?? {}
    if (!Array.isArray(seatIds) || seatIds.length === 0 || !userId) {
      return res.status(400).json({ error: 'seatIds (array) and userId are required' })
    }

    const db = getDb()
    const refs = seatIds.map((id) => seatsCol(showId).doc(id))
    const docs = await db.getAll(...refs)

    const batch = db.batch()
    const released = []
    docs.forEach((doc) => {
      if (doc.exists && doc.data().lockedBy === userId) {
        batch.update(doc.ref, { status: 'available', lockedBy: null, lockedAt: null })
        released.push(doc.id)
      }
    })
    await batch.commit()

    res.json({ released })
  } catch (err) {
    next(err)
  }
})

export default router
