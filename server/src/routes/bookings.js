import { Router } from 'express'
import { getDb } from '../config/firebase.js'
import { seatsCol, bookingsCol, showsCol } from '../services/firestoreService.js'

const router = Router()

// Matches the frontend's existing mock format (CH-XXXXXXX) — see
// src/screens/Confirm.jsx's generateBookingId.
function generateBookingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'CH-'
  for (let i = 0; i < 7; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

// POST /api/bookings/confirm  { showId, seatIds, userId }
// Only confirms seats this userId currently holds a live lock on — you
// can't confirm a seat you never locked (or that expired/got taken).
router.post('/confirm', async (req, res, next) => {
  try {
    const { showId, seatIds, userId } = req.body ?? {}
    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0 || !userId) {
      return res.status(400).json({ error: 'showId, seatIds (array), and userId are required' })
    }

    const db = getDb()
    const showRef = showsCol().doc(showId)
    const seatRefs = seatIds.map((id) => seatsCol(showId).doc(id))

    let bookingId
    const invalid = await db.runTransaction(async (tx) => {
      const [showDoc, ...seatDocs] = await tx.getAll(showRef, ...seatRefs)
      if (!showDoc.exists) throw Object.assign(new Error('Show not found'), { status: 404 })

      const bad = seatDocs
        .map((doc, i) => ({ doc, seatId: seatIds[i] }))
        .filter(({ doc }) => !doc.exists || doc.data().status !== 'locked' || doc.data().lockedBy !== userId)
        .map(({ seatId }) => seatId)

      if (bad.length > 0) return bad

      bookingId = generateBookingId()
      seatDocs.forEach((doc) => tx.update(doc.ref, { status: 'booked', lockedBy: null, lockedAt: null }))

      const total = seatDocs.reduce((sum, doc) => sum + (doc.data().price ?? 0), 0)
      tx.set(bookingsCol().doc(bookingId), {
        bookingId,
        userId,
        showId,
        seatIds,
        total,
        status: 'confirmed',
        qrCode: bookingId,
        createdAt: new Date().toISOString(),
      })

      return []
    })

    if (invalid.length > 0) {
      return res.status(409).json({ error: 'Some seats are no longer held by you', seatIds: invalid })
    }

    res.status(201).json({ bookingId })
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ error: err.message })
    next(err)
  }
})

// GET /api/bookings/:id — booking detail for the ticket screen.
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await bookingsCol().doc(req.params.id).get()
    if (!doc.exists) return res.status(404).json({ error: 'Booking not found' })

    const booking = doc.data()
    const showDoc = await showsCol().doc(booking.showId).get()

    res.json({ ...booking, show: showDoc.exists ? { id: showDoc.id, ...showDoc.data() } : null })
  } catch (err) {
    next(err)
  }
})

export default router
