import { Routes, Route, Navigate } from 'react-router-dom'
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
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
import { supabase, isSupabaseConfigured, getEmailByAccountNumber } from './lib/supabase'

type UserRole = 'customer' | 'admin' | null

interface SignupProfileInput {
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

interface ProfileDetails {
  firstName: string
  lastName: string
  phone: string
  houseAddress: string
  city: string
  postcode: string
  country: string
}

interface ProfileUpdateInput {
  firstName: string
  lastName: string
  phone: string
  houseAddress: string
  city: string
  postcode: string
}

interface StoredLocalProfile extends SignupProfileInput {
  id: string
  password: string
  accountNumber: string
  profilePictureUrl: string
  role: 'customer'
  status: 'active' | 'suspended'
  balance: number
  savingsBalance: number
  createdAt: string
  updatedAt: string
}

const LOCAL_PROFILES_STORAGE_KEY = 'nbb-local-profiles'
const LOCAL_CURRENT_USER_STORAGE_KEY = 'nbb-current-user-id'
const PROFILE_IMAGE_BUCKET = 'profile-pictures'

const defaultProfileDetails: ProfileDetails = {
  firstName: '',
  lastName: '',
  phone: '',
  houseAddress: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
}

function fullName(firstName: string, lastName: string, email = '') {
  return [firstName, lastName].filter(Boolean).join(' ') || email
}

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function loadLocalProfiles(): StoredLocalProfile[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILES_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((profile): profile is StoredLocalProfile => {
      return typeof profile?.id === 'string' && typeof profile?.email === 'string'
    })
  } catch (err) {
    console.error('Failed to read local profiles:', err)
    return []
  }
}

function saveLocalProfiles(profiles: StoredLocalProfile[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_PROFILES_STORAGE_KEY, JSON.stringify(profiles))
}

function generateLocalAccountNumber(existingProfiles: StoredLocalProfile[]) {
  let accountNumber = ''

  do {
    accountNumber = Math.floor(10000000 + Math.random() * 90000000).toString()
  } while (existingProfiles.some((profile) => profile.accountNumber === accountNumber))

  return accountNumber
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error || new Error('Unable to read the selected image.'))
    reader.readAsDataURL(file)
  })
}

const countryToCurrency: Record<string, { symbol: string; code: string }> = {
  'United Kingdom': { symbol: '\u00A3', code: 'GBP' },
  'United States': { symbol: '$', code: 'USD' },
  'Canada': { symbol: 'C$', code: 'CAD' },
  'Germany': { symbol: '\u20AC', code: 'EUR' },
  'France': { symbol: '\u20AC', code: 'EUR' },
  'Spain': { symbol: '\u20AC', code: 'EUR' },
  'Netherlands': { symbol: '\u20AC', code: 'EUR' },
  'Italy': { symbol: '\u20AC', code: 'EUR' },
  'Ireland': { symbol: '\u20AC', code: 'EUR' },
  'Australia': { symbol: 'A$', code: 'AUD' },
  'Nigeria': { symbol: '\u20A6', code: 'NGN' },
  'India': { symbol: '\u20B9', code: 'INR' },
  'China': { symbol: '\u00A5', code: 'CNY' },
  'Japan': { symbol: '\u00A5', code: 'JPY' },
  'Brazil': { symbol: 'R$', code: 'BRL' },
  'South Africa': { symbol: 'R', code: 'ZAR' },
  'UAE': { symbol: '\u062F.\u0625', code: 'AED' },
  'Switzerland': { symbol: 'CHF', code: 'CHF' },
  'Sweden': { symbol: 'kr', code: 'SEK' },
  'Norway': { symbol: 'kr', code: 'NOK' },
}

function getCurrency(country: string) {
  return countryToCurrency[country] || { symbol: '\u00A3', code: 'GBP' }
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
  login: (identifier: string, password: string, signupProfile?: SignupProfileInput) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  logout: () => void
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
  userBalance: 0.00,
  savingsBalance: 0.00,
  currency: { symbol: '\u00A3', code: 'GBP' },
  login: async () => ({ success: false }),
  logout: () => {},
  checkSuspension: () => false,
  refreshProfile: async () => {},
  saveProfile: async () => ({ success: false }),
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userName, setUserName] = useState('')
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>(defaultProfileDetails)
  const [userCountry, setUserCountry] = useState('United Kingdom')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [userStatus, setUserStatus] = useState<'active' | 'suspended'>('active')
  const [accountNumber, setAccountNumber] = useState('')
  const [userBalance, setUserBalance] = useState(0.00)
  const [savingsBalance, setSavingsBalance] = useState(0.00)
  const [currency, setCurrency] = useState({ symbol: '\u00A3', code: 'GBP' })
  const [showSuspensionModal, setShowSuspensionModal] = useState(false)

  const clearAuthState = useCallback(() => {
    setIsAuthenticated(false)
    setUserRole(null)
    setUserName('')
    setProfilePictureUrl('')
    setProfileDetails(defaultProfileDetails)
    setUserCountry('United Kingdom')
    setUserEmail('')
    setUserId('')
    setUserStatus('active')
    setAccountNumber('')
    setUserBalance(0.00)
    setSavingsBalance(0.00)
    setCurrency({ symbol: '\u00A3', code: 'GBP' })

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_CURRENT_USER_STORAGE_KEY)
    }
  }, [])

  const applySupabaseProfile = useCallback((profile: any) => {
    const firstName = String(profile.first_name || '')
    const lastName = String(profile.last_name || '')
    const email = String(profile.email || '')
    const country = String(profile.country || 'United Kingdom')
    const role = (profile.role as UserRole) || 'customer'
    const status = profile.status === 'suspended' ? 'suspended' : 'active'

    setIsAuthenticated(true)
    setUserId(String(profile.id || ''))
    setUserEmail(email)
    setUserName(fullName(firstName, lastName, email))
    setUserRole(role)
    setUserStatus(status)
    setAccountNumber(String(profile.account_number || ''))
    setUserBalance(toNumber(profile.balance))
    setSavingsBalance(toNumber(profile.savings_balance))
    setUserCountry(country)
    setCurrency(getCurrency(country))
    setProfilePictureUrl(String(profile.profile_picture_url || ''))
    setProfileDetails({
      firstName,
      lastName,
      phone: String(profile.phone || ''),
      houseAddress: String(profile.house_address || ''),
      city: String(profile.city || ''),
      postcode: String(profile.postcode || ''),
      country,
    })
  }, [])

  const applyLocalProfile = useCallback((profile: StoredLocalProfile) => {
    const country = profile.country || 'United Kingdom'

    setIsAuthenticated(true)
    setUserId(profile.id)
    setUserEmail(profile.email)
    setUserName(fullName(profile.firstName, profile.lastName, profile.email))
    setUserRole(profile.role)
    setUserStatus(profile.status)
    setAccountNumber(profile.accountNumber)
    setUserBalance(toNumber(profile.balance))
    setSavingsBalance(toNumber(profile.savingsBalance))
    setUserCountry(country)
    setCurrency(getCurrency(country))
    setProfilePictureUrl(profile.profilePictureUrl || '')
    setProfileDetails({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      houseAddress: profile.houseAddress || '',
      city: profile.city || '',
      postcode: profile.postcode || '',
      country,
    })

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_CURRENT_USER_STORAGE_KEY, profile.id)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile, error } = await supabase
        .from('profiles_nbb')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('[NBB Supabase Debug] Error fetching profile:', error)
        return
      }

      if (profile) {
        console.log('[NBB Supabase Debug] Profile loaded successfully:', fullName(profile.first_name || '', profile.last_name || '', profile.email || ''))
        applySupabaseProfile(profile)
      } else {
        console.warn('[NBB Supabase Debug] Profile record not found for user ID:', user.id, '. Signing out.')
        await supabase.auth.signOut()
        clearAuthState()
      }
    } catch (err) {
      console.error('[NBB Supabase Debug] Failed to load profile:', err)
    }
  }, [applySupabaseProfile, clearAuthState])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const savedUserId = window.localStorage.getItem(LOCAL_CURRENT_USER_STORAGE_KEY)
        const savedProfile = loadLocalProfiles().find((profile) => profile.id === savedUserId)

        if (savedProfile) {
          applyLocalProfile(savedProfile)
        } else if (savedUserId) {
          clearAuthState()
        }
      }
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        refreshProfile()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await refreshProfile()
      } else {
        clearAuthState()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [applyLocalProfile, clearAuthState, refreshProfile])

  const login = useCallback(async (identifier: string, password: string, signupProfile?: SignupProfileInput) => {
    const trimmedIdentifier = identifier.trim()
    const normalizedIdentifier = trimmedIdentifier.toLowerCase()

    if (!isSupabaseConfigured()) {
      const isLocalAdmin = normalizedIdentifier.includes('admin') || trimmedIdentifier === '99999999' || normalizedIdentifier === 'okohwiz888@gmail.com'

      if (isLocalAdmin) {
        if (normalizedIdentifier === 'okohwiz888@gmail.com' && password !== 'okohwidom') {
          return { success: false, error: 'Invalid admin credentials' }
        }

        setIsAuthenticated(true)
        setUserRole('admin')
        setUserName('Admin')
        setProfilePictureUrl('')
        setProfileDetails({ ...defaultProfileDetails, firstName: 'Admin' })
        setUserStatus('active')
        setUserId('local-admin')
        setUserEmail(trimmedIdentifier.includes('@') ? trimmedIdentifier : '')
        setAccountNumber('99999999')
        setUserBalance(0.00)
        setSavingsBalance(0.00)
        setUserCountry('United Kingdom')
        setCurrency(getCurrency('United Kingdom'))

        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(LOCAL_CURRENT_USER_STORAGE_KEY)
        }

        return { success: true, role: 'admin' as UserRole }
      }

      if (signupProfile) {
        const profiles = loadLocalProfiles()
        const email = signupProfile.email.trim()
        const existingProfile = profiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase())

        if (existingProfile) {
          return { success: false, error: 'An account with this email already exists. Please sign in.' }
        }

        const now = new Date().toISOString()
        const profile: StoredLocalProfile = {
          id: createLocalId(),
          firstName: signupProfile.firstName.trim(),
          lastName: signupProfile.lastName.trim(),
          email,
          phone: signupProfile.phone.trim(),
          houseAddress: signupProfile.houseAddress.trim(),
          city: signupProfile.city.trim(),
          country: signupProfile.country || 'United Kingdom',
          postcode: signupProfile.postcode.trim(),
          dateOfBirth: signupProfile.dateOfBirth,
          ssn: signupProfile.ssn.trim(),
          occupation: signupProfile.occupation.trim(),
          incomeSource: signupProfile.incomeSource,
          password,
          accountNumber: generateLocalAccountNumber(profiles),
          profilePictureUrl: '',
          role: 'customer',
          status: 'active',
          balance: 0.00,
          savingsBalance: 0.00,
          createdAt: now,
          updatedAt: now,
        }

        saveLocalProfiles([...profiles, profile])
        applyLocalProfile(profile)
        return { success: true, role: 'customer' as UserRole }
      }

      const profile = loadLocalProfiles().find((localProfile) => {
        return localProfile.email.toLowerCase() === normalizedIdentifier || localProfile.accountNumber === trimmedIdentifier
      })

      if (!profile) {
        return { success: false, error: 'No account found. Please sign up first.' }
      }

      if (profile.password !== password) {
        return { success: false, error: 'Invalid credentials' }
      }

      applyLocalProfile(profile)
      return { success: true, role: profile.role }
    }

    try {
      let email = trimmedIdentifier
      if (!trimmedIdentifier.includes('@')) {
        const mappedEmail = await getEmailByAccountNumber(trimmedIdentifier)
        if (!mappedEmail) {
          return { success: false, error: 'Account number not found' }
        }
        email = mappedEmail
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles_nbb')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        return { success: false, error: profileError?.message || 'User profile record not found in database.' }
      }

      applySupabaseProfile(profile)
      return { success: true, role: (profile.role as UserRole) || 'customer' }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      return { success: false, error: message }
    }
  }, [applyLocalProfile, applySupabaseProfile])

  const saveProfile = useCallback(async (updates: ProfileUpdateInput, avatarFile: File | null = null) => {
    const nextUpdates = {
      firstName: updates.firstName.trim(),
      lastName: updates.lastName.trim(),
      phone: updates.phone.trim(),
      houseAddress: updates.houseAddress.trim(),
      city: updates.city.trim(),
      postcode: updates.postcode.trim(),
    }

    if (!nextUpdates.firstName || !nextUpdates.lastName) {
      return { success: false, error: 'First name and last name are required.' }
    }

    try {
      let nextProfilePictureUrl = profilePictureUrl

      if (isSupabaseConfigured()) {
        if (!userId) {
          return { success: false, error: 'Your session has expired. Please sign in again.' }
        }

        if (avatarFile) {
          const extension = avatarFile.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
          const filePath = `${userId}/profile-${Date.now()}.${extension}`
          const { error: uploadError } = await supabase.storage
            .from(PROFILE_IMAGE_BUCKET)
            .upload(filePath, avatarFile, {
              contentType: avatarFile.type,
              upsert: true,
            })

          if (uploadError) {
            throw uploadError
          }

          const { data } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(filePath)
          nextProfilePictureUrl = data.publicUrl
        }

        const { error: updateError } = await supabase
          .from('profiles_nbb')
          .update({
            first_name: nextUpdates.firstName,
            last_name: nextUpdates.lastName,
            phone: nextUpdates.phone,
            house_address: nextUpdates.houseAddress,
            city: nextUpdates.city,
            postcode: nextUpdates.postcode,
            profile_picture_url: nextProfilePictureUrl || null,
          })
          .eq('id', userId)

        if (updateError) {
          throw updateError
        }

        await refreshProfile()
        return { success: true, profilePictureUrl: nextProfilePictureUrl }
      }

      const profiles = loadLocalProfiles()
      const profileIndex = profiles.findIndex((profile) => profile.id === userId)

      if (profileIndex === -1) {
        return { success: false, error: 'Your local profile could not be found. Please sign in again.' }
      }

      if (avatarFile) {
        nextProfilePictureUrl = await fileToDataUrl(avatarFile)
      }

      const nextProfile: StoredLocalProfile = {
        ...profiles[profileIndex],
        firstName: nextUpdates.firstName,
        lastName: nextUpdates.lastName,
        phone: nextUpdates.phone,
        houseAddress: nextUpdates.houseAddress,
        city: nextUpdates.city,
        postcode: nextUpdates.postcode,
        profilePictureUrl: nextProfilePictureUrl,
        updatedAt: new Date().toISOString(),
      }

      profiles[profileIndex] = nextProfile
      saveLocalProfiles(profiles)
      applyLocalProfile(nextProfile)
      return { success: true, profilePictureUrl: nextProfilePictureUrl }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save profile changes.'
      return { success: false, error: message }
    }
  }, [applyLocalProfile, profilePictureUrl, refreshProfile, userId])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    clearAuthState()
  }, [clearAuthState])

  const checkSuspension = useCallback(() => {
    if (userStatus === 'suspended') {
      setShowSuspensionModal(true)
      return true
    }
    return false
  }, [userStatus])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userName,
        profilePictureUrl,
        profileDetails,
        userCountry,
        userEmail,
        userId,
        userStatus,
        accountNumber,
        userBalance,
        savingsBalance,
        currency,
        login,
        logout,
        checkSuspension,
        refreshProfile,
        saveProfile,
      }}
    >
      {children}
      <SuspensionWarningModal isOpen={showSuspensionModal} onClose={() => setShowSuspensionModal(false)} />
    </AuthContext.Provider>
  )
}

function SuspensionWarningModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const handleOpenLiveChat = () => {
    onClose()
    if ((window as any).Tawk_API?.maximize) {
      try {
        (window as any).Tawk_API.maximize()
      } catch (e) {
        console.error('Failed to open Tawk.to live chat:', e)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1628]/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-red-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Accent Bar */}
        <div className="h-2 bg-[#D31111] w-full" />
        
        <div className="p-6 text-center space-y-5">
          {/* Professional Security Alert Icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-[#D31111]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-display text-2xl font-bold text-[#0A1628] tracking-tight">
              Account Status Restricted
            </h3>
            
            <div className="text-left bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
              <p className="text-sm text-[#475569] leading-relaxed">
                We regret to inform you that your account access and transaction privileges have been temporarily suspended. This restriction affects all outgoing transfers, deposits, and withdrawal activities.
              </p>
              <p className="text-sm text-[#475569] leading-relaxed font-semibold">
                To secure your funds and lift this restriction, you are required to contact our Customer Care Support immediately to verify your identity and resolve the issue.
              </p>
            </div>
            
            <p className="text-xs text-[#94A3B8]">
              Our support team is online and ready to assist you right away.
            </p>
          </div>
          
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenLiveChat}
              className="w-full py-3 bg-[#610C04] hover:bg-[#0A1628] text-white rounded-xl font-semibold shadow-lg shadow-red-900/10 hover:shadow-none transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Contact Customer Care (Live Chat)</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 text-[#64748B] rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
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
        {/* Content pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/sustainability" element={<SustainabilityPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Product pages */}
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
