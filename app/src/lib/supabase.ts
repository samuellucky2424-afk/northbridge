// Compatibility shim that exposes a Supabase-like API backed by Firebase/Firestore.
// This allows the existing UI components to keep working while data is stored in Firebase.
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  documentId,
  type QueryConstraint,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from './firebase'
import { generateUniqueAccountNumber } from './auth'
import {
  generateAndSendOTP as firebaseGenerateOTP,
  verifyOTP as firebaseVerifyOTP,
  getEmailByAccountNumber as firebaseGetEmailByAccountNumber,
} from './db'

export function isSupabaseConfigured(): boolean {
  return true
}

export { generateUniqueAccountNumber }
export { firebaseGenerateOTP as generateAndSendOTP }
export { firebaseVerifyOTP as verifyOTP }
export { firebaseGetEmailByAccountNumber as getEmailByAccountNumber }

interface SupabaseResponse {
  data: any
  error: any
}

// ─── Storage shim ───
const storageApi = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  from: (_bucket: string) => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    upload: async (filePath: string, file: File, _options?: { contentType?: string; upsert?: boolean }) => {
      const storageRef = ref(storage, filePath)
      await uploadBytes(storageRef, file, { contentType: _options?.contentType || file.type })
      return { data: { path: filePath }, error: null }
    },
    getPublicUrl: (filePath: string) => {
      const storageRef = ref(storage, filePath)
      return { data: { publicUrl: getDownloadURL(storageRef) } }
    },
  }),
}

// ─── Auth shim ───
const authApi = {
  signUp: async ({ email, password }: { email: string; password: string; options?: { data?: Record<string, string> } }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      return { data: { user: cred.user }, error: null }
    } catch (err) {
      return { data: { user: null }, error: err }
    }
  },
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return { data: { user: cred.user, session: { user: cred.user } }, error: null }
    } catch (err) {
      return { data: { user: null, session: null }, error: err }
    }
  },
  signOut: async () => {
    await firebaseSignOut(auth)
    return { error: null }
  },
  getUser: async () => {
    const user = auth.currentUser
    return { data: { user }, error: null }
  },
  getSession: async () => {
    const user = auth.currentUser
    return { data: { session: user ? { user } : null }, error: null }
  },
  onAuthStateChange: (callback: (event: string, session: { user: FirebaseUser | null }) => void) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback('AUTH_STATE_CHANGE', { user })
    })
    return { data: { subscription: { unsubscribe } } }
  },
  verifyOtp: async ({ email, token }: { email: string; token: string }) => {
    const ok = await firebaseVerifyOTP(email, token)
    return { data: { session: ok ? { user: auth.currentUser } : null }, error: ok ? null : new Error('Invalid OTP') }
  },
}

// ─── Query builder shim ───
class QueryBuilder {
  private table: string
  private selectColumns = '*'
  private constraints: QueryConstraint[] = []
  private orderField?: string
  private orderDirection: 'asc' | 'desc' = 'desc'
  private limitCount?: number

  constructor(table: string) {
    this.table = table
  }

  select(columns: string) {
    this.selectColumns = columns
    return this
  }

  eq(field: string, value: unknown) {
    const searchField = field === 'id' ? documentId() : field
    this.constraints.push(where(searchField, '==', value))
    return this
  }

  gte(field: string, value: unknown) {
    this.constraints.push(where(field, '>=', value))
    return this
  }

  lte(field: string, value: unknown) {
    this.constraints.push(where(field, '<=', value))
    return this
  }

  order(field: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.orderField = field
    this.orderDirection = ascending ? 'asc' : 'desc'
    return this
  }

  limit(n: number) {
    this.limitCount = n
    return this
  }

  insert(rows: Record<string, unknown>[]) {
    return {
      then: async (resolve: (value: SupabaseResponse) => void) => {
        try {
          const ids: string[] = []
          for (const row of rows) {
            const ref = await addDoc(collection(db, this.table), {
              ...row,
              created_at: serverTimestamp(),
              date: row.date || serverTimestamp(),
            })
            ids.push(ref.id)
          }
          resolve({ data: ids, error: null })
        } catch (err) {
          resolve({ data: null, error: err })
        }
      },
    }
  }

  update(payload: Record<string, unknown>) {
    return {
      eq: (field: string, value: unknown) => ({
        then: async (resolve: (value: SupabaseResponse) => void) => {
          try {
            const searchField = field === 'id' ? documentId() : field
            const q = query(collection(db, this.table), where(searchField, '==', value))
            const snap = await getDocs(q)
            const batch = writeBatch(db)
            snap.docs.forEach((d) => batch.update(d.ref, { ...payload, updated_at: serverTimestamp() }))
            await batch.commit()
            resolve({ data: null, error: null })
          } catch (err) {
            resolve({ data: null, error: err })
          }
        },
      }),
    }
  }

  delete() {
    return {
      eq: (field: string, value: unknown) => ({
        then: async (resolve: (value: SupabaseResponse) => void) => {
          try {
            const searchField = field === 'id' ? documentId() : field
            const q = query(collection(db, this.table), where(searchField, '==', value))
            const snap = await getDocs(q)
            const batch = writeBatch(db)
            snap.docs.forEach((d) => batch.delete(d.ref))
            await batch.commit()
            resolve({ data: null, error: null })
          } catch (err) {
            resolve({ data: null, error: err })
          }
        },
      }),
    }
  }

  single() {
    return {
      then: async (resolve: (value: SupabaseResponse) => void) => {
        try {
          const results = await this.execute()
          if (results.length === 0) {
            resolve({ data: null, error: { message: 'No rows found' } })
          } else {
            resolve({ data: results[0], error: null })
          }
        } catch (err) {
          resolve({ data: null, error: err })
        }
      },
    }
  }

  maybeSingle() {
    return {
      then: async (resolve: (value: SupabaseResponse) => void) => {
        try {
          const results = await this.execute()
          resolve({ data: results[0] || null, error: null })
        } catch (err) {
          resolve({ data: null, error: err })
        }
      },
    }
  }

  then(resolve: (value: SupabaseResponse) => void) {
    this.execute()
      .then((results) => resolve({ data: results, error: null }))
      .catch((err) => resolve({ data: null, error: err }))
    return this
  }

  private async execute(): Promise<any[]> {
    // Build the Firestore query. We avoid combining `where` with `orderBy` on a
    // different field because that requires a composite index. Instead we filter
    // in Firestore and sort/limit client-side.
    const hasConstraints = this.constraints.length > 0
    const canOrderInFirestore = !hasConstraints && !!this.orderField

    let q = query(collection(db, this.table), ...this.constraints)
    if (canOrderInFirestore && this.orderField) {
      q = query(q, orderBy(this.orderField, this.orderDirection))
    }
    if (canOrderInFirestore && this.limitCount) {
      q = query(q, limit(this.limitCount))
    }

    const snap = await getDocs(q)
    let results: any[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Client-side ordering and limit to avoid Firestore composite index requirements
    if (hasConstraints && this.orderField) {
      results.sort((a: any, b: any) => {
        const aVal = a[this.orderField!]
        const bVal = b[this.orderField!]
        const aTime = aVal?.toDate ? aVal.toDate().getTime() : new Date(aVal || 0).getTime()
        const bTime = bVal?.toDate ? bVal.toDate().getTime() : new Date(bVal || 0).getTime()
        return this.orderDirection === 'asc' ? aTime - bTime : bTime - aTime
      })
    }
    if (this.limitCount) {
      results = results.slice(0, this.limitCount)
    }

    if (this.selectColumns !== '*') {
      results = results.map((row: any) => this.project(row))
    }

    // Handle simple join syntax: profiles_nbb(first_name, last_name, country)
    if (this.selectColumns.includes('profiles_nbb(')) {
      results = await this.joinProfiles(results)
    }

    return results
  }

  private project(row: Record<string, unknown>): Record<string, unknown> {
    const cols = this.selectColumns.split(',').map((c) => c.trim())
    const projected: Record<string, unknown> = { id: row.id }
    for (const col of cols) {
      if (col.includes('(')) continue
      projected[col] = row[col]
    }
    return projected
  }

  private async joinProfiles(rows: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
    const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))]
    const profiles: Record<string, Record<string, unknown>> = {}
    for (const uid of userIds) {
      const snap = await getDoc(doc(db, 'profiles_nbb', String(uid)))
      if (snap.exists()) {
        profiles[String(uid)] = snap.data()
      }
    }
    return rows.map((row) => ({
      ...row,
      profiles_nbb: profiles[String(row.user_id)] || null,
    }))
  }
}

const fromApi = (table: string) => new QueryBuilder(table)

export const supabase = {
  auth: authApi,
  from: fromApi,
  storage: storageApi,
}
