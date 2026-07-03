import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration — hardcoded as requested.
// NOTE: Firebase API keys are client-side credentials and are safe to ship
// in browser code when restricted to authorised domains in the Firebase console.
const firebaseConfig = {
  apiKey: 'AIzaSyBtUtokjQfOvRlKaXioYz-4BevOSnj6h4w',
  authDomain: 'smokescreen-2bc84.firebaseapp.com',
  projectId: 'smokescreen-2bc84',
  storageBucket: 'smokescreen-2bc84.firebasestorage.app',
  messagingSenderId: '461923381527',
  appId: '1:461923381527:web:d4aea1b1c58081d5364752',
  measurementId: 'G-JQK7K10TNC',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
