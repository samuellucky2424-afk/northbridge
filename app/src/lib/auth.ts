import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'
export { getCurrency } from './currency'

export const ADMIN_EMAIL = 'okohwiz889@mail.com'
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_PROFILE_IMAGE_DATA_URL_CHARS = 650 * 1024
const PROFILE_IMAGE_DIMENSION = 320
const PROFILE_IMAGE_MIN_DIMENSION = 160
const PROFILE_IMAGE_QUALITY = 0.78
const ACCEPTED_PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export type UserRole = 'customer' | 'admin' | null

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  phone: string
  houseAddress: string
  city: string
  country: string
  postcode: string
  dateOfBirth: string
  ssn: string
  occupation: string
  incomeSource: string
  accountNumber: string
  balance: number
  savingsBalance: number
  profilePictureUrl: string
  role: UserRole
  status: 'active' | 'suspended'
  createdAt?: Date
}

export interface ProfileUpdateInput {
  firstName: string
  lastName: string
  phone: string
  houseAddress: string
  city: string
  postcode: string
}

export interface SignupProfileInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  houseAddress: string
  city: string
  country: string
  postcode: string
  dateOfBirth: string
  ssn: string
  occupation: string
  incomeSource: string
}

export function fullName(firstName: string, lastName: string, email = '') {
  return [firstName, lastName].filter(Boolean).join(' ') || email
}

export function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function generateAccountNumber(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

export async function generateUniqueAccountNumber(): Promise<string> {
  return generateAccountNumber()
}

export function mapProfileFromDoc(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: String(data.email || ''),
    firstName: String(data.first_name || data.firstName || ''),
    lastName: String(data.last_name || data.lastName || ''),
    phone: String(data.phone || ''),
    houseAddress: String(data.house_address || data.houseAddress || ''),
    city: String(data.city || ''),
    country: String(data.country || 'United Kingdom'),
    postcode: String(data.postcode || ''),
    dateOfBirth: String(data.date_of_birth || data.dateOfBirth || ''),
    ssn: String(data.ssn || ''),
    occupation: String(data.occupation || ''),
    incomeSource: String(data.income_source || data.incomeSource || ''),
    accountNumber: String(data.account_number || data.accountNumber || ''),
    balance: toNumber(data.balance),
    savingsBalance: toNumber(data.savings_balance || data.savingsBalance),
    profilePictureUrl: String(data.profile_picture_url || data.profilePictureUrl || ''),
    role: (data.role as UserRole) || 'customer',
    status: data.status === 'suspended' ? 'suspended' : 'active',
    createdAt: data.created_at instanceof Timestamp ? data.created_at.toDate() : undefined,
  }
}

export function mapProfileToDoc(profile: Partial<UserProfile>): Record<string, unknown> {
  return {
    first_name: profile.firstName || '',
    last_name: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    house_address: profile.houseAddress || '',
    city: profile.city || '',
    country: profile.country || 'United Kingdom',
    postcode: profile.postcode || '',
    date_of_birth: profile.dateOfBirth || '',
    ssn: profile.ssn || '',
    occupation: profile.occupation || '',
    income_source: profile.incomeSource || '',
    account_number: profile.accountNumber || '',
    balance: profile.balance ?? 0,
    savings_balance: profile.savingsBalance ?? 0,
    profile_picture_url: profile.profilePictureUrl || '',
    role: profile.role || 'customer',
    status: profile.status || 'active',
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'profiles_nbb', uid))
  if (!snap.exists()) return null
  return mapProfileFromDoc(uid, snap.data())
}

export async function createUserProfile(
  uid: string,
  input: SignupProfileInput & { accountNumber?: string; role?: UserRole; balance?: number; savingsBalance?: number }
): Promise<UserProfile> {
  const accountNumber = input.accountNumber || (await generateUniqueAccountNumber())
  const profile: UserProfile = {
    uid,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    houseAddress: input.houseAddress,
    city: input.city,
    country: input.country || 'United Kingdom',
    postcode: input.postcode,
    dateOfBirth: input.dateOfBirth,
    ssn: input.ssn,
    occupation: input.occupation,
    incomeSource: input.incomeSource,
    accountNumber,
    balance: input.balance ?? 0,
    savingsBalance: input.savingsBalance ?? 0,
    profilePictureUrl: '',
    role: input.role || 'customer',
    status: 'active',
  }
  await setDoc(doc(db, 'profiles_nbb', uid), {
    ...mapProfileToDoc(profile),
    created_at: serverTimestamp(),
  })
  return profile
}

export async function ensureAdminRole(uid: string, email: string): Promise<UserRole> {
  const ref = doc(db, 'profiles_nbb', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await createUserProfile(uid, {
      firstName: 'Admin',
      lastName: 'User',
      email,
      phone: '',
      houseAddress: '',
      city: '',
      country: 'United Kingdom',
      postcode: '',
      dateOfBirth: '',
      ssn: '',
      occupation: '',
      incomeSource: '',
      role: 'admin',
    })
    return 'admin'
  }
  return (snap.data().role as UserRole) || null
}

export async function signUp(email: string, password: string, profile: SignupProfileInput) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: fullName(profile.firstName, profile.lastName, email) })
  const userProfile = await createUserProfile(cred.user.uid, { ...profile, role: 'customer' })
  return { user: cred.user, profile: userProfile }
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function signOut() {
  return firebaseSignOut(auth)
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email)
}

function validateProfileImageFile(file: File) {
  if (!ACCEPTED_PROFILE_IMAGE_TYPES.has(file.type)) {
    throw new Error('Choose a JPG, PNG, WebP, or GIF image.')
  }
  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    throw new Error('Profile picture must be 5 MB or smaller.')
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to read that image. Please choose another file.'))
    }
    image.src = objectUrl
  })
}

function renderProfileImageDataUrl(image: HTMLImageElement, dimension: number, quality: number): string {
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Unable to read that image. Please choose another file.')
  }

  const sourceSize = Math.min(sourceWidth, sourceHeight)
  const sourceX = Math.max(0, (sourceWidth - sourceSize) / 2)
  const sourceY = Math.max(0, (sourceHeight - sourceSize) / 2)
  const canvas = document.createElement('canvas')
  canvas.width = dimension
  canvas.height = dimension
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to process that image in this browser.')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, dimension, dimension)
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, dimension, dimension)

  return canvas.toDataURL('image/jpeg', quality)
}

async function fileToProfileImageDataUrl(file: File): Promise<string> {
  validateProfileImageFile(file)

  const image = await loadImageFromFile(file)
  let dimension = PROFILE_IMAGE_DIMENSION
  let quality = PROFILE_IMAGE_QUALITY
  let dataUrl = renderProfileImageDataUrl(image, dimension, quality)

  while (dataUrl.length > MAX_PROFILE_IMAGE_DATA_URL_CHARS && (dimension > PROFILE_IMAGE_MIN_DIMENSION || quality > 0.55)) {
    if (quality > 0.55) {
      quality = Math.max(0.55, quality - 0.08)
    } else {
      dimension = Math.max(PROFILE_IMAGE_MIN_DIMENSION, Math.round(dimension * 0.75))
      quality = PROFILE_IMAGE_QUALITY
    }
    dataUrl = renderProfileImageDataUrl(image, dimension, quality)
  }

  if (dataUrl.length > MAX_PROFILE_IMAGE_DATA_URL_CHARS) {
    throw new Error('Profile picture is too large to save. Please choose a smaller image.')
  }

  return dataUrl
}

export async function updateUserProfile(
  uid: string,
  updates: ProfileUpdateInput,
  avatarFile?: File | null
): Promise<{ success: boolean; error?: string; profilePictureUrl?: string }> {
  try {
    let profilePictureUrl = ''
    const current = await getUserProfile(uid)
    if (current) profilePictureUrl = current.profilePictureUrl

    if (avatarFile) {
      profilePictureUrl = await fileToProfileImageDataUrl(avatarFile)
    }

    const updatePayload: Record<string, unknown> = {
      first_name: updates.firstName.trim(),
      last_name: updates.lastName.trim(),
      phone: updates.phone.trim(),
      house_address: updates.houseAddress.trim(),
      city: updates.city.trim(),
      postcode: updates.postcode.trim(),
    }
    if (profilePictureUrl) {
      updatePayload.profile_picture_url = profilePictureUrl
    }

    await updateDoc(doc(db, 'profiles_nbb', uid), updatePayload)
    return { success: true, profilePictureUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to save profile changes.'
    return { success: false, error: message }
  }
}

export async function refreshUserProfile(uid: string): Promise<UserProfile | null> {
  return getUserProfile(uid)
}

export { onAuthStateChanged, auth, db }
export type { FirebaseUser }
