import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '../App'
import { getEmailByAccountNumber } from '../lib/supabase'
import Navbar from '../components/Navbar'

export default function Login() {
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const identifier = accountNumber.trim()
      if (identifier.includes('@')) {
        setError('Please log in using your account number, not your email.')
        setLoading(false)
        return
      }

      const mappedEmail = await getEmailByAccountNumber(identifier)
      if (!mappedEmail) {
        setError('Account number not found')
        setLoading(false)
        return
      }

      const res = await login(mappedEmail, password)
      if (res.success) {
        if (res.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(res.error || 'Invalid credentials')
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMessage('')
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setResetMessage('Please enter a valid email address.')
      return
    }
    setResetLoading(true)
    const res = await resetPassword(resetEmail)
    if (res.success) {
      setResetMessage('Password reset email sent. Check your inbox.')
      setResetEmail('')
    } else {
      setResetMessage(res.error || 'Unable to send reset email.')
    }
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16 min-h-screen flex">
        {/* Left panel - decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0A1628] relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(211,17,17,0.15)_0%,_transparent_70%)]" />
          <div className="relative z-10 max-w-md px-12">
            <div className="w-16 h-16 rounded-2xl bg-[#610C04] flex items-center justify-center mb-8">
              <Shield size={32} className="text-white" />
            </div>
            <h2 className="font-display text-4xl text-white mb-4">Welcome back</h2>
            <p className="text-[#64748B] text-lg font-light">
              Access your accounts, manage your money, and track your spending — all in one secure place.
            </p>
            <div className="mt-12 space-y-4">
              {['Real-time balance updates', 'Instant payment notifications', 'Secure biometric login'].map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#610C04]/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#610C04]" />
                  </div>
                  <span className="text-sm text-white/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-[#0A1628] mb-2">Sign in</h1>
              <p className="text-[#64748B]">Enter your details to access your account.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-2">Account number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] transition-all"
                  placeholder="e.g. 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-light bg-white text-[#0A1628] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0A1628] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-light text-[#610C04] focus:ring-[#610C04]" />
                  <span className="text-sm text-[#64748B]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowReset(!showReset)}
                  className="text-sm text-[#610C04] hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {showReset && (
              <div className="mt-6 p-5 rounded-xl bg-[#F8FAFC] border border-light">
                <h3 className="text-sm font-medium text-[#0A1628] mb-2">Reset your password</h3>
                <p className="text-xs text-[#64748B] mb-4">Enter your email and we&apos;ll send you a reset link.</p>
                <form onSubmit={handleReset} className="space-y-3">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] transition-all"
                    required
                  />
                  {resetMessage && (
                    <div className={`text-xs p-3 rounded-lg ${resetMessage.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {resetMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 rounded-xl font-medium text-sm bg-[#0A1628] text-white hover:bg-[#0A1628]/90 transition-colors disabled:opacity-60"
                  >
                    {resetLoading ? 'Sending...' : 'Send reset email'}
                  </button>
                </form>
              </div>
            )}

            <p className="mt-8 text-center text-sm text-[#64748B]">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-[#610C04] font-medium hover:underline">
                Get started
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
