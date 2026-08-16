// One-off seed script — NOT an API route. Run with `npm run seed` from
// server/. Populates Firestore with mock cinemas + shows linking those
// cinemas to real TMDB now-playing movie ids, and generates each show's
// seat grid. Core logic lives in services/seedData.js, shared with the
// POST /api/admin/seed route (for hosts without one-off CLI jobs).
import 'dotenv/config'
import { setDefaultResultOrder } from 'node:dns'
import { getDb } from '../config/firebase.js'
import { runSeed } from '../services/seedData.js'

// See server/src/index.js for why this is needed on this network.
setDefaultResultOrder('ipv4first')

runSeed(getDb())
  .then(() => {
    console.log('Seed complete.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
