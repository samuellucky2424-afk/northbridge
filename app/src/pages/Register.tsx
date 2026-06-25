import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Check, ChevronLeft, Crown } from 'lucide-react'
import { useAuth } from '../App'
import Navbar from '../components/Navbar'
import { supabase, isSupabaseConfigured, generateUniqueAccountNumber } from '../lib/supabase'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    houseAddress: '',
    city: '',
    country: 'United Kingdom',
    postcode: '',
    dateOfBirth: '',
    ssn: '',
    occupation: '',
    incomeSource: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.phone) {
        setError('Please fill in all required fields')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError('Please enter a valid email address')
        return false
      }
    }
    if (s === 2) {
      if (!form.houseAddress || !form.city || !form.country || !form.postcode || !form.dateOfBirth) {
        setError('Please fill in all required fields')
        return false
      }
    }
    if (s === 3) {
      if (!form.ssn || !form.occupation || !form.incomeSource) {
        setError('Please fill in all required fields')
        return false
      }
    }
    if (s === 4) {
      if (!form.password || !form.confirmPassword) {
        setError('Please enter and confirm your password')
        return false
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters')
        return false
      }
      if (!/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
        setError('Password must contain at least one uppercase letter and one number')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setError('')
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return
    setLoading(true)

    if (!isSupabaseConfigured()) {
      // Local simulated signup fallback
      setTimeout(() => {
        login(form.email, form.password)
        navigate('/dashboard')
        setLoading(false)
      }, 1200)
      return
    }

    try {
      // 1. Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Signup complete. Please check your email for a verification link or try signing in.')
        setLoading(false)
        return
      }

      // 2. Generate a unique account number
      const accountNumber = await generateUniqueAccountNumber()

      // 3. Create the user profile in profiles_nbb
      const { error: profileError } = await supabase
        .from('profiles_nbb')
        .insert([{
          id: authData.user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          house_address: form.houseAddress,
          city: form.city,
          country: form.country,
          postcode: form.postcode,
          date_of_birth: form.dateOfBirth,
          ssn: form.ssn,
          occupation: form.occupation,
          income_source: form.incomeSource,
          account_number: accountNumber,
          balance: 0.00,
          savings_balance: 0.00,
          role: 'customer',
          status: 'active'
        }])

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // 4. Log in the user in our Context
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const passwordRules = [
    { label: 'At least 8 characters', met: form.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(form.password) },
    { label: 'One number', met: /\d/.test(form.password) },
    { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) },
  ]

  const incomeOptions = [
    'Salary / Employment',
    'Self-employed',
    'Pension',
    'Investments',
    'Rental Income',
    'Benefits',
    'Student Loan / Grant',
    'Other',
  ]

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <Navbar />
      <main className="pt-16 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#D31111] flex items-center justify-center">
                  <Crown size={16} className="text-white" />
                </div>
                <span className="font-display text-lg text-[#0A1628]">North Bridge Bank</span>
              </div>
              <span className="text-sm text-[#64748B]">Step {step} of 4</span>
            </div>
            <div className="h-1.5 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-[#D31111] transition-all duration-500 rounded-full" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
            {/* Step labels */}
            <div className="flex justify-between mt-2">
              {['Personal', 'Address', 'Details', 'Security'].map((label, i) => (
                <span key={i} className={`text-xs ${step >= i + 1 ? 'text-[#D31111] font-medium' : 'text-[#64748B]'}`}>{label}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="mb-6">
              <h1 className="font-display text-2xl text-[#0A1628] mb-1">
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Residential Address'}
                {step === 3 && 'Additional Details'}
                {step === 4 && 'Create Password'}
              </h1>
              <p className="text-sm text-[#64748B]">
                {step === 1 && 'Tell us a bit about yourself.'}
                {step === 2 && 'Where do you currently live?'}
                {step === 3 && 'A few more details to complete your profile.'}
                {step === 4 && 'Secure your account with a strong password.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            {/* STEP 1: Personal */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A1628] mb-2">First name <span className="text-[#D31111]">*</span></label>
                    <input type="text" value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1628] mb-2">Last name <span className="text-[#D31111]">*</span></label>
                    <input type="text" value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="Smith" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Email address <span className="text-[#D31111]">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="john.smith@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Phone number <span className="text-[#D31111]">*</span></label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="+44 7700 900000" />
                </div>
                <button onClick={handleNext} className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2">
                  <span>Continue</span><ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: Address */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">House address <span className="text-[#D31111]">*</span></label>
                  <input type="text" value={form.houseAddress} onChange={(e) => updateForm('houseAddress', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="42 Baker Street" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0A1628] mb-2">City <span className="text-[#D31111]">*</span></label>
                    <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="London" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A1628] mb-2">Postcode <span className="text-[#D31111]">*</span></label>
                    <input type="text" value={form.postcode} onChange={(e) => updateForm('postcode', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="NW1 6XE" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Country <span className="text-[#D31111]">*</span></label>
                  <div className="relative">
                    <select value={form.country} onChange={(e) => updateForm('country', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all appearance-none">
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Spain">Spain</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Italy">Italy</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Australia">Australia</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="India">India</option>
                      <option value="China">China</option>
                      <option value="Japan">Japan</option>
                      <option value="Brazil">Brazil</option>
                      <option value="South Africa">South Africa</option>
                      <option value="UAE">UAE</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Norway">Norway</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Date of birth <span className="text-[#D31111]">*</span></label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" />
                </div>
                <div className="flex space-x-3">
                  <button onClick={handleBack} className="flex-1 py-3.5 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-center space-x-2">
                    <ChevronLeft size={16} /><span>Back</span>
                  </button>
                  <button onClick={handleNext} className="flex-1 btn-primary py-3.5 flex items-center justify-center space-x-2">
                    <span>Continue</span><ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Additional Details */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">National Insurance Number (SSN) <span className="text-[#D31111]">*</span></label>
                  <input type="text" value={form.ssn} onChange={(e) => updateForm('ssn', e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all uppercase" placeholder="AB123456C" />
                  <p className="text-xs text-[#64748B] mt-1.5">This is required for identity verification and regulatory compliance.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Occupation <span className="text-[#D31111]">*</span></label>
                  <input type="text" value={form.occupation} onChange={(e) => updateForm('occupation', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Source of income <span className="text-[#D31111]">*</span></label>
                  <select value={form.incomeSource} onChange={(e) => updateForm('incomeSource', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all appearance-none">
                    <option value="">Select your source of income</option>
                    {incomeOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button onClick={handleBack} className="flex-1 py-3.5 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-center space-x-2">
                    <ChevronLeft size={16} /><span>Back</span>
                  </button>
                  <button onClick={handleNext} className="flex-1 btn-primary py-3.5 flex items-center justify-center space-x-2">
                    <span>Continue</span><ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Password */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Password <span className="text-[#D31111]">*</span></label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateForm('password', e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="Min 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-2">Confirm password <span className="text-[#D31111]">*</span></label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light bg-white text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] transition-all" placeholder="Repeat your password" />
                </div>
                <div className="space-y-2">
                  {passwordRules.map((rule, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${rule.met ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}>
                        {rule.met && <Check size={10} className="text-white" />}
                      </div>
                      <span className={`text-xs ${rule.met ? 'text-[#10B981]' : 'text-[#64748B]'}`}>{rule.label}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[#F1F5F9] rounded-xl">
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    By opening an account, you agree to our <span className="text-[#D31111] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[#D31111] hover:underline cursor-pointer">Privacy Policy</span>. North Bridge Bank is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button type="button" onClick={handleBack} className="flex-1 py-3.5 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-center space-x-2">
                    <ChevronLeft size={16} /><span>Back</span>
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 btn-primary py-3.5 flex items-center justify-center space-x-2 disabled:opacity-60">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><span>Open account</span><ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-[#64748B]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#D31111] font-medium hover:underline">Sign in</Link>
        </p>
      </main>
    </div>
  )
}
