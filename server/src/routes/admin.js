import { Router } from 'express'
import { getDb } from '../config/firebase.js'
import { runSeed } from '../services/seedData.js'

const router = Router()

// POST /api/admin/seed — one-time-use, gated by a shared secret (SEED_SECRET
// in env, never sent to the frontend). Exists because some hosts (e.g.
// Render's free tier) don't offer one-off CLI jobs, so seeding has to
// happen through the already-deployed server instead. Not part of the
// normal app flow — nothing in the frontend calls this.
router.post('/seed', async (req, res, next) => {
  try {
    const expected = process.env.SEED_SECRET
    if (!expected) return res.status(503).json({ error: 'SEED_SECRET is not configured on this server' })
    if (req.get('x-seed-secret') !== expected) return res.status(403).json({ error: 'Forbidden' })

    const result = await runSeed(getDb())
    res.json({ ok: true, ...result })
  } catch (err) {
    next(err)
  }
})

export default router
