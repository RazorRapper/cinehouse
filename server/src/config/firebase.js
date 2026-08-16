// Firebase Admin SDK init — server-side only. Never import this from
// anything that ships to the browser.
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let app
let db

export function getFirebaseApp() {
  if (app) return app

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  // .env stores the private key with literal "\n" sequences (it can't hold
  // real newlines in a single-line value) — swap them back before use.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
        'and FIREBASE_PRIVATE_KEY in server/.env (see .env.example).',
    )
  }

  app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      })

  return app
}

export function getDb() {
  if (db) return db
  db = getFirestore(getFirebaseApp())
  return db
}
