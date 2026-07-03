import { Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, type User as FirebaseUser } from 'firebase/auth'
import {
  auth,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  ensureAdminRole,
  getUserProfile,
  updateUserProfile,
  getCurrency,
  fullName,
  toNumber,
  resetPassword as firebaseResetPassword,
  type UserRole,
  type UserProfile,
  type SignupProfileInput,
  type ProfileUpdateInput,
  ADMIN_EMAIL,
} from './lib/auth'
import { seedUserTransactions } from './lib/db'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AboutPage from './pages/AboutPage'
import CareersPage from './pages/CareersPage'
import PressPage from './pages/PressPage'
import SustainabilityPage from './pages/SustainabilityPage'
import AccessibilityPage from './pages/AccessibilityPage'
import SecurityPage from './pages/SecurityPage'
import ContactPage from './pages/ContactPage'
import MortgagesPage from './pages/MortgagesPage'
import WealthPage from './pages/WealthPage'
import BusinessPage from './pages/BusinessPage'
import SavingsPage from './pages/SavingsPage'
import CurrentAccountPage from './pages/CurrentAccountPage'

interface ProfileDetails {
  firstName: string
  lastName: string
  phone: string
  houseAddress: string
  city: string
  postcode: string
  country: string
}

const defaultProfileDetails: ProfileDetails = {
  firstName: '',
  lastName: '',
  phone: '',
  houseAddress: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
}

interface AuthContextType {
  isAuthenticated: boolean
  userRole: UserRole
  userName: string
  profilePictureUrl: string
  profileDetails: ProfileDetails
  userCountry: string
  userEmail: string
  userId: string
  userStatus: 'active' | 'suspended'
  accountNumber: string
  userBalance: number
  savingsBalance: number
  currency: { symbol: string; code: string }
  login: (identifier: string, password: string, signupProfile?: SignupProfileInput, isAdminPortal?: boolean) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  checkSuspension: () => boolean
  refreshProfile: () => Promise<void>
  saveProfile: (updates: ProfileUpdateInput, avatarFile?: File | null) => Promise<{ success: boolean; error?: string; profilePictureUrl?: string }>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  userName: '',
  profilePictureUrl: '',
  profileDetails: defaultProfileDetails,
  userCountry: 'United Kingdom',
  userEmail: '',
  userId: '',
  userStatus: 'active',
  accountNumber: '',
  userBalance: 0,
  savingsBalance: 0,
  currency: { symbol: '\u00A3', code: 'GBP' },
  login: async () => ({ success: false }),
  logout: async () => {},
  resetPassword: async () => ({ success: false }),
  checkSuspension: () => false,
  refreshProfile: async () => {},
  saveProfile: async () => ({ success: false }),
})

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

function getFirebaseAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code
  const message = (err as { message?: string })?.message || ''

  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase. Please enable it in the Firebase console.'
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Please check your Firebase configuration.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.'
    default:
      // Fall back to Firebase's message, cleaned up
      return message || 'An error occurred. Please try again.'
  }
}

function SuspensionWarningModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1628]/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-red-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="h-2 bg-[#D31111] w-full" />
        <div className="p-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-[#D31111]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-2xl font-bold text-[#0A1628] tracking-tight">Account Status Restricted</h3>
            <div className="text-left bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
              <p className="text-sm text-[#475569] leading-relaxed">
                We regret to inform you that your account access and transaction privileges have been temporarily suspended.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed font-semibold">
                To secure your funds and lift this restriction, you are required to contact our Customer Care Support immediately.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-full py-2.5 bg-slate-100 text-[#64748B] rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors">
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showSuspensionModal, setShowSuspensionModal] = useState(false)

  const applyProfile = useCallback((p: UserProfile | null) => {
    setProfile(p)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        const p = await getUserProfile(user.uid)
        applyProfile(p)
      } else {
        applyProfile(null)
      }
    })
    return unsubscribe
  }, [applyProfile])

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      const p = await getUserProfile(firebaseUser.uid)
      applyProfile(p)
    }
  }, [firebaseUser, applyProfile])

  const clearAuthState = useCallback(() => {
    setFirebaseUser(null)
    setProfile(null)
  }, [])

  const login = useCallback(async (identifier: string, password: string, signupProfile?: SignupProfileInput, isAdminPortal = false) => {
    const trimmedIdentifier = identifier.trim()
    const normalizedIdentifier = trimmedIdentifier.toLowerCase()

    try {
      // Admin login path (only accessible from the admin portal)
      if (isAdminPortal && normalizedIdentifier === ADMIN_EMAIL.toLowerCase()) {
        let user: FirebaseUser
        try {
          user = await firebaseSignIn(trimmedIdentifier, password)
        } catch (err) {
          const code = (err as { code?: string })?.code
          // Newer Firebase projects return auth/invalid-credential for missing users (email enumeration protection)
          if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
            try {
              const cred = await createUserWithEmailAndPassword(auth, trimmedIdentifier, password)
              user = cred.user
            } catch (createErr) {
              if ((createErr as { code?: string })?.code === 'auth/email-already-in-use') {
                return { success: false, error: 'Invalid email or password. Please try again.' }
              }
              throw createErr
            }
          } else {
            throw err
          }
        }
        const role = await ensureAdminRole(user.uid, trimmedIdentifier)
        if (role !== 'admin') {
          return { success: false, error: 'Unauthorized: Admin access only' }
        }
        const p = await getUserProfile(user.uid)
        applyProfile(p)
        return { success: true, role: 'admin' as UserRole }
      }

      // Prevent admin email from signing in through the customer portal
      if (normalizedIdentifier === ADMIN_EMAIL.toLowerCase()) {
        return { success: false, error: 'Please use the admin portal to sign in as an administrator.' }
      }

      // Registration path
      if (signupProfile) {
        const { profile: newProfile } = await firebaseSignUp(signupProfile.email, password, signupProfile)
        await seedUserTransactions(newProfile.uid, newProfile.firstName)
        applyProfile(newProfile)
        return { success: true, role: 'customer' as UserRole }
      }

      // Customer login path
      const email = trimmedIdentifier.includes('@') ? trimmedIdentifier.toLowerCase() : `${trimmedIdentifier.toLowerCase()}@placeholder.nbb`
      const user = await firebaseSignIn(email, password)
      const p = await getUserProfile(user.uid)
      if (!p) {
        return { success: false, error: 'User profile not found. Please contact support.' }
      }
      if (p.role !== 'customer' && p.role !== 'admin') {
        return { success: false, error: 'Unauthorized account role.' }
      }
      applyProfile(p)
      return { success: true, role: p.role }
    } catch (err) {
      const message = getFirebaseAuthErrorMessage(err)
      return { success: false, error: message }
    }
  }, [applyProfile])

  const logout = useCallback(async () => {
    await firebaseSignOut(auth)
    clearAuthState()
  }, [clearAuthState])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await firebaseResetPassword(email.trim().toLowerCase())
      return { success: true }
    } catch (err) {
      const message = getFirebaseAuthErrorMessage(err)
      return { success: false, error: message }
    }
  }, [])

  const saveProfile = useCallback(async (updates: ProfileUpdateInput, avatarFile?: File | null) => {
    if (!firebaseUser) {
      return { success: false, error: 'Your session has expired. Please sign in again.' }
    }
    const result = await updateUserProfile(firebaseUser.uid, updates, avatarFile)
    if (result.success) {
      await refreshProfile()
    }
    return result
  }, [firebaseUser, refreshProfile])

  const checkSuspension = useCallback(() => {
    if (profile?.status === 'suspended') {
      setShowSuspensionModal(true)
      return true
    }
    return false
  }, [profile])

  const contextValue: AuthContextType = {
    isAuthenticated: !!firebaseUser && !!profile,
    userRole: profile?.role || null,
    userName: profile ? fullName(profile.firstName, profile.lastName, profile.email) : '',
    profilePictureUrl: profile?.profilePictureUrl || '',
    profileDetails: profile
      ? {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || '',
          houseAddress: profile.houseAddress || '',
          city: profile.city || '',
          postcode: profile.postcode || '',
          country: profile.country || 'United Kingdom',
        }
      : defaultProfileDetails,
    userCountry: profile?.country || 'United Kingdom',
    userEmail: profile?.email || firebaseUser?.email || '',
    userId: firebaseUser?.uid || '',
    userStatus: profile?.status || 'active',
    accountNumber: profile?.accountNumber || '',
    userBalance: toNumber(profile?.balance),
    savingsBalance: toNumber(profile?.savingsBalance),
    currency: getCurrency(profile?.country || 'United Kingdom'),
    login,
    logout,
    resetPassword,
    checkSuspension,
    refreshProfile,
    saveProfile,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <SuspensionWarningModal isOpen={showSuspensionModal} onClose={() => setShowSuspensionModal(false)} />
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: UserRole }) {
  const { isAuthenticated, userRole } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} replace />
  }
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />
  }
  return <>{children}</>
}

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/*" element={<ProtectedRoute requiredRole="customer"><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/sustainability" element={<SustainabilityPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/mortgages" element={<MortgagesPage />} />
        <Route path="/wealth" element={<WealthPage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/current-account" element={<CurrentAccountPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
