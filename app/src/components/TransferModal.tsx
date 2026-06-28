import { useState } from 'react'
import { X, Send, ArrowRight, Shield, ChevronLeft, Clock } from 'lucide-react'
import { useAuth } from '../App'
import { supabase, isSupabaseConfigured, generateAndSendOTP, verifyOTP } from '../lib/supabase'

interface TransferModalProps {
  onClose: () => void
  initialType?: 'domestic' | 'international'
}

type TransferStep = 'form' | 'preview' | 'otp' | 'receipt'
type TransferType = 'domestic' | 'international'

export default function TransferModal({ onClose, initialType }: TransferModalProps) {
  const { userEmail, userId, refreshProfile, userBalance, savingsBalance, currency, checkSuspension } = useAuth()
  const [step, setStep] = useState<TransferStep>('form')
  const [transferType, setTransferType] = useState<TransferType>(initialType || 'domestic')
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']) // 8-digit OTP
  const [otpError, setOtpError] = useState('')
  const [loadingOtp, setLoadingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [payFrom, setPayFrom] = useState<'current' | 'savings'>('current')

  // Domestic form
  const [domestic, setDomestic] = useState({
    accountNumber: '', bankName: '', accountHolder: '', amount: '', purpose: '',
  })

  // International form
  const [international, setInternational] = useState({
    receiverName: '', phone: '', email: '', address: '', amount: '', country: '', purpose: '', swiftIban: '',
  })

  const countries = [
    'Turkey', 'United Kingdom', 'United States', 'Canada', 'Germany', 'France', 'Spain', 'Netherlands',
    'Australia', 'UAE', 'Nigeria', 'India', 'China', 'Japan', 'Brazil', 'South Africa',
    'Italy', 'Ireland', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Belgium',
    'Austria', 'Portugal', 'Greece', 'Poland', 'Singapore', 'Hong Kong', 'New Zealand', 'Mexico',
    'Argentina', 'Chile', 'Colombia', 'Egypt', 'Kenya', 'Ghana', 'Morocco', 'Saudi Arabia',
    'Qatar', 'Kuwait', 'Malaysia', 'Thailand', 'Indonesia', 'Vietnam', 'South Korea', 'Pakistan',
    'Bangladesh', 'Philippines'
  ]

  const purposes = ['Personal', 'Business', 'Family Support', 'Education', 'Medical', 'Investment', 'Goods/Services', 'Other']
  const banks = ['Barclays', 'HSBC', 'Lloyds Bank', 'NatWest', 'Santander UK', 'Nationwide', 'Metro Bank', 'Monzo', 'Starling Bank', 'TSB']

  const handleFieldChange = (field: string, value: string) => {
    if (transferType === 'domestic') {
      setDomestic((prev) => ({ ...prev, [field]: value }))
    } else {
      setInternational((prev) => ({ ...prev, [field]: value }))
    }
  }

  const isFormValid = () => {
    if (transferType === 'domestic') {
      return domestic.accountNumber && domestic.bankName && domestic.accountHolder && domestic.amount && domestic.purpose
    }
    return international.receiverName && international.phone && international.email && international.address && international.amount && international.country && international.purpose && international.swiftIban
  }

  const handleContinue = () => {
    if (isFormValid()) setStep('preview')
  }

  const handleConfirm = async () => {
    if (checkSuspension()) return
    setLoadingOtp(true)
    setOtpError('')
    try {
      if (!userEmail) {
        setOtpError('Your registered email address is missing. Please sign in again.')
        return
      }
      const success = await generateAndSendOTP(userEmail)
      if (success) {
        setStep('otp')
      } else {
        setOtpError('Failed to request verification code.')
      }
    } catch (err: any) {
      setOtpError('Failed to trigger OTP email.')
    } finally {
      setLoadingOtp(false)
    }
  }

  const handleOtpVerify = async () => {
    if (checkSuspension()) return
    const code = otp.join('')
    setVerifying(true)
    setOtpError('')

    if (!userEmail) {
      setOtpError('Your registered email address is missing. Please sign in again.')
      setVerifying(false)
      return
    }
    const isValid = await verifyOTP(userEmail, code)

    if (isValid) {
      try {
        const transferAmount = parseFloat(transferType === 'domestic' ? domestic.amount : international.amount)

        if (isSupabaseConfigured() && userId) {
          // Fetch current profile balance based on source account
          const balanceColumn = payFrom === 'savings' ? 'savings_balance' : 'balance'
          const { data: profile } = await supabase
             .from('profiles_nbb')
             .select(balanceColumn)
             .eq('id', userId)
             .single()

          const currentBal = parseFloat((profile as any)?.[balanceColumn] || '0')
          if (currentBal < transferAmount) {
            setOtpError('Insufficient funds to complete this transfer.')
            setVerifying(false)
            return
          }

          const newBal = currentBal - transferAmount

          // 1. Deduct balance from profiles_nbb
          const { error: balanceError } = await supabase
            .from('profiles_nbb')
            .update({ [balanceColumn]: newBal })
            .eq('id', userId)

          if (balanceError) {
            setOtpError(balanceError.message)
            setVerifying(false)
            return
          }

          // 2. Insert transaction log into transactions_nbb
          const { error: txnError } = await supabase
            .from('transactions_nbb')
            .insert([{
              user_id: userId,
              description: transferType === 'domestic' 
                ? `Transfer to ${domestic.accountHolder} (${domestic.bankName})${payFrom === 'savings' ? ' (from Savings)' : ''}`
                : `Intl Transfer to ${international.receiverName}${payFrom === 'savings' ? ' (from Savings)' : ''}`,
              category: 'Transfers',
              amount: -transferAmount,
              status: 'Pending'
            }])

          if (txnError) {
            console.error('Failed to log transaction in database:', txnError)
          }

          // Refresh context balance
          await refreshProfile()
        }

        setStep('receipt')
      } catch (err: any) {
        setOtpError(err.message || 'An error occurred during transfer verification.')
      }
    } else {
      setOtpError('Invalid OTP code. Please try again.')
    }
    setVerifying(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setOtpError('')
    // Auto-focus next input
    if (value && index < 7) {
      setTimeout(() => {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }, 50)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const generateReceiptId = () => {
    const prefix = transferType === 'domestic' ? 'DOM' : 'INT'
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${date}-${random}`
  }

  const receiptId = generateReceiptId()
  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-full sm:max-w-xl overflow-hidden my-0 sm:my-8 min-h-screen sm:min-h-0 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <div className="flex items-center space-x-3">
            {step !== 'form' && step !== 'receipt' && (
              <button onClick={() => step === 'preview' ? setStep('form') : setStep('preview')} className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-[#64748B]" />
              </button>
            )}
            <h3 className="font-display text-lg text-[#0A1628]">
              {step === 'form' && (transferType === 'domestic' ? 'Domestic Transfer' : 'International Transfer')}
              {step === 'preview' && 'Confirm Transfer'}
              {step === 'otp' && 'Verify Transfer'}
              {step === 'receipt' && 'Transfer Receipt'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <div className="p-6 space-y-5">
            {/* Transfer Type Toggle */}
            {!initialType && (
              <div className="flex rounded-xl bg-[#F1F5F9] p-1">
                <button onClick={() => setTransferType('domestic')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${transferType === 'domestic' ? 'bg-[#610C04] text-white shadow-sm' : 'text-[#64748B] hover:text-[#0A1628]'}`}>
                  Domestic Transfer
                </button>
                <button onClick={() => setTransferType('international')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${transferType === 'international' ? 'bg-[#610C04] text-white shadow-sm' : 'text-[#64748B] hover:text-[#0A1628]'}`}>
                  International Transfer
                </button>
              </div>
            )}

            {/* DOMESTIC FORM */}
            {transferType === 'domestic' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Pay From <span className="text-[#610C04]">*</span></label>
                  <select value={payFrom} onChange={(e) => setPayFrom(e.target.value as 'current' | 'savings')} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] bg-white">
                    <option value="current">Everyday Current Account ({currency.symbol}{userBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })})</option>
                    <option value="savings">Premier Savings Account ({currency.symbol}{savingsBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })})</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Account Holder Name <span className="text-[#610C04]">*</span></label>
                  <input type="text" value={domestic.accountHolder} onChange={(e) => handleFieldChange('accountHolder', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="Full name on account" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Bank Name <span className="text-[#610C04]">*</span></label>
                  <select value={domestic.bankName} onChange={(e) => handleFieldChange('bankName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] bg-white">
                    <option value="">Select bank</option>
                    {banks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Account Number / IBAN <span className="text-[#610C04]">*</span></label>
                  <input type="text" value={domestic.accountNumber} onChange={(e) => handleFieldChange('accountNumber', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="8 digit account number" maxLength={24} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Amount (&pound;) <span className="text-[#610C04]">*</span></label>
                  <input type="number" value={domestic.amount} onChange={(e) => handleFieldChange('amount', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Purpose of Transfer <span className="text-[#610C04]">*</span></label>
                  <select value={domestic.purpose} onChange={(e) => handleFieldChange('purpose', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] bg-white">
                    <option value="">Select purpose</option>
                    {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* INTERNATIONAL FORM */}
            {transferType === 'international' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Pay From <span className="text-[#610C04]">*</span></label>
                  <select value={payFrom} onChange={(e) => setPayFrom(e.target.value as 'current' | 'savings')} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] bg-white">
                    <option value="current">Everyday Current Account ({currency.symbol}{userBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })})</option>
                    <option value="savings">Premier Savings Account ({currency.symbol}{savingsBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })})</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Receiver Name <span className="text-[#610C04]">*</span></label>
                  <input type="text" value={international.receiverName} onChange={(e) => handleFieldChange('receiverName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="Full legal name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Phone Number <span className="text-[#610C04]">*</span></label>
                  <input type="tel" value={international.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Email Address <span className="text-[#610C04]">*</span></label>
                  <input type="email" value={international.email} onChange={(e) => handleFieldChange('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="receiver@email.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Address <span className="text-[#610C04]">*</span></label>
                  <input type="text" value={international.address} onChange={(e) => handleFieldChange('address', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="Street address, City, Country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Country <span className="text-[#610C04]">*</span></label>
                  <select value={international.country} onChange={(e) => handleFieldChange('country', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] bg-white">
                    <option value="">Select country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">SWIFT / IBAN / Routing Number <span className="text-[#610C04]">*</span></label>
                  <input type="text" value={international.swiftIban} onChange={(e) => handleFieldChange('swiftIban', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="e.g. CHASUS33 or GB29NWBK..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Amount (&pound;) <span className="text-[#610C04]">*</span></label>
                  <input type="number" value={international.amount} onChange={(e) => handleFieldChange('amount', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Purpose of Transfer <span className="text-[#610C04]">*</span></label>
                  <select value={international.purpose} onChange={(e) => handleFieldChange('purpose', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] bg-white">
                    <option value="">Select purpose</option>
                    {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button onClick={handleContinue} disabled={!isFormValid()} className="w-full btn-primary py-3.5 disabled:opacity-50 flex items-center justify-center space-x-2">
              <span>Continue</span><ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 'preview' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Send size={18} className="text-[#610C04]" />
              <span className="text-sm font-medium text-[#0A1628] capitalize">{transferType} Transfer</span>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-light/50">
                <span className="text-sm text-[#64748B]">Transfer Type</span>
                <span className="text-sm font-medium text-[#0A1628] capitalize">{transferType}</span>
              </div>

              {transferType === 'domestic' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Bank</span><span className="text-sm font-medium text-[#0A1628]">{domestic.bankName}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Account Number</span><span className="text-sm font-medium text-[#0A1628] font-mono">****{domestic.accountNumber.slice(-4)}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Account Holder</span><span className="text-sm font-medium text-[#0A1628]">{domestic.accountHolder}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Purpose</span><span className="text-sm font-medium text-[#0A1628]">{domestic.purpose}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Receiver</span><span className="text-sm font-medium text-[#0A1628]">{international.receiverName}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Country</span><span className="text-sm font-medium text-[#0A1628]">{international.country}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Phone</span><span className="text-sm font-medium text-[#0A1628]">{international.phone}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Email</span><span className="text-sm font-medium text-[#0A1628]">{international.email}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Address</span><span className="text-sm font-medium text-[#0A1628] text-right max-w-[200px]">{international.address}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">Purpose</span><span className="text-sm font-medium text-[#0A1628]">{international.purpose}</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-light/50"><span className="text-sm text-[#64748B]">SWIFT/IBAN</span><span className="text-sm font-medium text-[#0A1628] font-mono">{international.swiftIban}</span></div>
                </>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-[#64748B]">Amount</span>
                <span className="text-xl font-light text-[#610C04]">&pound;{parseFloat((transferType === 'domestic' ? domestic.amount : international.amount) || '0').toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {transferType === 'international' && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-[#64748B]">Transfer Fee</span>
                  <span className="text-sm font-medium text-[#0A1628]">&pound;15.00</span>
                </div>
              )}
            </div>

            <div className="bg-[#FEE2E2] rounded-xl p-4 flex items-start space-x-3">
              <Shield size={18} className="text-[#610C04] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#0A1628]">You will receive an 8-digit OTP code to verify this transfer. Please ensure all details are correct before confirming.</p>
            </div>

            <button onClick={handleConfirm} disabled={loadingOtp} className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2">
              {loadingOtp ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Request Verification Code</span><Shield size={18} /></>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: OTP */}
        {step === 'otp' && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-[#610C04]" />
              </div>
              <h3 className="font-display text-xl text-[#0A1628] mb-2">Verify with OTP</h3>
              <p className="text-sm text-[#64748B]">An 8-digit verification code has been sent to your email. Enter it below to complete the transfer.</p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444] text-center">
                {otpError}
              </div>
            )}

            <div className="flex justify-center gap-1.5 sm:gap-2 max-w-full px-1">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-7 h-10 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-medium text-[#0A1628] border border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] bg-[#F8FAFC]"
                />
              ))}
            </div>

            <button onClick={handleOtpVerify} disabled={verifying || otp.some(d => !d)} className="w-full btn-primary py-3.5 disabled:opacity-50 flex items-center justify-center">
              {verifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify & Complete Transfer'
              )}
            </button>

            <p className="text-center text-xs text-[#64748B]">
              Did not receive it? <span onClick={handleConfirm} className="text-[#610C04] hover:underline cursor-pointer">Resend code</span>
            </p>
          </div>
        )}

        {/* STEP 4: RECEIPT */}
        {step === 'receipt' && (
          <div className="p-6">
            {/* Receipt Card */}
            <div className="bg-white border-2 border-amber-500 rounded-2xl overflow-hidden shadow-soft">
              {/* Receipt Header */}
              <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock size={20} className="text-white animate-pulse" />
                  <span className="text-white font-medium text-sm">Transfer Pending Approval</span>
                </div>
                <span className="text-white/80 text-xs font-mono">{receiptId}</span>
              </div>

              {/* Receipt Body */}
              <div className="p-6 space-y-4 bg-slate-50/50">
                <div className="text-center mb-4">
                  <p className="text-sm text-[#64748B]">Amount Transferred</p>
                  <p className="font-display text-3xl text-[#0A1628]">&pound;{parseFloat((transferType === 'domestic' ? domestic.amount : international.amount) || '0').toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="border-t border-light pt-4 space-y-3">
                  <div className="flex justify-between"><span className="text-xs text-[#64748B]">Status</span><span className="text-sm font-semibold text-amber-500">Pending Approval</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#64748B]">Transfer Type</span><span className="text-sm font-medium text-[#0A1628] capitalize">{transferType}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#64748B]">Date</span><span className="text-sm text-[#0A1628]">{formattedDate}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#64748B]">Time</span><span className="text-sm text-[#0A1628]">{formattedTime}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-[#64748B]">Reference</span><span className="text-sm font-mono text-[#0A1628]">{receiptId}</span></div>
                  {transferType === 'domestic' ? (
                    <>
                      <div className="flex justify-between"><span className="text-xs text-[#64748B]">Bank</span><span className="text-sm text-[#0A1628]">{domestic.bankName}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-[#64748B]">To</span><span className="text-sm text-[#0A1628]">{domestic.accountHolder}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-[#64748B]">Account</span><span className="text-sm font-mono text-[#0A1628]">****{domestic.accountNumber.slice(-4)}</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-xs text-[#64748B]">To</span><span className="text-sm text-[#0A1628]">{international.receiverName}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-[#64748B]">Country</span><span className="text-sm text-[#0A1628]">{international.country}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-[#64748B]">SWIFT/IBAN</span><span className="text-sm font-mono text-[#0A1628]">{international.swiftIban.slice(0, 8)}****</span></div>
                      <div className="flex justify-between"><span className="text-xs text-[#64748B]">Transfer Fee</span><span className="text-sm text-[#0A1628]">&pound;15.00</span></div>
                    </>
                  )}
                  <div className="flex justify-between"><span className="text-xs text-[#64748B]">Purpose</span><span className="text-sm text-[#0A1628]">{transferType === 'domestic' ? domestic.purpose : international.purpose}</span></div>
                </div>

                {/* Security Footer */}
                <div className="border-t border-light pt-4 flex items-center justify-center space-x-2">
                  <Shield size={14} className="text-[#10B981]" />
                  <span className="text-xs text-[#64748B]">Verified by North Bridge Bank Security</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button onClick={() => window.print()} className="w-full py-3 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition-colors flex items-center justify-center space-x-2">
                <span>Print Receipt</span>
              </button>
              <button onClick={onClose} className="w-full btn-primary py-3.5">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
