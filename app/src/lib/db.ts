import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
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
import { db } from './firebase'

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

export async function seedUserTransactions(userId: string, firstName: string) {
  const batch = writeBatch(db)
  const txRef = collection(db, 'transactions_nbb')
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

  seedNotifications.forEach((n) => {
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
  const q = query(collection(db, 'profiles_nbb'), where('account_number', '==', accountNumber))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
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
  const code = Math.floor(10000000 + Math.random() * 90000000).toString()
  await setDoc(doc(db, 'otps', email.toLowerCase()), {
    code,
    created_at: serverTimestamp(),
  })
  console.log(`[Firebase OTP] Code for ${email}: ${code}`)
  return true
}

export async function verifyOTP(email: string, otpCode: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'otps', email.toLowerCase()))
  if (!snap.exists()) return false
  const data = snap.data()
  const createdAt = data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date(0)
  const isExpired = Date.now() - createdAt.getTime() > 10 * 60 * 1000 // 10 minutes
  if (isExpired) return false
  return data.code === otpCode
}

export async function getEmailByAccountNumber(accountNumber: string): Promise<string | null> {
  const user = await getUserByAccountNumber(accountNumber)
  return user ? String(user.email || '') : null
}

export function isSupabaseConfigured(): boolean {
  return true
}
