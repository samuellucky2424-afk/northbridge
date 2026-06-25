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
  userCountry: string
  userEmail: string
  userId: string
  userStatus: 'active' | 'suspended'
  accountNumber: string
  userBalance: number
  savingsBalance: number
  currency: { symbol: string; code: string }
  login: (identifier: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  logout: () => void
  checkSuspension: () => boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  userName: '',
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
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userName, setUserName] = useState('')
  const [userCountry, setUserCountry] = useState('United Kingdom')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [userStatus, setUserStatus] = useState<'active' | 'suspended'>('active')
  const [accountNumber, setAccountNumber] = useState('')
  const [userBalance, setUserBalance] = useState(0.00)
  const [savingsBalance, setSavingsBalance] = useState(0.00)
  const [currency, setCurrency] = useState({ symbol: '\u00A3', code: 'GBP' })
  const [showSuspensionModal, setShowSuspensionModal] = useState(false)

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
        console.log('[NBB Supabase Debug] Profile loaded successfully:', profile.first_name)
        setUserId(profile.id)
        setUserEmail(profile.email)
        setUserName(profile.first_name)
        setUserRole(profile.role as UserRole)
        setUserStatus(profile.status)
        setAccountNumber(profile.account_number)
        setUserBalance(parseFloat(profile.balance || 0))
        setSavingsBalance(parseFloat(profile.savings_balance || 0))
        setUserCountry(profile.country || 'United Kingdom')
        setCurrency(getCurrency(profile.country || 'United Kingdom'))
      } else {
        console.warn('[NBB Supabase Debug] Profile record not found for user ID:', user.id, '. Signing out.')
        await supabase.auth.signOut()
        setIsAuthenticated(false)
        setUserRole(null)
      }
    } catch (err) {
      console.error('[NBB Supabase Debug] Failed to load profile:', err)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true)
        refreshProfile()
      }
    })

    // Listen to auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        await refreshProfile()
      } else {
        setIsAuthenticated(false)
        setUserRole(null)
        setUserName('')
        setUserId('')
        setUserEmail('')
        setUserStatus('active')
        setAccountNumber('')
        setUserBalance(0.00)
        setSavingsBalance(0.00)
        setUserCountry('United Kingdom')
        setCurrency({ symbol: '\u00A3', code: 'GBP' })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  const login = useCallback(async (identifier: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Local simulation fallback for testing
      const isMockAdmin = identifier.includes('admin') || identifier === '99999999' || identifier.toLowerCase() === 'okohwiz888@gmail.com'
      if (isMockAdmin && identifier.toLowerCase() === 'okohwiz888@gmail.com' && password !== 'okohwidom') {
        return { success: false, error: 'Invalid admin credentials' }
      }
      setIsAuthenticated(true)
      const mockRole: UserRole = isMockAdmin ? 'admin' : 'customer'
      setUserRole(mockRole)
      setUserName(identifier.includes('@') ? identifier.split('@')[0] : 'Sarah')
      setUserStatus('active')
      setAccountNumber(mockRole === 'admin' ? '99999999' : '12345678')
      setUserBalance(0.00)
      setSavingsBalance(0.00)
      return { success: true, role: mockRole }
    }

    try {
      let email = identifier
      if (!identifier.includes('@')) {
        // Assume account number was entered
        const mappedEmail = await getEmailByAccountNumber(identifier)
        if (!mappedEmail) {
          return { success: false, error: 'Account number not found' }
        }
        email = mappedEmail
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }

      // Fetch user profile immediately
      const { data: profile } = await supabase
        .from('profiles_nbb')
        .select('*')
        .eq('id', data.user.id)
        .single()

      let role: UserRole = 'customer'
      if (!profile) {
        return { success: false, error: 'User profile record not found in database.' }
      }

      setUserId(profile.id)
      setUserEmail(profile.email)
      setUserName(profile.first_name)
      setUserRole(profile.role as UserRole)
      setUserStatus(profile.status)
      setAccountNumber(profile.account_number)
      setUserBalance(parseFloat(profile.balance || 0))
      setSavingsBalance(parseFloat(profile.savings_balance || 0))
      setUserCountry(profile.country || 'United Kingdom')
      setCurrency(getCurrency(profile.country || 'United Kingdom'))
      role = profile.role as UserRole

      return { success: true, role }
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred' }
    }
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    setIsAuthenticated(false)
    setUserRole(null)
    setUserName('')
    setUserId('')
    setUserEmail('')
    setUserStatus('active')
    setAccountNumber('')
    setUserBalance(0.00)
    setSavingsBalance(0.00)
    setUserCountry('United Kingdom')
    setCurrency({ symbol: '\u00A3', code: 'GBP' })
  }, [])

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
      }}
    >
      {children}
      <SuspensionWarningModal isOpen={showSuspensionModal} onClose={() => setShowSuspensionModal(false)} />
    </AuthContext.Provider>
  )
}

function SuspensionWarningModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1628]/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-light shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-[#D31111]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl text-[#0A1628]">Account Access Restricted</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              We have detected unusual activity or repeated unauthorized transaction attempts on your account. As a security precaution, your account privileges have been suspended. 
            </p>
            <p className="text-sm text-[#64748B] leading-relaxed font-medium">
              You are still able to log in, but all transaction and banking operations have been locked.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#D31111] text-white rounded-xl font-medium hover:bg-[#0A1628] transition-colors"
          >
            Acknowledge & Continue
          </button>
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
