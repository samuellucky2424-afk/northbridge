import { useState } from 'react'
import { X, ArrowRight, Shield, ChevronLeft, Clock } from 'lucide-react'
import { useAuth } from '../App'
import { supabase, isSupabaseConfigured, generateAndSendOTP, verifyOTP } from '../lib/supabase'

interface CryptoWithdrawModalProps {
  onClose: () => void
}

type WithdrawStep = 'form' | 'preview' | 'otp' | 'receipt'
type CryptoAsset = 'BTC' | 'USDT'

export default function CryptoWithdrawModal({ onClose }: CryptoWithdrawModalProps) {
  const { userEmail, userId, refreshProfile, userBalance, savingsBalance, currency, checkSuspension } = useAuth()
  const [step, setStep] = useState<WithdrawStep>('form')
  const [asset, setAsset] = useState<CryptoAsset>('BTC')
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('BTC Network')
  const [amount, setAmount] = useState('')
  const [source, setSource] = useState<'current' | 'savings'>('current')
  
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']) // 8-digit OTP
  const [otpError, setOtpError] = useState('')
  const [loadingOtp, setLoadingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const cs = currency.symbol
  const activeBalance = source === 'savings' ? savingsBalance : userBalance

  // Mock exchange rates:
  // 1 GBP/USD/EUR equivalent in BTC/USDT
  const conversionRates: Record<CryptoAsset, number> = {
    BTC: 0.000018,
    USDT: 1.28
  }

  const cryptoEquiv = parseFloat(amount || '0') * conversionRates[asset]

  const networks = asset === 'BTC' 
    ? ['BTC Network', 'Lightning Network'] 
    : ['Tron (TRC20)', 'Ethereum (ERC20)', 'BSC (BEP20)']

  const handleAssetChange = (selectedAsset: CryptoAsset) => {
    setAsset(selectedAsset)
    setNetwork(selectedAsset === 'BTC' ? 'BTC Network' : 'Tron (TRC20)')
  }

  const isFormValid = () => {
    const numAmount = parseFloat(amount)
    return address.trim().length >= 26 && numAmount > 0 && numAmount <= activeBalance
  }

  const handleContinue = () => {
    if (isFormValid()) setStep('preview')
  }

  const handleConfirm = async () => {
    if (checkSuspension()) return
    setLoadingOtp(true)
    setOtpError('')
    try {
      const emailToSend = userEmail || 'demo.customer@nbb.co.uk'
      const success = await generateAndSendOTP(emailToSend)
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

    const emailToVerify = userEmail || 'demo.customer@nbb.co.uk'
    const isValid = await verifyOTP(emailToVerify, code)

    if (isValid) {
      try {
        const withdrawAmount = parseFloat(amount)

        if (isSupabaseConfigured() && userId) {
          const balanceColumn = source === 'savings' ? 'savings_balance' : 'balance'
          const { data: profile } = await supabase
            .from('profiles_nbb')
            .select(balanceColumn)
            .eq('id', userId)
            .single()

          const currentBal = parseFloat((profile as any)?.[balanceColumn] || '0')
          if (currentBal < withdrawAmount) {
            setOtpError('Insufficient funds to complete this withdrawal.')
            setVerifying(false)
            return
          }

          const newBal = currentBal - withdrawAmount

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
              description: `Crypto Withdrawal (${asset}): ${cryptoEquiv.toFixed(6)} ${asset} to ${address.slice(0, 6)}...${address.slice(-4)} (${network})`,
              category: 'Withdrawals',
              amount: -withdrawAmount,
              status: 'Pending'
            }])

          if (txnError) {
            console.error('Failed to log crypto transaction:', txnError)
          }

          // Refresh context balance
          await refreshProfile()
        }

        setStep('receipt')
      } catch (err: any) {
        setOtpError(err.message || 'An error occurred during verification.')
      }
    } else {
      setOtpError('Invalid OTP code. Please try again.')
    }
    setVerifying(false)
  }

  // Handle OTP digit changes
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])

    // Focus next input
    if (element.value !== '' && element.nextSibling) {
      ;(element.nextSibling as HTMLInputElement).focus()
    }
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && e.currentTarget.previousSibling) {
        ;(e.currentTarget.previousSibling as HTMLInputElement).focus()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden my-0 sm:my-8 min-h-screen sm:min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <div className="flex items-center space-x-2">
            {step !== 'form' && step !== 'receipt' && (
              <button 
                onClick={() => setStep(step === 'otp' ? 'preview' : 'form')}
                className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors mr-1"
              >
                <ChevronLeft size={18} className="text-[#64748B]" />
              </button>
            )}
            <h3 className="font-display text-lg text-[#0A1628]">
              {step === 'form' && 'Crypto Withdrawal'}
              {step === 'preview' && 'Review Withdrawal'}
              {step === 'otp' && 'Security Verification'}
              {step === 'receipt' && 'Transaction Receipt'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* Step 1: Input Form */}
        {step === 'form' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-2">Source Account</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as 'current' | 'savings')}
                className="w-full px-4 py-3 rounded-xl border border-light text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
              >
                <option value="current">Current Account ({cs}{userBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })})</option>
                <option value="savings">Savings Account ({cs}{savingsBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })})</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-2">Crypto Asset</label>
                <div className="flex space-x-2">
                  {(['BTC', 'USDT'] as CryptoAsset[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAssetChange(t)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        asset === t 
                          ? 'bg-[#610C04] border-[#610C04] text-white' 
                          : 'border-light text-[#64748B] hover:border-[#610C04] hover:text-[#610C04]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-2">Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-light text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                >
                  {networks.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-2">Recipient Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={asset === 'BTC' ? 'e.g. 1A1zP1eP5QGefi2DMPTfTL5...' : 'e.g. TXx1... or 0x71C...' }
                className="w-full px-4 py-3 rounded-xl border border-light text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04] font-mono"
              />
              <span className="text-[10px] text-[#64748B] mt-1 block">Ensure the address matches the selected network to avoid permanent loss of funds.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1628] uppercase tracking-wider mb-2">Withdraw Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] text-lg">{cs}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-16 py-3 rounded-xl border border-light text-base font-semibold text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">{currency.code}</span>
              </div>
              {parseFloat(amount || '0') > activeBalance && (
                <span className="text-xs text-[#EF4444] mt-1 block font-medium">Insufficient balance in selected account.</span>
              )}
              {parseFloat(amount || '0') > 0 && parseFloat(amount || '0') <= activeBalance && (
                <div className="mt-2 p-3 bg-slate-50 border border-light rounded-xl flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">Estimated Cryptopayout</span>
                  <span className="text-xs font-bold text-[#0A1628]">{cryptoEquiv.toFixed(6)} {asset}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleContinue}
              disabled={!isFormValid()}
              className="w-full btn-primary py-3.5 disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
            >
              <span>Continue</span><ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Review/Confirm */}
        {step === 'preview' && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-[#64748B]">Please verify the withdrawal details carefully.</p>
            
            <div className="bg-[#F8FAFC] border border-light rounded-2xl p-5 space-y-4">
              <div className="text-center pb-4 border-b border-light/50">
                <p className="text-xs text-[#64748B]">Withdrawal Amount</p>
                <p className="font-display text-3xl text-[#0A1628] mt-1">{cs}{parseFloat(amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs font-semibold text-[#610C04] mt-1">≈ {cryptoEquiv.toFixed(6)} {asset}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-[#64748B]">Crypto Asset</span><span className="font-semibold text-[#0A1628]">{asset}</span></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Blockchain Network</span><span className="font-semibold text-[#0A1628]">{network}</span></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Source Wallet</span><span className="font-semibold text-[#0A1628] capitalize">{source} Account</span></div>
                <div className="flex justify-between items-start"><span className="text-[#64748B] mr-4">Recipient Address</span><span className="font-mono font-semibold text-[#0A1628] text-right break-all max-w-[200px]">{address}</span></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Processing Fee</span><span className="font-semibold text-[#10B981]">Free (Covered by NBB)</span></div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loadingOtp}
              className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2"
            >
              {loadingOtp ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={16} />
                  <span>Confirm & Send OTP</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 'otp' && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-light flex items-center justify-center mx-auto text-[#610C04]">
                <Shield size={24} />
              </div>
              <p className="font-display text-lg text-[#0A1628]">Enter Security Code</p>
              <p className="text-xs text-[#64748B] leading-relaxed">
                An 8-digit verification code has been sent to your registered email address <span className="font-semibold text-[#0A1628]">{userEmail || 'your email'}</span>.
              </p>
            </div>

            <div className="flex justify-between gap-1.5 max-w-xs mx-auto">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-9 h-12 text-center rounded-lg border border-light text-[#0A1628] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-center text-xs font-semibold text-[#EF4444]">{otpError}</p>
            )}

            <button
              onClick={handleOtpVerify}
              disabled={otp.some(d => d === '') || verifying}
              className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2"
            >
              {verifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Confirm Payment</span>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Receipt */}
        {step === 'receipt' && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-500">
              <Clock size={32} className="animate-pulse" />
            </div>

            <div>
              <h4 className="font-display text-2xl text-[#0A1628] mb-1">Withdrawal Pending</h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Your crypto withdrawal request of <span className="font-semibold text-[#0A1628]">{cryptoEquiv.toFixed(6)} {asset} ({cs}{parseFloat(amount).toFixed(2)})</span> has been submitted successfully and is currently pending security approval.
              </p>
            </div>

            <div className="bg-[#F8FAFC] border border-light rounded-xl p-4 text-left text-[11px] space-y-2">
              <div className="flex justify-between"><span className="text-[#64748B]">Transaction Status</span><span className="font-bold text-amber-500 flex items-center"><Clock size={10} className="mr-1" /> Pending Approval</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Recipient Wallet</span><span className="font-mono font-medium text-[#0A1628]">{address.slice(0, 8)}...{address.slice(-6)}</span></div>
              <div className="flex justify-between"><span className="text-[#64748B]">Network</span><span className="font-semibold text-[#0A1628]">{network}</span></div>
            </div>

            <button onClick={onClose} className="w-full btn-primary py-3.5">
              Done & Return
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
