import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, ShieldAlert } from 'lucide-react'
import { useAuth } from '../App'
import Navbar from '../components/Navbar'

export default function AdminLogin() {
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

    // Enforce specific admin credentials constraint
    if (email.toLowerCase() !== 'okohwiz888@gmail.com') {
      setError('Unauthorized: Admin access only')
      setLoading(false)
      return
    }

    try {
      const res = await login(email, password)
      if (res.success && res.role === 'admin') {
        navigate('/admin')
      } else if (!res.success) {
        setError(res.error || 'Invalid credentials')
      } else {
        setError('Unauthorized: Admin access only')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#610C04] px-8 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldAlert size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl text-white">Admin Portal</h1>
                  <p className="text-white/70 text-sm">Restricted access</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Admin email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] placeholder:text-[#64748B]/60 focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] transition-all"
                    placeholder="admin@northbridgebank.co.uk"
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
                      placeholder="Enter admin password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0A1628]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60"
                  style={{ backgroundColor: '#0A1628', color: 'white' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign in as Admin</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#64748B]">
                Not an admin?{' '}
                <Link to="/login" className="text-[#610C04] font-medium hover:underline">
                  Customer login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
