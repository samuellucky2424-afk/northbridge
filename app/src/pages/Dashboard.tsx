import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import {
  ArrowUpRight, Send, Plus, Snowflake, Receipt,
  TrendingUp, CreditCard, Wallet, Landmark, HelpCircle,
  ChevronRight, Lock, Eye, ShieldCheck, RefreshCw, Settings,
  Bell, Menu, X, Phone, Mail, MapPin, Clock, Check
} from 'lucide-react'
import NumberTicker from '../components/NumberTicker'
import Sparkline from '../components/Sparkline'
import TransferModal from '../components/TransferModal'
import AddMoneyModal from '../components/AddMoneyModal'
import SettingsPanel from '../components/SettingsPanel'
import NotificationPanel from '../components/NotificationPanel'

/* ─── Toast ─── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  setTimeout(onClose, 3000)
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#0A1628] text-white px-5 py-3 rounded-xl shadow-lg flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center flex-shrink-0">
        <CheckIcon />
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/60 hover:text-white"><X size={14} /></button>
    </div>
  )
}
function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

/* ─── Dashboard Navigation ─── */
function DashboardNav({ onSettings, onNotifications, onMenuToggle, menuOpen }: {
  onSettings: () => void; onNotifications: () => void; onMenuToggle: () => void; menuOpen: boolean
}) {
  const { logout, userName } = useAuth()
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
              {menuOpen ? <X size={22} className="text-[#0A1628]" /> : <Menu size={22} className="text-[#0A1628]" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#D31111] flex items-center justify-center">
                <span className="text-white font-display text-[10px]">NBB</span>
              </div>
              <span className="font-display text-lg text-[#0A1628] hidden sm:block">North Bridge Bank</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button onClick={onSettings} className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors" title="Settings">
              <Settings size={20} className="text-[#64748B]" />
            </button>
            <button onClick={onNotifications} className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors" title="Notifications">
              <Bell size={20} className="text-[#64748B]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D31111] rounded-full" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                <span className="text-white text-xs font-medium">{(userName || 'S').charAt(0).toUpperCase()}</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-[#0A1628]">{userName || 'Sarah'}</span>
            </div>
            <button onClick={logout} className="hidden sm:block p-2 rounded-lg hover:bg-[#FEE2E2] transition-colors" title="Logout">
              <X size={18} className="text-[#64748B]" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ─── Mobile Menu ─── */
function MobileMenu({ onSettings, onClose }: { onSettings: () => void; onClose: () => void }) {
  const { logout, checkSuspension } = useAuth()
  const menuItems = [
    { label: 'Overview', icon: Landmark, path: '/dashboard' },
    { label: 'Accounts', icon: Wallet, path: '/dashboard/accounts' },
    { label: 'Payments', icon: Send, path: '/dashboard/payments' },
    { label: 'Cards', icon: CreditCard, path: '/dashboard/cards' },
    { label: 'Support', icon: HelpCircle, path: '/dashboard/support' },
    { label: 'Settings', icon: Settings, action: onSettings },
  ]
  return (
    <div className="fixed inset-0 z-45 lg:hidden" style={{ top: '64px' }}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 space-y-1">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            to={item.path || '#'}
            onClick={(e) => {
              if (checkSuspension()) {
                e.preventDefault()
                onClose()
                return
              }
              item.action?.()
              onClose()
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0A1628] transition-all text-left"
          >
            <item.icon size={20} /><span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        <div className="border-t border-light pt-3 mt-3">
          <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#D31111] hover:bg-[#FEE2E2] transition-all text-left">
            <X size={20} /><span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Transaction Receipt Modal ─── */
function TransactionReceiptModal({ txn, onClose, currencySymbol }: { txn: any; onClose: () => void; currencySymbol: string }) {
  if (!txn) return null
  const formattedDate = new Date(txn.rawDate || txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  const formattedTime = new Date(txn.rawDate || txn.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  
  const isPending = txn.status === 'Pending'
  const isReversed = txn.status === 'Reversed' || txn.status === 'Declined'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <h3 className="font-display text-lg text-[#0A1628]">Transaction Receipt</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#F1F5F9] rounded-lg"><X size={20} className="text-[#64748B]" /></button>
        </div>
        
        <div className="p-6">
          <div className="border-2 rounded-2xl overflow-hidden shadow-soft bg-white" style={{ borderColor: isPending ? '#F59E0B' : isReversed ? '#EF4444' : '#10B981' }}>
            <div className="px-6 py-4 flex items-center justify-between text-white" style={{ backgroundColor: isPending ? '#F59E0B' : isReversed ? '#EF4444' : '#10B981' }}>
              <div className="flex items-center space-x-2">
                {isPending ? <Clock size={20} /> : <Check size={20} />}
                <span className="font-medium text-sm">
                  {isPending ? 'Transfer Pending Approval' : isReversed ? 'Transfer Declined/Reversed' : 'Sent Successfully'}
                </span>
              </div>
              <span className="text-white/80 text-[10px] font-mono">{txn.id?.slice(0, 8).toUpperCase() || 'NBB-TXN'}</span>
            </div>

            <div className="p-6 space-y-4 bg-slate-50/50">
              <div className="text-center mb-4">
                <p className="text-xs text-[#64748B]">Amount</p>
                <p className="font-display text-3xl text-[#0A1628]">{txn.amount > 0 ? '+' : ''}{currencySymbol}{txn.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="border-t border-light pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-[#64748B]">Status</span>
                  <span className="text-sm font-semibold" style={{ color: isPending ? '#D97706' : isReversed ? '#EF4444' : '#10B981' }}>
                    {txn.status || 'Completed'}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-xs text-[#64748B]">Description</span><span className="text-sm font-medium text-[#0A1628] text-right max-w-[200px] break-words">{txn.desc}</span></div>
                <div className="flex justify-between"><span className="text-xs text-[#64748B]">Category</span><span className="text-sm text-[#0A1628]">{txn.cat || 'Transfers'}</span></div>
                <div className="flex justify-between"><span className="text-xs text-[#64748B]">Date</span><span className="text-sm text-[#0A1628]">{formattedDate}</span></div>
                <div className="flex justify-between"><span className="text-xs text-[#64748B]">Time</span><span className="text-sm text-[#0A1628]">{formattedTime}</span></div>
              </div>

              {isPending && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                  <p className="text-[10px] text-amber-800 leading-normal">This transaction is currently pending administrative approval. The funds are held and will reflect once approved.</p>
                </div>
              )}

              <div className="border-t border-light pt-4 flex items-center justify-center space-x-2">
                <ShieldCheck size={14} className="text-[#10B981]" />
                <span className="text-[10px] text-[#64748B]">Verified by North Bridge Bank Security</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button onClick={() => window.print()} className="w-full py-3 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9] transition-colors">
              Print Receipt
            </button>
            <button onClick={onClose} className="w-full btn-primary py-3.5">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Overview Page ─── */
function Overview() {
  const { userName, currency, userId, userBalance, savingsBalance, checkSuspension } = useAuth()
  const cs = currency.symbol
  const [showTransfer, setShowTransfer] = useState(false)
  const [showAddMoney, setShowAddMoney] = useState(false)
  const [cardFrozen, setCardFrozen] = useState(false)
  const [showPayBills, setShowPayBills] = useState(false)
  const [toast, setToast] = useState('')
  const [billForm, setBillForm] = useState({ provider: '', accountRef: '', amount: '' })
  const [selectedTxn, setSelectedTxn] = useState<any>(null)

  const [transactions, setTransactions] = useState<any[]>([
    { date: 'Today', desc: `Tesco Superstore`, cat: 'Groceries', amount: -47.32, status: 'Completed' },
    { date: 'Today', desc: `Salary — North Bridge Bank Ltd`, cat: 'Income', amount: 3250.00, status: 'Completed' },
    { date: 'Yesterday', desc: `Netflix`, cat: 'Entertainment', amount: -10.99, status: 'Completed' },
    { date: 'Yesterday', desc: `Uber`, cat: 'Transport', amount: -12.40, status: 'Completed' },
    { date: '24 Jun', desc: `Pizza Express`, cat: 'Dining', amount: -34.50, status: 'Completed' },
  ])

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return

    async function loadTransactions() {
      const { data, error } = await supabase
        .from('transactions_nbb')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10)

      if (!error) {
        setTransactions(data && data.length > 0 ? data.map((txn: any) => ({
          id: txn.id,
          date: new Date(txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          rawDate: txn.date,
          desc: txn.description,
          cat: txn.category,
          amount: parseFloat(txn.amount),
          status: txn.status || 'Completed'
        })) : [])
      }
    }

    loadTransactions()
  }, [userId])

  const showToast = (msg: string) => setToast(msg)

  const balances = [
    { label: 'Total Balance', value: userBalance + savingsBalance, change: '+2.4%', changeLabel: 'this month', type: 'total' as const },
    { label: 'Current Account', value: userBalance, type: 'current' as const },
    { label: 'Savings', value: savingsBalance, rate: '4.2% AER', type: 'savings' as const },
  ]

  const navShortcuts = [
    { label: 'Accounts', icon: Wallet, color: '#D31111', bg: '#FEE2E2', path: '/dashboard/accounts' },
    { label: 'Payments', icon: Send, color: '#0A1628', bg: '#F1F5F9', path: '/dashboard/payments' },
    { label: 'Cards', icon: CreditCard, color: '#D31111', bg: '#FEE2E2', path: '/dashboard/cards' },
    { label: 'Support', icon: HelpCircle, color: '#0A1628', bg: '#F1F5F9', path: '/dashboard/support' },
  ]

  const quickActions = [
    { label: 'Send money', icon: Send, action: () => { if (checkSuspension()) return; setShowTransfer(true); } },
    { label: 'Add money', icon: Plus, action: () => { if (checkSuspension()) return; setShowAddMoney(true); } },
    { label: cardFrozen ? 'Unfreeze card' : 'Freeze card', icon: Snowflake, action: () => { if (checkSuspension()) return; setCardFrozen(!cardFrozen); showToast(cardFrozen ? 'Card unfrozen successfully' : 'Card frozen successfully'); } },
    { label: 'Pay bills', icon: Receipt, action: () => { if (checkSuspension()) return; setShowPayBills(true); } },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-[#0A1628]">Overview</h1>
        <p className="text-[#64748B] mt-1 text-sm sm:text-base">Welcome back, {userName || 'Sarah'}</p>
      </div>

      {/* BALANCE CARDS — Horizontally swipeable */}
      <div className="relative -mx-4 sm:-mx-0">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-0 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {balances.map((b, i) => (
            <div key={i} className="snap-start flex-shrink-0 w-[85vw] sm:w-[calc(33.333%-11px)] bg-white border border-light rounded-2xl p-5 sm:p-6 hover:shadow-soft transition-all">
              <p className="text-xs sm:text-sm text-[#64748B] mb-2">{b.label}</p>
              <p className="text-2xl sm:text-3xl font-light text-[#0A1628] mb-1">
                <NumberTicker value={b.value} prefix={cs} decimals={2} duration={1200} />
              </p>
              {b.change && (
                <div className="flex items-center space-x-1">
                  <ArrowUpRight size={14} className="text-[#10B981]" />
                  <span className="text-xs sm:text-sm text-[#10B981] font-medium">{b.change}</span>
                  <span className="text-xs text-[#64748B]">{b.changeLabel}</span>
                </div>
              )}
              {b.rate && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#FEE2E2] text-[#D31111] text-xs font-medium rounded-md">{b.rate}</span>
              )}
              {b.type === 'current' && (
                <div className="flex space-x-2 mt-4">
                  <button onClick={() => { if (checkSuspension()) return; setShowTransfer(true); }} className="btn-outline text-xs py-2 px-3"><Send size={12} className="mr-1" /> Send</button>
                  <button onClick={() => { if (checkSuspension()) return; setShowAddMoney(true); }} className="btn-outline text-xs py-2 px-3"><Plus size={12} className="mr-1" /> Add</button>
                </div>
              )}
              <div className="mt-4"><Sparkline className="w-full" /></div>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-1.5 mt-2 sm:hidden">
          {balances.map((_, i) => (<div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D31111]/30" />))}
        </div>
      </div>

      {/* NAV SHORTCUTS */}
      <div className="grid grid-cols-4 gap-3">
        {navShortcuts.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            onClick={(e) => {
              if (checkSuspension()) {
                e.preventDefault()
              }
            }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-light rounded-2xl hover:shadow-soft hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: item.bg }}>
              <item.icon size={20} style={{ color: item.color }} />
            </div>
            <span className="text-xs font-medium text-[#0A1628] group-hover:text-[#D31111] transition-colors">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <button key={i} onClick={action.action} className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white border border-light rounded-2xl hover:bg-[#D31111] hover:text-white hover:border-[#D31111] group transition-all duration-200">
            <action.icon size={22} className="text-[#D31111] group-hover:text-white mb-2 transition-colors" />
            <span className="text-xs sm:text-sm font-medium text-[#0A1628] group-hover:text-white transition-colors">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Freeze card banner */}
      {cardFrozen && (
        <div className="bg-[#FEE2E2] border border-[#D31111]/20 rounded-2xl p-4 flex items-center space-x-3">
          <Snowflake size={20} className="text-[#D31111] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0A1628]">Your card is currently frozen</p>
            <p className="text-xs text-[#64748B]">All card transactions are blocked. Click "Unfreeze card" above to restore.</p>
          </div>
          <button onClick={() => { setCardFrozen(false); showToast('Card unfrozen successfully'); }} className="px-4 py-2 bg-[#D31111] text-white rounded-xl text-xs font-medium hover:bg-[#0A1628] transition-colors">
            Unfreeze
          </button>
        </div>
      )}

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white border border-light rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-light">
          <h2 className="font-display text-lg sm:text-xl text-[#0A1628]">Recent transactions</h2>
          <span className="text-xs sm:text-sm text-[#D31111] hover:underline cursor-pointer font-medium">View all</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="text-left text-[10px] sm:text-xs text-[#64748B] uppercase tracking-wider border-b border-light">
                <th className="px-4 sm:px-6 py-3 font-medium">Date</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Description</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Category</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-8 text-center text-sm text-[#64748B]">
                    No transactions yet. Send money to get started!
                  </td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr key={i} onClick={() => setSelectedTxn(t)} className="hover:bg-[#F1F5F9] transition-colors cursor-pointer border-b border-light/50 last:border-0">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#64748B]">{t.date}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-[#0A1628]">{t.desc}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="inline-block px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] text-[10px] sm:text-xs rounded-md">{t.cat}</span>
                      {t.status && t.status !== 'Completed' && (
                        <span className={`ml-2 inline-block px-1.5 py-0.5 text-[9px] font-medium rounded ${
                          t.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          t.status === 'Reversed' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {t.status}
                        </span>
                      )}
                    </td>
                    <td className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-right ${t.amount > 0 ? 'text-[#10B981]' : 'text-[#0A1628]'}`}>
                      {t.amount > 0 ? '+' : ''}{cs}{Math.abs(t.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} />}
      {showAddMoney && <AddMoneyModal onClose={() => setShowAddMoney(false)} currencySymbol={cs} />}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
      {selectedTxn && <TransactionReceiptModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} currencySymbol={cs} />}

      {/* Pay Bills Modal */}
      {showPayBills && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden my-0 sm:my-8 min-h-screen sm:min-h-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light">
              <h3 className="font-display text-lg text-[#0A1628]">Pay a Bill</h3>
              <button onClick={() => setShowPayBills(false)} className="p-1 hover:bg-[#F1F5F9] rounded-lg"><X size={20} className="text-[#64748B]" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Bill Provider <span className="text-[#D31111]">*</span></label>
                <select value={billForm.provider} onChange={(e) => setBillForm({ ...billForm, provider: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] bg-white">
                  <option value="">Select provider</option>
                  <option>British Gas</option>
                  <option>EDF Energy</option>
                  <option>Thames Water</option>
                  <option>Virgin Media</option>
                  <option>BT</option>
                  <option>Sky</option>
                  <option>TV Licence</option>
                  <option>Council Tax</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Account Reference <span className="text-[#D31111]">*</span></label>
                <input type="text" value={billForm.accountRef} onChange={(e) => setBillForm({ ...billForm, accountRef: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" placeholder="Account number or reference" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Amount ({cs}) <span className="text-[#D31111]">*</span></label>
                <input type="number" value={billForm.amount} onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" placeholder="0.00" />
              </div>
              <button
                onClick={() => { if (billForm.provider && billForm.accountRef && billForm.amount) { setShowPayBills(false); showToast(`Bill payment of ${cs}${parseFloat(billForm.amount).toFixed(2)} to ${billForm.provider} successful`); setBillForm({ provider: '', accountRef: '', amount: '' }); } }}
                disabled={!billForm.provider || !billForm.accountRef || !billForm.amount}
                className="w-full btn-primary py-3.5 disabled:opacity-50"
              >
                Pay Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Accounts Page ─── */
function AccountsPage() {
  const { currency, userBalance, savingsBalance, accountNumber, checkSuspension, userId } = useAuth()
  const cs = currency.symbol
  const [expandedAccount, setExpandedAccount] = useState<number | null>(0)
  const [selectedTxn, setSelectedTxn] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([
    { desc: 'Tesco Superstore', amount: -47.32, date: 'Today', status: 'Completed' },
    { desc: 'Salary', amount: 3250.00, date: 'Today', status: 'Completed' },
    { desc: 'Netflix', amount: -10.99, date: 'Yesterday', status: 'Completed' }
  ])

  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return
    async function load() {
      const { data, error } = await supabase
        .from('transactions_nbb')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5)
      if (!error) {
        setTransactions(data && data.length > 0 ? data.map((t: any) => ({
          id: t.id,
          desc: t.description,
          amount: parseFloat(t.amount),
          date: new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          rawDate: t.date,
          status: t.status || 'Completed'
        })) : [])
      }
    }
    load()
  }, [userId])

  const displayAcctNumber = accountNumber ? `****${accountNumber.slice(-4)}` : '****4521'

  const accounts = [
    { name: 'Current Account', number: displayAcctNumber, sortCode: '20-00-00', iban: `GB29 NWBK 2000 00${accountNumber || '452100'} 11`, balance: userBalance, transactions: transactions },
    { name: 'Savings', number: '****8834', sortCode: '20-00-00', iban: 'GB29 NWBK 2000 0088 3400 22', balance: savingsBalance, transactions: [{ desc: 'Interest payment', amount: 72.15, date: '1 Jun' }, { desc: 'Transfer from Current', amount: 500.00, date: '23 Jun' }] },
    { name: 'Business Account', number: '****1290', sortCode: '20-00-01', iban: 'GB29 NWBK 2001 0012 9000 33', balance: 0.00, transactions: [] },
  ]
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-[#0A1628]">Accounts</h1>
        <p className="text-[#64748B] mt-1 text-sm">Manage your accounts and view details</p>
      </div>
      {accounts.map((acc, i) => (
        <div key={i} className="bg-white border border-light rounded-2xl overflow-hidden hover:shadow-soft transition-shadow">
          <button onClick={() => setExpandedAccount(expandedAccount === i ? null : i)} className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-[#F1F5F9]/50 transition-colors">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <Wallet size={18} className="text-[#D31111]" />
              </div>
              <div>
                <p className="font-medium text-[#0A1628] text-sm sm:text-base">{acc.name}</p>
                <p className="text-xs sm:text-sm text-[#64748B]">{acc.number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <p className="text-base sm:text-xl font-light text-[#0A1628]">{cs}{acc.balance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
              <ChevronRight size={18} className={`text-[#64748B] transition-transform flex-shrink-0 ${expandedAccount === i ? 'rotate-90' : ''}`} />
            </div>
          </button>
          {expandedAccount === i && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-5 border-t border-light">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4">
                <div><p className="text-[10px] sm:text-xs text-[#64748B] uppercase tracking-wider mb-1">Sort Code</p><p className="text-xs sm:text-sm font-medium text-[#0A1628]">{acc.sortCode}</p></div>
                <div><p className="text-[10px] sm:text-xs text-[#64748B] uppercase tracking-wider mb-1">IBAN</p><p className="text-xs sm:text-sm font-medium text-[#0A1628] break-all">{acc.iban}</p></div>
              </div>
              {acc.transactions.length > 0 && (
                <div>
                  <p className="text-[10px] sm:text-xs text-[#64748B] uppercase tracking-wider mb-2 sm:mb-3">Recent transactions</p>
                  <div className="space-y-2">
                    {acc.transactions.map((t, j) => (
                      <div key={j} onClick={() => setSelectedTxn(t)} className="flex items-center justify-between py-1.5 sm:py-2 hover:bg-[#F1F5F9]/30 px-2 rounded-lg cursor-pointer">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-[#0A1628]">{t.desc}</p>
                          <p className="text-[10px] sm:text-xs text-[#64748B] flex items-center space-x-2">
                            <span>{t.date}</span>
                            {t.status && t.status !== 'Completed' && (
                              <span className={`inline-block px-1.5 py-0.2 text-[8px] font-medium rounded ${
                                t.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                t.status === 'Reversed' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {t.status}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className={`text-xs sm:text-sm font-medium ${t.amount > 0 ? 'text-[#10B981]' : 'text-[#0A1628]'}`}>{t.amount > 0 ? '+' : ''}{cs}{Math.abs(t.amount).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={() => { if (checkSuspension()) return; }} className="w-full py-3 sm:py-4 rounded-2xl border-2 border-dashed border-light text-[#D31111] font-medium text-sm hover:bg-[#FEE2E2] hover:border-[#D31111] transition-all flex items-center justify-center space-x-2">
        <Plus size={18} /><span>Add new account</span>
      </button>
      {selectedTxn && <TransactionReceiptModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} currencySymbol={cs} />}
    </div>
  )
}

/* ─── Payments Page ─── */
function PaymentsPage() {
  const { checkSuspension } = useAuth()
  const [showTransfer, setShowTransfer] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const payees = [
    { name: 'James Wilson', account: '20-00-00 ****4521', recent: true },
    { name: 'Emma Thompson', account: '20-00-00 ****8834', recent: true },
    { name: 'Oliver Brown', account: '20-00-00 ****1290', recent: false },
    { name: 'Sophia Davis', account: '20-00-00 ****5567', recent: false },
    { name: 'William Clark', account: '20-00-00 ****9988', recent: false },
  ]
  const filtered = payees.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-[#0A1628]">Payments</h1>
        <p className="text-[#64748B] mt-1 text-sm">Send money to your payees</p>
      </div>
      <div className="bg-white border border-light rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-light text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" placeholder="Search payees..." />
          </div>
          <button onClick={() => { if (checkSuspension()) return; setShowTransfer(true); }} className="btn-primary py-3 px-4 sm:px-5 text-sm flex items-center justify-center space-x-2">
            <Send size={14} /><span>New payment</span>
          </button>
        </div>
        <div className="space-y-1 sm:space-y-2">
          {filtered.map((p, i) => (
            <div key={i} onClick={() => { if (checkSuspension()) return; setShowTransfer(true); }} className="flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-[#F1F5F9] transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-medium">{p.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#0A1628]">{p.name}</p>
                  <p className="text-[10px] sm:text-xs text-[#64748B]">{p.account}</p>
                </div>
              </div>
              {p.recent && <span className="text-[10px] sm:text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">Recent</span>}
            </div>
          ))}
        </div>
      </div>
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} />}
    </div>
  )
}

/* ─── Cards Page ─── */
function CardsPage() {
  const { checkSuspension, accountNumber } = useAuth()
  const [frozen, setFrozen] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => setToast(msg)

  const cardSuffix = accountNumber ? accountNumber.slice(-4) : '4521'

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-[#0A1628]">Cards</h1>
        <p className="text-[#64748B] mt-1 text-sm">Manage your cards and settings</p>
      </div>
      {frozen && (
        <div className="bg-[#FEE2E2] border border-[#D31111]/20 rounded-2xl p-4 flex items-center space-x-3">
          <Snowflake size={20} className="text-[#D31111] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0A1628]">Your card is currently frozen</p>
            <p className="text-xs text-[#64748B]">All card transactions are blocked.</p>
          </div>
          <button onClick={() => { if (checkSuspension()) return; setFrozen(false); showToast('Card unfrozen successfully'); }} className="px-4 py-2 bg-[#D31111] text-white rounded-xl text-xs font-medium hover:bg-[#0A1628] transition-colors">
            Unfreeze
          </button>
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border border-light rounded-2xl p-4 sm:p-6">
          <div className={`relative w-full aspect-[1.586/1] rounded-2xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 ${frozen ? 'opacity-60' : ''}`}>
            <div className="absolute inset-0 bg-[#0A1628]" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#D31111]" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#D31111]" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#D31111] flex items-center justify-center">
                  <span className="text-white font-display text-[8px] sm:text-[10px]">NBB</span>
                </div>
                <span className="text-white/80 font-display text-xs sm:text-sm">North Bridge Bank</span>
              </div>
              <CreditCard size={18} className="text-white/60" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-5 sm:w-10 sm:h-8 rounded bg-gradient-to-br from-yellow-200 to-yellow-400" />
              </div>
              <p className="text-white text-sm sm:text-lg tracking-widest font-mono mb-3 sm:mb-4">**** **** **** {cardSuffix}</p>
              <div className="flex items-center justify-between">
                <div><p className="text-white/60 text-[8px] sm:text-xs uppercase">Card holder</p><p className="text-white text-[10px] sm:text-sm font-medium">SARAH MILLER</p></div>
                <div><p className="text-white/60 text-[8px] sm:text-xs uppercase">Expires</p><p className="text-white text-[10px] sm:text-sm font-medium">09/28</p></div>
                <div><p className="text-white/60 text-[8px] sm:text-xs uppercase">CVV</p><p className="text-white text-[10px] sm:text-sm font-medium flex items-center">{showPin ? '342' : '***'}<button onClick={() => { if (checkSuspension()) return; setShowPin(!showPin); }} className="ml-1 text-white/60 hover:text-white">{showPin ? <Eye size={12} /> : <Lock size={12} />}</button></p></div>
              </div>
            </div>
            {frozen && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
                <div className="text-center">
                  <Snowflake size={32} className="text-white mx-auto mb-2" />
                  <p className="text-white font-display text-lg sm:text-xl">Card Frozen</p>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button onClick={() => { if (checkSuspension()) return; setFrozen(!frozen); showToast(frozen ? 'Card unfrozen successfully' : 'Card frozen successfully'); }} className={`flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 rounded-xl border transition-all text-xs sm:text-sm ${frozen ? 'border-[#10B981] text-[#10B981] hover:bg-[#10B981]/5' : 'border-light text-[#64748B] hover:border-[#D31111] hover:text-[#D31111]'}`}>
              <Snowflake size={14} /><span>{frozen ? 'Unfreeze' : 'Freeze'}</span>
            </button>
            <button onClick={() => { if (checkSuspension()) return; }} className="flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 rounded-xl border border-light text-[#64748B] hover:border-[#D31111] hover:text-[#D31111] transition-all text-xs sm:text-sm">
              <RefreshCw size={14} /><span>Replace</span>
            </button>
          </div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {[{ icon: Lock, label: 'Change PIN', desc: 'Update your card PIN' }, { icon: ShieldCheck, label: 'Report lost or stolen', desc: 'Get a replacement card' }, { icon: TrendingUp, label: 'Spending limits', desc: 'Set daily transaction limits' }, { icon: Eye, label: 'Online purchases', desc: 'Toggle online payments' }].map((action, i) => (
            <button key={i} onClick={() => { if (checkSuspension()) return; }} className="w-full flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-white border border-light rounded-2xl hover:shadow-soft transition-all text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                <action.icon size={16} className="text-[#D31111]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[#0A1628]">{action.label}</p>
                <p className="text-[10px] sm:text-xs text-[#64748B]">{action.desc}</p>
              </div>
              <ChevronRight size={16} className="text-[#64748B] flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}

/* ─── Support Page ─── */
function SupportPage() {
  const { checkSuspension } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatText, setChatText] = useState('')
  const faqs = [
    { q: 'How do I reset my password?', a: 'Go to Settings > Security and select "Change password". You\'ll need to verify your identity via email or SMS.' },
    { q: 'What are the transfer limits?', a: 'Daily transfer limit is \u00A325,000 for personal accounts and \u00A3100,000 for business accounts.' },
    { q: 'How do I freeze my card?', a: 'Go to the Cards section and tap the "Freeze" button. You can unfreeze it at any time instantly.' },
    { q: 'Is my money protected?', a: 'Yes, North Bridge Bank is FCA regulated and your deposits are protected up to \u00A385,000 by the FSCS.' },
    { q: 'How do I close my account?', a: 'Please contact our support team via live chat or call us on 0800 123 4567.' },
  ]
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-[#0A1628]">Support</h1>
        <p className="text-[#64748B] mt-1 text-sm">How can we help you today?</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[{ icon: Phone, label: 'Call us', value: '0800 123 4567' }, { icon: Mail, label: 'Email us', value: 'support@northbridgebank.co.uk' }, { icon: MapPin, label: 'Find a branch', value: '24 locations' }, { icon: Clock, label: 'Branch Hours', value: 'Mon-Fri 9-5' }].map((c, i) => (
          <div key={i} className="bg-white border border-light rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mb-2 sm:mb-3">
              <c.icon size={18} className="text-[#D31111]" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#0A1628]">{c.label}</p>
            <p className="text-[10px] sm:text-xs text-[#64748B]">{c.value}</p>
          </div>
        ))}
      </div>
      <button onClick={() => { if (checkSuspension()) return; setChatOpen(!chatOpen); }} className="w-full btn-primary py-3 sm:py-4 flex items-center justify-center space-x-2 text-sm sm:text-base">
        <HelpCircle size={18} /><span>Start live chat</span>
      </button>
      {chatOpen && (
        <div className="bg-white border border-light rounded-2xl p-4 sm:p-6 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#10B981] flex items-center justify-center"><HelpCircle size={14} className="text-white" /></div>
              <div><p className="text-xs sm:text-sm font-medium text-[#0A1628]">Live Chat</p><p className="text-[10px] sm:text-xs text-[#10B981]">Online</p></div>
            </div>
            <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-[#F1F5F9] rounded-lg"><X size={16} className="text-[#64748B]" /></button>
          </div>
          <div className="bg-[#F1F5F9] rounded-xl p-3 sm:p-4 mb-3 sm:mb-4"><p className="text-xs sm:text-sm text-[#64748B]">Hello! How can I help you today?</p></div>
          <div className="flex space-x-2">
            <input type="text" value={chatText} onChange={(e) => setChatText(e.target.value)} className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-light text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" placeholder="Type your message..." />
            <button onClick={() => { if (checkSuspension()) return; setChatText(''); }} className="btn-primary px-3 sm:px-4"><Send size={16} /></button>
          </div>
        </div>
      )}
      <div className="bg-white border border-light rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-light">
          <h2 className="font-display text-lg sm:text-xl text-[#0A1628]">Frequently asked questions</h2>
        </div>
        <div className="divide-y divide-light">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-[#F1F5F9]/50 transition-colors">
                <span className="text-xs sm:text-sm font-medium text-[#0A1628] pr-4">{faq.q}</span>
                <ChevronRight size={16} className={`text-[#64748B] flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === i && <div className="px-4 sm:px-6 pb-3 sm:pb-4"><p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Dashboard Layout ─── */
export default function Dashboard() {
  const [showSettings, setShowSettings] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { userName, checkSuspension } = useAuth()

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNav
        onSettings={() => { if (checkSuspension()) return; setShowSettings(true); }}
        onNotifications={() => { if (checkSuspension()) return; setShowNotifications(true); }}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        menuOpen={mobileMenuOpen}
      />
      {mobileMenuOpen && <MobileMenu onSettings={() => { if (checkSuspension()) return; setShowSettings(true); setMobileMenuOpen(false); }} onClose={() => setMobileMenuOpen(false)} />}
      <main className="pt-20 sm:pt-24 pb-12 px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="cards" element={<CardsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} userName={userName} />}
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
    </div>
  )
}
