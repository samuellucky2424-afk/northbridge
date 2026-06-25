import { useState } from 'react'
import { X, ArrowRight, Check, CreditCard, Landmark, Wallet } from 'lucide-react'

interface AddMoneyModalProps {
  onClose: () => void
  currencySymbol: string
}

export default function AddMoneyModal({ onClose, currencySymbol }: AddMoneyModalProps) {
  const [step, setStep] = useState<'amount' | 'method' | 'confirm' | 'success'>('amount')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')

  const methods = [
    { id: 'bank', label: 'Bank Transfer', desc: 'Transfer from another bank account', icon: Landmark },
    { id: 'card', label: 'Debit Card', desc: 'Instant deposit via card', icon: CreditCard },
    { id: 'wallet', label: 'Digital Wallet', desc: 'Apple Pay or Google Pay', icon: Wallet },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden my-0 sm:my-8 min-h-screen sm:min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <h3 className="font-display text-lg text-[#0A1628]">
            {step === 'amount' && 'Add Money'}
            {step === 'method' && 'Choose Method'}
            {step === 'confirm' && 'Confirm Deposit'}
            {step === 'success' && 'Deposit Successful'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {step === 'amount' && (
          <div className="p-6 space-y-5">
            <p className="text-sm text-[#64748B]">How much would you like to deposit?</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[#64748B] font-light">{currencySymbol}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-light text-3xl font-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['50', '100', '250', '500', '1000'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="px-4 py-2 rounded-lg border border-light text-sm text-[#64748B] hover:border-[#D31111] hover:text-[#D31111] transition-all"
                >
                  {currencySymbol}{preset}
                </button>
              ))}
            </div>
            <button
              onClick={() => amount && setStep('method')}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full btn-primary py-3.5 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>Continue</span><ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 'method' && (
          <div className="p-6 space-y-3">
            <p className="text-sm text-[#64748B] mb-2">Select how you want to add money:</p>
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => { setMethod(m.id); setStep('confirm'); }}
                className="w-full flex items-center space-x-4 p-4 rounded-xl border border-light hover:border-[#D31111] hover:bg-[#FEE2E2]/20 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                  <m.icon size={22} className="text-[#D31111]" />
                </div>
                <div>
                  <p className="font-medium text-[#0A1628]">{m.label}</p>
                  <p className="text-xs text-[#64748B]">{m.desc}</p>
                </div>
                <ArrowRight size={18} className="text-[#64748B] ml-auto" />
              </button>
            ))}
            <button
              onClick={() => setStep('amount')}
              className="w-full py-3 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition-colors mt-3"
            >
              Back
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-6 space-y-4">
            <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-3">
              <div className="flex justify-between py-2 border-b border-light/50">
                <span className="text-sm text-[#64748B]">Amount</span>
                <span className="text-lg font-medium text-[#0A1628]">{currencySymbol}{parseFloat(amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-light/50">
                <span className="text-sm text-[#64748B]">Method</span>
                <span className="text-sm text-[#0A1628]">{methods.find(m => m.id === method)?.label}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-light/50">
                <span className="text-sm text-[#64748B]">Fee</span>
                <span className="text-sm text-[#10B981]">Free</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-[#64748B]">To</span>
                <span className="text-sm text-[#0A1628]">Current Account</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setStep('method')} className="flex-1 py-3 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition-colors">
                Back
              </button>
              <button onClick={() => setStep('success')} className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2">
                <span>Confirm Deposit</span>
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto">
              <Check size={32} className="text-[#10B981]" />
            </div>
            <div>
              <p className="font-display text-2xl text-[#0A1628] mb-1">Money Added</p>
              <p className="text-sm text-[#64748B]">{currencySymbol}{parseFloat(amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })} has been added to your Current Account</p>
            </div>
            <button onClick={onClose} className="w-full btn-primary py-3.5">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
