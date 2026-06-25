import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '../App'
import Navbar from '../components/Navbar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await login(email, password)
      if (res.success) {
        if (res.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      } else {
        setError(res.error || 'Invalid credentials')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16 min-h-screen flex">
        {/* Left panel - decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0A1628] relative overflow-hidden items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(211,17,17,0.15)_0%,_transparent_70%)]" />
          <div className="relative z-10 max-w-md px-12">
            <div className="w-16 h-16 rounded-2xl bg-[#D31111] flex items-center justify-center mb-8">
              <Shield size={32} className="text-white" />
            </div>
            <h2 className="font-display text-4xl text-white mb-4">Welcome back</h2>
            <p className="text-[#64748B] text-lg font-light">
              Access your accounts, manage your money, and track your spending — all in one secure place.
            </p>
            <div className="mt-12 space-y-4">
              {['Real-time balance updates', 'Instant payment notifications', 'Secure biometric login'].map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#D31111]/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#D31111]" />
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
                <label className="block text-sm font-medium text-[#0A1628] mb-2">Account number or email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all"
                  placeholder="e.g. 12345678 or you@example.com"
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
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-light bg-white text-[#0A1628] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all"
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
                  <input type="checkbox" className="w-4 h-4 rounded border-light text-[#D31111] focus:ring-[#D31111]" />
                  <span className="text-sm text-[#64748B]">Remember me</span>
                </label>
                <span className="text-sm text-[#D31111] hover:underline cursor-pointer">Forgot password?</span>
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

            <p className="mt-8 text-center text-sm text-[#64748B] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <span>
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-[#D31111] font-medium hover:underline">
                  Get started
                </Link>
              </span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <Link to="/admin/login" className="text-[#64748B] hover:text-[#D31111] hover:underline font-medium">
                Admin Portal
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
