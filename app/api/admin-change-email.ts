import { randomUUID } from 'node:crypto'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const ADMIN_EMAIL = 'okohwiz889@mail.com'
const PROJECT_ID = 'smokescreen-2bc84'
export const config = { maxDuration: 60 }

interface Request {
  method?: string
  headers: { authorization?: string }
  body: unknown
}
interface Response {
  status(code: number): Response
  json(body: Record<string, unknown>): void
}
class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function services() {
  let app = getApps().find((entry) => entry.name === 'admin-email')
  if (!app) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    if (!raw) throw new HttpError(503, 'Email changes are not configured on the server. Contact the site administrator.')
    const account = JSON.parse(raw)
    if (account.project_id !== PROJECT_ID) throw new HttpError(503, 'The server Firebase project does not match this app.')
    app = initializeApp({ credential: cert(account), projectId: PROJECT_ID }, 'admin-email')
  }
  return { auth: getAuth(app), db: getFirestore(app) }
}

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' })
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return res.status(401).json({ error: 'Sign in as an administrator to change email addresses.' })

  try {
    const { auth, db } = services()
    let caller
    try {
      const decoded = await auth.verifyIdToken(token, true)
      caller = await auth.getUser(decoded.uid)
      if (decoded.email !== ADMIN_EMAIL || caller.email !== ADMIN_EMAIL || caller.disabled) {
        throw new HttpError(403, 'Only the administrator can change user email addresses.')
      }
    } catch (error) {
      if (error instanceof HttpError) throw error
      throw new HttpError(401, 'Your session has expired. Sign in again.')
    }

    let body
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body } catch {
      throw new HttpError(400, 'Invalid request.')
    }
    const { uid, email, expectedEmail } = (body || {}) as Record<string, unknown>
    if (typeof uid !== 'string' || !uid || uid.length > 128 || uid.includes('/') ||
        typeof email !== 'string' || typeof expectedEmail !== 'string') {
      throw new HttpError(400, 'A user and email address are required.')
    }
    const nextEmail = email.trim().toLowerCase()
    const previousEmail = expectedEmail.trim().toLowerCase()
    if (nextEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      throw new HttpError(400, 'Enter a valid email address.')
    }
    if (uid === caller.uid || nextEmail === ADMIN_EMAIL) {
      throw new HttpError(403, 'The administrator login email cannot be changed here.')
    }

    // Serialize changes for this user across server instances. A crashed request
    // releases its lease after two minutes; the function itself lasts at most 60s.
    const lock = db.collection('_admin_email_locks').doc(uid)
    const operationId = randomUUID()
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(lock)
      if (existing.exists && Number(existing.data()?.expiresAt) > Date.now()) {
        throw new HttpError(409, 'An email change is already running for this user. Try again shortly.')
      }
      transaction.set(lock, { operationId, expiresAt: Date.now() + 120_000 })
    })

    try {
      const profileRef = db.collection('profiles_nbb').doc(uid)
      const [profile, user, lookups] = await Promise.all([
        profileRef.get(), auth.getUser(uid),
        db.collection('account_lookup').where('uid', '==', uid).get(),
      ])
      if (!profile.exists) throw new HttpError(404, 'User profile not found.')
      if (user.email === ADMIN_EMAIL) throw new HttpError(403, 'The administrator login email cannot be changed here.')
      const currentEmail = (user.email || '').toLowerCase()
      const profileEmail = String(profile.data()?.email || '').toLowerCase()
      if (![previousEmail, nextEmail].includes(currentEmail) || ![previousEmail, nextEmail].includes(profileEmail)) {
        throw new HttpError(409, 'This user’s email has changed. Reopen the profile and try again.')
      }
      const accountNumber = String(profile.data()?.account_number || '')
      if (!accountNumber || accountNumber.includes('/')) throw new HttpError(409, 'This user has no valid account number. Correct the account first.')
      const accountRef = db.collection('account_lookup').doc(accountNumber)
      const account = await accountRef.get()
      if (account.exists && account.data()?.uid !== uid) throw new HttpError(409, 'The account number belongs to another user.')
      if (lookups.size > 450) throw new HttpError(409, 'Too many account lookup records. Contact the site administrator.')

      const changed = currentEmail !== nextEmail
      if (changed) await auth.updateUser(uid, { email: nextEmail, emailVerified: false })
      try {
        const batch = db.batch()
        batch.update(profileRef, { email: nextEmail, updated_at: FieldValue.serverTimestamp() }, { lastUpdateTime: profile.updateTime! })
        for (const lookup of lookups.docs) {
          if (lookup.id !== accountNumber) batch.update(lookup.ref, { email: nextEmail }, { lastUpdateTime: lookup.updateTime })
        }
        if (account.exists) {
          batch.update(accountRef, { email: nextEmail }, { lastUpdateTime: account.updateTime! })
        } else {
          batch.create(accountRef, { uid, email: nextEmail, created_at: FieldValue.serverTimestamp() })
        }
        await batch.commit()
      } catch {
        // Auth and Firestore cannot share a transaction. Restore Auth if the
        // atomic profile/lookup batch fails, and report any incomplete recovery.
        if (changed) {
          try { await auth.updateUser(uid, { email: user.email, emailVerified: user.emailVerified }) } catch {
            throw new HttpError(503, 'The login email changed, but profile synchronization failed. Save the same email again to finish the change.')
          }
        }
        throw new HttpError(503, changed
          ? 'The profile could not be saved. The login email was restored. Try again.'
          : 'The profile could not be synchronized. Save the same email again to finish the change.')
      }
      return res.status(200).json({ email: nextEmail })
    } finally {
      await db.runTransaction(async (transaction) => {
        const current = await transaction.get(lock)
        if (current.data()?.operationId === operationId) transaction.delete(lock)
      }).catch(() => console.error('Email change lock cleanup failed; lease will expire.'))
    }
  } catch (error) {
    if (error instanceof HttpError) return res.status(error.status).json({ error: error.message })
    const code = (error as { code?: string }).code
    if (code === 'auth/email-already-exists') return res.status(409).json({ error: 'That email address is already used by another account.' })
    if (code === 'auth/invalid-email') return res.status(400).json({ error: 'Enter a valid email address.' })
    if (code === 'auth/user-not-found') return res.status(404).json({ error: 'The Firebase user no longer exists.' })
    console.error('Admin email change failed:', code || 'server-error')
    return res.status(500).json({ error: 'Unable to change the email. Check the server configuration and try again.' })
  }
}
