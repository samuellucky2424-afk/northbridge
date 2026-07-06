import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { getCurrency } from './currency'

export interface FirestoreTransaction {
  id: string
  user_id: string
  description: string
  category: string
  amount: number
  status: 'Completed' | 'Pending' | 'Flagged' | 'Reversed'
  date: Date
  created_at?: Date
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  time: Date
  read: boolean
  type: 'success' | 'info' | 'warning'
}

function toDate(value: Timestamp | Date | undefined): Date {
  if (!value) return new Date()
  return value instanceof Date ? value : value.toDate()
}

function mapTransactionFromDoc(id: string, data: Record<string, unknown>): FirestoreTransaction {
  return {
    id,
    user_id: String(data.user_id || ''),
    description: String(data.description || data.desc || ''),
    category: String(data.category || data.cat || 'Transfers'),
    amount: Number(data.amount || 0),
    status: (data.status as FirestoreTransaction['status']) || 'Completed',
    date: toDate((data.date || data.created_at) as Timestamp),
    created_at: toDate((data.created_at || data.date) as Timestamp),
  }
}

const TRANSFER_OTP_STORAGE_KEY = 'nbb-transfer-otp'
const TRANSFER_OTP_TTL_MS = 10 * 60 * 1000
let inMemoryTransferOTP: StoredTransferOTP | null = null

interface StoredTransferOTP {
  uid: string
  email: string
  code: string
  createdAt: number
}

function saveTransferOTP(otp: StoredTransferOTP) {
  inMemoryTransferOTP = otp
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(TRANSFER_OTP_STORAGE_KEY, JSON.stringify(otp))
  } catch {
    // The in-memory copy still covers the active verification flow.
  }
}

function readTransferOTP(): StoredTransferOTP | null {
  if (typeof window === 'undefined') return inMemoryTransferOTP
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(TRANSFER_OTP_STORAGE_KEY)
  } catch {
    raw = null
  }
  if (!raw && inMemoryTransferOTP) return inMemoryTransferOTP
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredTransferOTP
    if (!parsed.uid || !parsed.email || !/^\d{8}$/.test(parsed.code) || !Number.isFinite(parsed.createdAt)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function clearTransferOTP() {
  inMemoryTransferOTP = null
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(TRANSFER_OTP_STORAGE_KEY)
  } catch {
    // Nothing else to clean up when browser storage is blocked.
  }
}

export async function seedUserTransactions(userId: string, firstName: string, country = 'United Kingdom') {
  const batch = writeBatch(db)
  const txRef = collection(db, 'transactions_nbb')
  const currencySymbol = getCurrency(country).symbol
  const seedTx = [
    { user_id: userId, description: 'Welcome Bonus', category: 'Income', amount: 2500, status: 'Completed', date: new Date() },
    { user_id: userId, description: 'Tesco Superstore', category: 'Groceries', amount: -47.32, status: 'Completed', date: new Date(Date.now() - 86_400_000) },
    { user_id: userId, description: `Salary — North Bridge Bank Ltd`, category: 'Income', amount: 3250, status: 'Completed', date: new Date(Date.now() - 2 * 86_400_000) },
    { user_id: userId, description: 'Netflix', category: 'Entertainment', amount: -10.99, status: 'Completed', date: new Date(Date.now() - 3 * 86_400_000) },
    { user_id: userId, description: 'Uber', category: 'Transport', amount: -12.4, status: 'Completed', date: new Date(Date.now() - 4 * 86_400_000) },
    { user_id: userId, description: 'Pizza Express', category: 'Dining', amount: -34.5, status: 'Completed', date: new Date(Date.now() - 5 * 86_400_000) },
  ]

  seedTx.forEach((tx) => {
    const ref = doc(txRef)
    batch.set(ref, { ...tx, date: serverTimestamp(), created_at: serverTimestamp() })
  })

  const notificationsRef = collection(db, 'notifications')
  const seedNotifications = [
    { user_id: userId, title: 'Welcome Bonus', message: '£2,500.00 welcome bonus credited to your account', time: new Date(), read: false, type: 'success' },
    { user_id: userId, title: 'Card Payment', message: '£47.32 spent at Tesco Superstore', time: new Date(Date.now() - 900_000), read: false, type: 'info' },
    { user_id: userId, title: 'Security Alert', message: 'New login detected from London, UK', time: new Date(Date.now() - 3_600_000), read: false, type: 'warning' },
    { user_id: userId, title: 'Welcome', message: `Welcome to North Bridge Bank, ${firstName}`, time: new Date(), read: true, type: 'info' },
  ]
  const localizedSeedNotifications = seedNotifications.map((n) => ({
    ...n,
    message: n.message.replace(/\u00C2?\u00A3/g, currencySymbol),
  }))

  localizedSeedNotifications.forEach((n) => {
    const ref = doc(notificationsRef)
    batch.set(ref, { ...n, time: serverTimestamp() })
  })

  await batch.commit()
}

export async function getTransactions(userId?: string, limitCount?: number): Promise<FirestoreTransaction[]> {
  let q = query(collection(db, 'transactions_nbb'), orderBy('date', 'desc'))
  if (userId) {
    q = query(q, where('user_id', '==', userId))
  }
  if (limitCount) {
    q = query(q, limit(limitCount))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => mapTransactionFromDoc(d.id, d.data()))
}

export async function getTransactionById(id: string): Promise<FirestoreTransaction | null> {
  const snap = await getDoc(doc(db, 'transactions_nbb', id))
  if (!snap.exists()) return null
  return mapTransactionFromDoc(snap.id, snap.data())
}

export async function createTransaction(payload: Omit<FirestoreTransaction, 'id' | 'date' | 'created_at'>): Promise<string> {
  const ref = await addDoc(collection(db, 'transactions_nbb'), {
    ...payload,
    date: serverTimestamp(),
    created_at: serverTimestamp(),
  })
  return ref.id
}

export async function updateTransaction(id: string, updates: Partial<FirestoreTransaction>) {
  const payload: Record<string, unknown> = {}
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.category !== undefined) payload.category = updates.category
  if (updates.amount !== undefined) payload.amount = updates.amount
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.date !== undefined) payload.date = Timestamp.fromDate(updates.date)
  await updateDoc(doc(db, 'transactions_nbb', id), payload)
}

export async function deleteTransaction(id: string) {
  await deleteDoc(doc(db, 'transactions_nbb', id))
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(collection(db, 'notifications'), where('user_id', '==', userId), orderBy('time', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      user_id: String(data.user_id || ''),
      title: String(data.title || ''),
      message: String(data.message || ''),
      time: toDate((data.time || data.created_at) as Timestamp),
      read: Boolean(data.read),
      type: (data.type as Notification['type']) || 'info',
    }
  })
}

export async function markNotificationRead(notificationId: string) {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true })
}

export async function addNotification(payload: Omit<Notification, 'id' | 'time'>) {
  await addDoc(collection(db, 'notifications'), {
    ...payload,
    time: serverTimestamp(),
  })
}

export async function getUsers(): Promise<Record<string, unknown>[]> {
  const snap = await getDocs(collection(db, 'profiles_nbb'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getUserByAccountNumber(accountNumber: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, 'account_lookup', accountNumber))
  if (!snap.exists()) return null
  const data = snap.data()
  // Fetch the full profile
  const profileSnap = await getDoc(doc(db, 'profiles_nbb', data.uid))
  if (!profileSnap.exists()) return null
  return { id: profileSnap.id, ...profileSnap.data() }
}

export async function createAccountLookup(accountNumber: string, uid: string, email: string) {
  await setDoc(doc(db, 'account_lookup', accountNumber), { uid, email, created_at: serverTimestamp() })
}

export async function updateUserField(uid: string, field: string, value: unknown) {
  await updateDoc(doc(db, 'profiles_nbb', uid), { [field]: value })
}

export async function updateUserBalance(uid: string, balance?: number, savingsBalance?: number) {
  const payload: Record<string, unknown> = {}
  if (balance !== undefined) payload.balance = balance
  if (savingsBalance !== undefined) payload.savings_balance = savingsBalance
  await updateDoc(doc(db, 'profiles_nbb', uid), payload)
}

export async function deleteUserProfile(uid: string) {
  await deleteDoc(doc(db, 'profiles_nbb', uid))
}

export async function generateAndSendOTP(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase()
  const currentUser = auth.currentUser
  const currentEmail = currentUser?.email?.trim().toLowerCase() || ''

  if (!currentUser || !currentEmail) {
    throw new Error('Your session expired. Please sign in again.')
  }
  if (currentEmail !== normalizedEmail) {
    throw new Error('Your registered email address could not be verified. Please sign in again.')
  }

  const code = Math.floor(10000000 + Math.random() * 90000000).toString()
  const idToken = await currentUser.getIdToken()

  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: normalizedEmail, code }),
  })

  const responseText = await response.text()
  let body: { ok?: boolean; error?: string } | null = null
  try {
    body = responseText ? JSON.parse(responseText) : null
  } catch {
    body = null
  }

  if (!response.ok || body?.ok !== true) {
    throw new Error(body?.error || 'Unable to send verification code. Please check the OTP email service configuration.')
  }

  saveTransferOTP({
    uid: currentUser.uid,
    email: normalizedEmail,
    code,
    createdAt: Date.now(),
  })

  return true
}

export async function verifyOTP(email: string, otpCode: string): Promise<boolean> {
  const currentUser = auth.currentUser
  const normalizedEmail = email.trim().toLowerCase()
  const currentEmail = currentUser?.email?.trim().toLowerCase() || ''

  if (!currentUser || !currentEmail || currentEmail !== normalizedEmail) return false

  const storedOtp = readTransferOTP()
  if (storedOtp) {
    const isExpired = Date.now() - storedOtp.createdAt > TRANSFER_OTP_TTL_MS
    const isValid =
      !isExpired &&
      storedOtp.uid === currentUser.uid &&
      storedOtp.email === normalizedEmail &&
      storedOtp.code === otpCode

    if (isValid || isExpired) {
      clearTransferOTP()
    }

    if (isValid) return true
  }

  const profileRef = doc(db, 'profiles_nbb', currentUser.uid)
  const snap = await getDoc(profileRef)
  if (!snap.exists()) return false
  const data = snap.data()
  const createdAt = data.transfer_otp_created_at instanceof Timestamp ? data.transfer_otp_created_at.toDate() : new Date(0)
  const isExpired = Date.now() - createdAt.getTime() > TRANSFER_OTP_TTL_MS
  if (isExpired) return false

  const isValid = String(data.transfer_otp_code || '') === otpCode
  if (isValid) {
    await updateDoc(profileRef, {
      transfer_otp_code: '',
      transfer_otp_verified_at: serverTimestamp(),
    }).catch(() => undefined)
  }

  return isValid
}

export async function getEmailByAccountNumber(accountNumber: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'account_lookup', accountNumber))
  if (!snap.exists()) return null
  return String(snap.data().email || '')
}

export function isSupabaseConfigured(): boolean {
  return true
}
