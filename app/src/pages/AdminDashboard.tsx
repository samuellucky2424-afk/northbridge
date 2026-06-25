import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import {
  LayoutDashboard, Users, Receipt, BarChart3,
  Search, ChevronLeft, ChevronRight, Bell, LogOut,
  ArrowUpRight, ArrowDownRight, UserCheck,
  Clock, AlertTriangle, Download, Ban, Plus, Edit, Trash2, X
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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

/* ─── Admin Nav ─── */
function AdminNav() {
  const { logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#610C04] flex items-center justify-center">
              <span className="text-white font-display text-[10px]">NBB</span>
            </div>
            <span className="font-display text-xl text-[#0A1628]">North Bridge Bank</span>
            <span className="ml-2 px-2 py-0.5 bg-[#FEE2E2] text-[#610C04] text-xs font-medium rounded-md">Admin</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#610C04] bg-[#FEE2E2]'
                      : 'text-[#64748B] hover:text-[#0A1628] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <Bell size={20} className="text-[#64748B]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#610C04] rounded-full" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-[#FEE2E2] transition-colors"
              title="Logout"
            >
              <LogOut size={18} className="text-[#64748B]" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}



/* ─── Admin Overview ─── */
function AdminOverview() {
  const [userCount, setUserCount] = useState(0)
  const [activeToday, setActiveToday] = useState(0)
  const [pendingKyc, setPendingKyc] = useState(0)
  const [latestTxns, setLatestTxns] = useState<any[]>([])
  const [signupData, setSignupData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadStats() {
      setErrorMsg('')
      if (!isSupabaseConfigured()) {
        setErrorMsg('Supabase is not configured. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).')
        return
      }

      try {
        // Get profiles count and active/suspended counts
        const { data: profiles, error: pError } = await supabase
          .from('profiles_nbb')
          .select('created_at, status')
        
        if (pError) throw pError
        
        if (profiles) {
          setUserCount(profiles.length)
          setActiveToday(profiles.filter(p => p.status === 'active' || p.status === 'Active').length)
          setPendingKyc(profiles.filter(p => p.status === 'suspended' || p.status === 'Suspended').length)

          // Calculate signups for each day of the week (Mon-Sun)
          const daySignups = [0, 0, 0, 0, 0, 0, 0]
          profiles.forEach(p => {
            const date = new Date(p.created_at || Date.now())
            let dayIndex = date.getDay() - 1 // 0 = Mon, 6 = Sun
            if (dayIndex < 0) dayIndex = 6 // Sunday
            if (dayIndex >= 0 && dayIndex < 7) {
              daySignups[dayIndex]++
            }
          })
          setSignupData(daySignups)
        }

        // Get latest transactions
        const { data, error: tError } = await supabase
          .from('transactions_nbb')
          .select('id, description, category, amount, status, date, profiles_nbb(first_name, last_name, country)')
          .order('date', { ascending: false })
          .limit(5)
        
        if (tError) throw tError
        
        if (data) {
          setLatestTxns(data.map((t: any) => ({
            id: t.id.slice(0, 8).toUpperCase(),
            user: t.profiles_nbb ? `${t.profiles_nbb.first_name} ${t.profiles_nbb.last_name}` : 'NBB Customer',
            desc: t.description,
            amount: parseFloat(t.amount),
            status: t.status,
            currencySymbol: t.profiles_nbb ? getCurrency(t.profiles_nbb.country || 'United Kingdom').symbol : '\u00A3',
            date: new Date(t.date).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
          })))
        }
      } catch (err: any) {
        console.error('Error loading stats:', err)
        setErrorMsg(`Failed to load database stats: ${err.message}`)
      }
    }

    loadStats()
  }, [])

  const stats = [
    { label: 'Total Registered Users', value: userCount, change: 'Live', icon: Users, color: '#0A1628' },
    { label: 'Active Users', value: activeToday, change: 'Live', icon: UserCheck, color: '#10B981' },
    { label: 'Suspended Accounts', value: pendingKyc, change: 'Live', icon: Clock, color: '#F53D0702' },
    { label: 'Pending Approvals', value: latestTxns.filter(t => t.status === 'Pending').length, change: 'Live', icon: AlertTriangle, color: '#610C04' },
  ]

  const dailyUsers = [Math.round(activeToday * 0.5), Math.round(activeToday * 0.6), Math.round(activeToday * 0.7), Math.round(activeToday * 0.8), Math.round(activeToday * 0.9), activeToday, activeToday]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const chartMax = Math.max(...dailyUsers, 1)
  const newSignups = signupData

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl text-[#0A1628]">Dashboard Overview</h1>
        <p className="text-[#64748B] mt-1">Real-time system metrics</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444] mb-6">
          {errorMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-light rounded-2xl p-6 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-[#10B981]/10 text-[#10B981]">
                {s.change}
              </span>
            </div>
            <p className="text-3xl font-light text-[#0A1628] font-semibold">
              {s.value}
            </p>
            <p className="text-sm text-[#64748B] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white border border-light rounded-2xl p-6">
          <h3 className="font-display text-lg text-[#0A1628] mb-6">Daily Active Users</h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {dailyUsers.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center">
                  <div
                    className="w-8 rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${(val / chartMax) * 160}px`,
                      backgroundColor: i === dailyUsers.length - 1 ? '#610C04' : '#E2E8F0',
                    }}
                  />
                </div>
                <span className="text-xs text-[#64748B] mt-2">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-light rounded-2xl p-6">
          <h3 className="font-display text-lg text-[#0A1628] mb-6">New Signups — Last 7 Days</h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {newSignups.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center">
                  <div
                    className="w-12 rounded-t-lg bg-[#610C04] transition-all duration-500"
                    style={{ height: `${(val / Math.max(...newSignups, 1)) * 160}px` }}
                  />
                </div>
                <span className="text-xs text-[#64748B] mt-2">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-light rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-light bg-slate-50/50">
          <h3 className="font-display text-lg text-[#0A1628]">Recent Transactions</h3>
          <Link to="/admin/transactions" className="text-sm text-[#610C04] hover:underline font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left text-xs text-[#64748B] uppercase tracking-wider border-b border-light">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {latestTxns.map((t, i) => (
                <tr key={i} className="hover:bg-[#F1F5F9] transition-colors border-b border-light/50 last:border-0">
                  <td className="px-6 py-4 text-sm text-[#64748B] font-mono">{t.id}</td>
                  <td className="px-6 py-4 text-sm text-[#0A1628] font-medium">{t.user}</td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{t.desc}</td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${t.amount > 0 ? 'text-[#10B981]' : 'text-[#0A1628]'}`}>
                    {t.amount > 0 ? '+' : ''}{t.currencySymbol || '\u00A3'}{Math.abs(t.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md ${
                      t.status === 'Completed' ? 'bg-[#10B981]/10 text-[#10B981]' :
                      t.status === 'Pending' ? 'bg-[#FEF3C7] text-[#D97706]' :
                      t.status === 'Flagged' ? 'bg-[#FEE2E2] text-[#610C04]' :
                      'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Users Page ─── */
function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  
  // Add Money Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [fundAmount, setFundAmount] = useState('')
  const [funding, setFunding] = useState(false)
  const [fundSuccess, setFundSuccess] = useState('')
  const [targetWallet, setTargetWallet] = useState<'current' | 'savings'>('current')
  const [targetAccountNumber, setTargetAccountNumber] = useState('')
  const [fundDescription, setFundDescription] = useState('Deposit Funds')
  const [fundDate, setFundDate] = useState(new Date().toISOString().slice(0, 16))

  // Edit User Modal states
  const [editingUser, setEditingUser] = useState<any>(null)
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    houseAddress: '',
    city: '',
    country: 'United Kingdom',
    postcode: '',
    occupation: '',
    incomeSource: ''
  })
  const [savingUser, setSavingUser] = useState(false)
  const [editUserSuccess, setEditUserSuccess] = useState('')

  const [errorMsg, setErrorMsg] = useState('')

  const loadUsers = async () => {
    setErrorMsg('')
    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase is not configured. Please check your environment variables.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles_nbb')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) throw error

      if (data) {
        setUsers(data.map(u => ({
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          name: `${u.first_name} ${u.last_name || ''}`,
          email: u.email,
          phone: u.phone,
          houseAddress: u.house_address,
          city: u.city,
          country: u.country || 'United Kingdom',
          postcode: u.postcode,
          occupation: u.occupation,
          incomeSource: u.income_source,
          status: u.status === 'suspended' ? 'Suspended' : 'Active',
          balance: parseFloat(u.balance || 0),
          savingsBalance: parseFloat(u.savings_balance || 0),
          joined: new Date(u.created_at || Date.now()).toISOString().slice(0, 10),
          kyc: 'Verified',
          account_number: u.account_number
        })))
      }
    } catch (err: any) {
      console.error('Error fetching users from Supabase:', err)
      setErrorMsg(`Failed to load users from Supabase: ${err.message}`)
    }
  }

  const handleEditUserClick = (u: any) => {
    setEditingUser(u)
    setEditUserForm({
      firstName: u.firstName || u.name.split(' ')[0] || '',
      lastName: u.lastName || u.name.split(' ')[1] || '',
      email: u.email || '',
      phone: u.phone || '',
      houseAddress: u.houseAddress || '',
      city: u.city || '',
      country: u.country || 'United Kingdom',
      postcode: u.postcode || '',
      occupation: u.occupation || '',
      incomeSource: u.incomeSource || ''
    })
    setEditUserSuccess('')
  }

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setSavingUser(true)
    setEditUserSuccess('')

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('profiles_nbb')
          .update({
            first_name: editUserForm.firstName,
            last_name: editUserForm.lastName,
            email: editUserForm.email,
            phone: editUserForm.phone,
            house_address: editUserForm.houseAddress,
            city: editUserForm.city,
            country: editUserForm.country,
            postcode: editUserForm.postcode,
            occupation: editUserForm.occupation,
            income_source: editUserForm.incomeSource
          })
          .eq('id', editingUser.id)

        if (error) throw error

        setEditUserSuccess('User profile updated successfully!')
        setTimeout(() => setEditingUser(null), 1500)
      } catch (err: any) {
        console.error('Update user profile failed:', err.message)
        setEditUserSuccess(`Error: ${err.message}`)
      } finally {
        setSavingUser(false)
        loadUsers()
      }
    } else {
      // Local fallback
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        firstName: editUserForm.firstName,
        lastName: editUserForm.lastName,
        name: `${editUserForm.firstName} ${editUserForm.lastName}`,
        email: editUserForm.email,
        phone: editUserForm.phone,
        houseAddress: editUserForm.houseAddress,
        city: editUserForm.city,
        country: editUserForm.country,
        postcode: editUserForm.postcode,
        occupation: editUserForm.occupation,
        incomeSource: editUserForm.incomeSource
      } : u))
      setEditUserSuccess('Simulated profile update successful!')
      setSavingUser(false)
      setTimeout(() => setEditingUser(null), 1500)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleSuspend = async (user: any) => {
    if (!isSupabaseConfigured()) {
      alert('Error: Supabase is not configured.')
      return
    }

    const nextStatus = user.status === 'Suspended' ? 'active' : 'suspended'
    const { error } = await supabase
      .from('profiles_nbb')
      .update({ status: nextStatus })
      .eq('id', user.id)

    if (error) {
      console.error('Error suspending user:', error.message)
      alert(`Error: ${error.message}`)
      return
    }

    loadUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Error: Supabase is not configured.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this user profile?')) return

    const { error } = await supabase
      .from('profiles_nbb')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting profile:', error.message)
      alert(`Error: ${error.message}`)
      return
    }

    loadUsers()
  }

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured()) {
      alert('Error: Supabase is not configured.')
      return
    }

    if (!targetAccountNumber || !fundAmount || parseFloat(fundAmount) <= 0) return
    setFunding(true)
    setFundSuccess('')

    const amount = parseFloat(fundAmount)
    const isSavings = targetWallet === 'savings'
    const formattedIsoDate = new Date(fundDate).toISOString()

    try {
      // Look up profile by account number
      const { data: profile, error: lookupError } = await supabase
        .from('profiles_nbb')
        .select('*')
        .eq('account_number', targetAccountNumber)
        .maybeSingle()

      if (lookupError || !profile) {
        throw new Error('Account number not found in database')
      }

      const currentVal = parseFloat(isSavings ? (profile.savings_balance || 0) : (profile.balance || 0))
      const newBal = currentVal + amount

      const updatePayload = isSavings 
        ? { savings_balance: newBal } 
        : { balance: newBal }

      // Update balance
      const { error: balanceError } = await supabase
        .from('profiles_nbb')
        .update(updatePayload)
        .eq('id', profile.id)

      if (balanceError) throw balanceError

      // Log transaction
      const { error: txnError } = await supabase
        .from('transactions_nbb')
        .insert([{
          user_id: profile.id,
          description: fundDescription || `Fund Credit (Admin Deposit - ${isSavings ? 'Savings' : 'Current'})`,
          category: 'Income',
          amount: amount,
          status: 'Completed',
          date: formattedIsoDate
        }])

      if (txnError) console.error('Error logging transaction:', txnError)

      const currencySymbol = getCurrency(profile.country || 'United Kingdom').symbol
      setFundSuccess(`Successfully credited ${currencySymbol}${amount.toFixed(2)} to ${profile.first_name} ${profile.last_name || ''}'s ${isSavings ? 'Savings' : 'Current'} wallet`)
      setFundAmount('')
      setFundDescription('Deposit Funds')
      setTimeout(() => setSelectedUser(null), 1500)
    } catch (err: any) {
      console.error('Funding failed:', err.message)
      setFundSuccess(`Error: ${err.message}`)
    } finally {
      setFunding(false)
      loadUsers()
    }
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.account_number.includes(search)
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const perPage = 5
  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[#0A1628]">User Management</h1>
        <p className="text-[#64748B] mt-1">View and manage customer accounts</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444]">
          {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
            placeholder="Search name, email, or account number..."
          />
        </div>
        <div className="flex items-center space-x-2">
          {['All', 'Active', 'Suspended'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-[#610C04] text-white'
                  : 'bg-white border border-light text-[#64748B] hover:border-[#610C04]'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedUser({ isManual: true, name: 'Manual Entry', balance: 0, savingsBalance: 0, country: 'United Kingdom' });
              setTargetAccountNumber('');
              setFundDescription('Salary Credit');
              setFundDate(new Date().toISOString().slice(0, 16));
              setTargetWallet('current');
              setFundSuccess('');
              setFundAmount('');
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#0A1628] text-white hover:bg-[#610C04] transition-all flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Manual Deposit</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-light rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-[#64748B] uppercase tracking-wider border-b border-light bg-slate-50/50">
                <th className="px-6 py-3.5 font-medium">User & Account</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Current Account</th>
                <th className="px-6 py-3.5 font-medium text-right">Savings</th>
                <th className="px-6 py-3.5 font-medium">Joined</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-[#F1F5F9] transition-colors border-b border-light/50 last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A1628] flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">{u.name.split(' ').map((n:any) => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A1628]">{u.name}</p>
                        <p className="text-xs text-[#64748B]">{u.email} &middot; <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{u.account_number}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md ${
                      u.status === 'Active' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FEE2E2] text-[#610C04]'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#0A1628] text-right">
                    {getCurrency(u.country).symbol}{u.balance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#64748B] text-right">
                    {getCurrency(u.country).symbol}{(u.savingsBalance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{u.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setTargetAccountNumber(u.account_number);
                          setFundDescription('Salary Credit');
                          setFundDate(new Date().toISOString().slice(0, 16));
                          setTargetWallet('current');
                          setFundSuccess('');
                          setFundAmount('');
                        }}
                        className="p-1.5 hover:bg-[#FEE2E2] text-[#610C04] rounded-lg transition-colors flex items-center space-x-1"
                        title="Add Money"
                      >
                        <Plus size={16} /> <span className="text-xs font-medium">Add Money</span>
                      </button>
                      <button
                        onClick={() => handleEditUserClick(u)}
                        className="p-1.5 hover:bg-slate-100 text-[#0A1628] rounded-lg transition-colors flex items-center"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleToggleSuspend(u)} className={`p-1.5 rounded-lg transition-colors flex items-center ${u.status === 'Suspended' ? 'hover:bg-green-50 text-[#10B981]' : 'hover:bg-red-50 text-[#EF4444]'}`} title={u.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}>
                        <Ban size={16} />
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 hover:bg-red-50 text-[#EF4444] rounded-lg transition-colors" title="Delete User">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light bg-slate-50/20">
          <p className="text-sm text-[#64748B]">
            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-light bg-white hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-[#0A1628] font-medium px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-light bg-white hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1628]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-light shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light">
              <h3 className="font-display text-lg text-[#0A1628]">Deposit Funds</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-[#F1F5F9] rounded-lg"><X size={20} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleAddFundsSubmit} className="p-6 space-y-4">
              {fundSuccess && (
                <div className={`p-3 border text-sm rounded-xl text-center ${
                  fundSuccess.startsWith('Error:') 
                    ? 'bg-red-50 border-red-100 text-[#EF4444]' 
                    : 'bg-green-50 border-green-100 text-[#10B981]'
                }`}>
                  {fundSuccess}
                </div>
              )}
              {selectedUser.isManual ? (
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Account Number</label>
                  <input
                    type="text"
                    value={targetAccountNumber}
                    onChange={(e) => setTargetAccountNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-light text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                    placeholder="Enter 8-digit account number"
                    maxLength={8}
                    required
                  />
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                  <p className="text-xs text-[#64748B]">Crediting user account:</p>
                  <p className="text-sm font-bold text-[#0A1628]">{selectedUser.name}</p>
                  <p className="text-xs text-[#64748B]">Account Number: <span className="font-mono">{selectedUser.account_number}</span></p>
                  <p className="text-xs text-[#64748B]">Current Balance: <span className="font-semibold">{getCurrency(selectedUser.country || 'United Kingdom').symbol}{selectedUser.balance.toFixed(2)}</span></p>
                  <p className="text-xs text-[#64748B]">Savings Balance: <span className="font-semibold">{getCurrency(selectedUser.country || 'United Kingdom').symbol}{(selectedUser.savingsBalance || 0).toFixed(2)}</span></p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Select Destination Wallet</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetWallet('current')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      targetWallet === 'current'
                        ? 'border-[#610C04] bg-[#FEE2E2] text-[#610C04]'
                        : 'border-light bg-white text-[#64748B] hover:border-[#610C04]'
                    }`}
                  >
                    Current Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetWallet('savings')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      targetWallet === 'savings'
                        ? 'border-[#610C04] bg-[#FEE2E2] text-[#610C04]'
                        : 'border-light bg-white text-[#64748B] hover:border-[#610C04]'
                    }`}
                  >
                    Savings Account
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Amount to Add (&pound;)</label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Transaction Description</label>
                <input
                  type="text"
                  value={fundDescription}
                  onChange={(e) => setFundDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                  placeholder="e.g. Salary Credit"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1628] mb-1.5">Transaction Date & Time</label>
                <input
                  type="datetime-local"
                  value={fundDate}
                  onChange={(e) => setFundDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setSelectedUser(null)} className="flex-1 py-3 rounded-xl border border-light text-[#64748B] font-medium text-sm hover:bg-[#F1F5F9]">
                  Cancel
                </button>
                <button type="submit" disabled={funding || !fundAmount} className="flex-1 btn-primary py-3 flex items-center justify-center">
                  {funding ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Credit Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1628]/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-light shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light">
              <h3 className="font-display text-lg text-[#0A1628]">Edit User Profile</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-[#F1F5F9] rounded-lg"><X size={20} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              {editUserSuccess && (
                <div className={`p-3 border text-sm rounded-xl text-center ${
                  editUserSuccess.startsWith('Error:') 
                    ? 'bg-red-50 border-red-100 text-[#EF4444]' 
                    : 'bg-green-50 border-green-100 text-[#10B981]'
                }`}>
                  {editUserSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">First Name</label>
                  <input
                    type="text"
                    value={editUserForm.firstName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#610C04]/20 focus:border-[#610C04]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editUserForm.lastName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Email</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Phone</label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">House Address</label>
                  <input
                    type="text"
                    value={editUserForm.houseAddress}
                    onChange={(e) => setEditUserForm({ ...editUserForm, houseAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#D31111]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">City</label>
                  <input
                    type="text"
                    value={editUserForm.city}
                    onChange={(e) => setEditUserForm({ ...editUserForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Country</label>
                  <select
                    value={editUserForm.country}
                    onChange={(e) => setEditUserForm({ ...editUserForm, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 bg-white"
                  >
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
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Postcode</label>
                  <input
                    type="text"
                    value={editUserForm.postcode}
                    onChange={(e) => setEditUserForm({ ...editUserForm, postcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Occupation</label>
                  <input
                    type="text"
                    value={editUserForm.occupation}
                    onChange={(e) => setEditUserForm({ ...editUserForm, occupation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1628] mb-1">Income Source</label>
                  <input
                    type="text"
                    value={editUserForm.incomeSource}
                    onChange={(e) => setEditUserForm({ ...editUserForm, incomeSource: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 rounded-lg border border-light text-sm text-[#64748B] hover:bg-[#F1F5F9]">
                  Cancel
                </button>
                <button type="submit" disabled={savingUser} className="flex-1 btn-primary py-2.5 flex items-center justify-center text-sm">
                  {savingUser ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Transactions Page ─── */
function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Edit Transaction states
  const [selectedTxn, setSelectedTxn] = useState<any>(null)
  const [editForm, setEditForm] = useState({ description: '', category: '', amount: '', status: '', date: '' })
  const [savingEdit, setSavingEdit] = useState(false)
  const [editSuccess, setEditSuccess] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleApproveTransaction = async (txn: any) => {
    if (!isSupabaseConfigured()) {
      alert('Error: Supabase is not configured.')
      return
    }

    if (!window.confirm('Are you sure you want to approve this transaction?')) return

    try {
      const { error } = await supabase
        .from('transactions_nbb')
        .update({ status: 'Completed' })
        .eq('id', txn.id)

      if (error) throw error

      alert('Transaction approved successfully!')
    } catch (err: any) {
      console.error('Approve failed:', err.message)
      alert(`Error: ${err.message}`)
    } finally {
      loadTransactions()
    }
  }

  const handleDeclineTransaction = async (txn: any) => {
    if (!isSupabaseConfigured()) {
      alert('Error: Supabase is not configured.')
      return
    }

    if (!window.confirm('Are you sure you want to decline and reverse this transaction?')) return

    try {
      // 1. Fetch user profile to get their current balance
      const { data: profile, error: profileErr } = await supabase
        .from('profiles_nbb')
        .select('balance')
        .eq('id', txn.userId)
        .single()

      if (profileErr) throw profileErr

      const currentBal = parseFloat(profile?.balance || '0')
      // Amount is negative for transfers, so we refund by adding back the absolute value
      const refundAmount = Math.abs(txn.amount)
      const newBal = currentBal + refundAmount

      // 2. Refund balance
      const { error: balanceErr } = await supabase
        .from('profiles_nbb')
        .update({ balance: newBal })
        .eq('id', txn.userId)

      if (balanceErr) throw balanceErr

      // 3. Mark transaction as Reversed
      const { error: txnErr } = await supabase
        .from('transactions_nbb')
        .update({ status: 'Reversed' })
        .eq('id', txn.id)

      if (txnErr) throw txnErr

      alert('Transaction declined. Funds have been refunded to the user.')
    } catch (err: any) {
      console.error('Decline/Reverse failed:', err.message)
      alert(`Error: ${err.message}`)
    } finally {
      loadTransactions()
    }
  }

  const loadTransactions = async () => {
    setErrorMsg('')
    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase is not configured. Please check your environment variables.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('transactions_nbb')
        .select('id, user_id, description, category, amount, status, date, profiles_nbb(first_name, last_name, country)')
        .order('date', { ascending: false })

      if (error) throw error

      if (data) {
        setTransactions(data.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          user: t.profiles_nbb ? `${t.profiles_nbb.first_name} ${t.profiles_nbb.last_name}` : 'Unknown Customer',
          desc: t.description,
          amount: parseFloat(t.amount),
          status: t.status,
          currencySymbol: t.profiles_nbb ? getCurrency(t.profiles_nbb.country || 'United Kingdom').symbol : '\u00A3',
          date: t.date,
          category: t.category
        })))
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err)
      setErrorMsg(`Failed to load transactions: ${err.message}`)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleEditClick = (txn: any) => {
    setSelectedTxn(txn)
    setEditForm({
      description: txn.desc,
      category: txn.category || 'Transfers',
      amount: Math.abs(txn.amount).toString(),
      status: txn.status,
      date: new Date(txn.date).toISOString().slice(0, 16) // datetime-local format
    })
    setEditSuccess('')
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    if (!isSupabaseConfigured()) {
      alert('Error: Supabase is not configured.')
      return
    }

    e.preventDefault()
    if (!selectedTxn) return
    setSavingEdit(true)
    setEditSuccess('')

    const updatedAmount = parseFloat(editForm.amount) * (selectedTxn.amount < 0 ? -1 : 1)

    try {
      const { error } = await supabase
        .from('transactions_nbb')
        .update({
          description: editForm.description,
          category: editForm.category,
          amount: updatedAmount,
          status: editForm.status,
          date: new Date(editForm.date).toISOString()
        })
        .eq('id', selectedTxn.id)

      if (error) throw error

      setEditSuccess('Transaction updated successfully!')
      setTimeout(() => setSelectedTxn(null), 1500)
    } catch (err: any) {
      console.error('Update failed:', err.message)
      setEditSuccess(`Error: ${err.message}`)
    } finally {
      setSavingEdit(false)
      loadTransactions()
    }
  }

  const filtered = statusFilter === 'All'
    ? transactions
    : transactions.filter(t => t.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[#0A1628]">Transactions Log</h1>
          <p className="text-[#64748B] mt-1">Monitor and modify transaction registers</p>
        </div>
        <button className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-light bg-white text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444]">
          {errorMsg}
        </div>
      )}

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Completed', 'Pending', 'Flagged', 'Reversed'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-[#D31111] text-white'
                : 'bg-white border border-light text-[#64748B] hover:border-[#D31111]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-light rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="text-left text-xs text-[#64748B] uppercase tracking-wider border-b border-light bg-[#F8FAFC]">
                <th className="px-6 py-3.5 font-medium">Date & ID</th>
                <th className="px-6 py-3.5 font-medium">User</th>
                <th className="px-6 py-3.5 font-medium">Description</th>
                <th className="px-6 py-3.5 font-medium text-right">Amount</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i} className="hover:bg-[#F1F5F9] transition-colors border-b border-light/50 last:border-0">
                  <td className="px-6 py-4 text-xs text-[#64748B]">
                    <p className="font-semibold">{new Date(t.date).toLocaleDateString('en-GB')}</p>
                    <p className="font-mono text-[10px] mt-0.5">{t.id.slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0A1628] font-medium">{t.user}</td>
                  <td className="px-6 py-4 text-sm text-[#64748B]">{t.desc}</td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${t.amount > 0 ? 'text-[#10B981]' : 'text-[#0A1628]'}`}>
                    {t.amount > 0 ? '+' : ''}{t.currencySymbol || '\u00A3'}{Math.abs(t.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-md ${
                      t.status === 'Completed' ? 'bg-[#10B981]/10 text-[#10B981]' :
                      t.status === 'Pending' ? 'bg-[#FEF3C7] text-[#D97706]' :
                      t.status === 'Flagged' ? 'bg-[#FEE2E2] text-[#D31111]' :
                      'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {t.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleApproveTransaction(t)}
                            className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors"
                            title="Approve Transaction"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDeclineTransaction(t)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors"
                            title="Decline & Refund"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      <button onClick={() => handleEditClick(t)} className="p-1.5 hover:bg-[#FEE2E2] text-[#D31111] rounded-lg transition-colors inline-flex items-center space-x-1" title="Edit Transaction">
                        <Edit size={14} /> <span className="text-xs">Edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1628]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-light shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light">
              <h3 className="font-display text-lg text-[#0A1628]">Edit Transaction Details</h3>
              <button onClick={() => setSelectedTxn(null)} className="p-1 hover:bg-[#F1F5F9] rounded-lg"><X size={20} className="text-[#64748B]" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editSuccess && (
                <div className="p-3 bg-green-50 border border-green-100 text-[#10B981] text-sm rounded-xl text-center">
                  {editSuccess}
                </div>
              )}
              <div className="bg-slate-50 p-4 rounded-xl space-y-1 text-xs">
                <p>Transaction ID: <span className="font-mono font-bold">{selectedTxn.id}</span></p>
                <p>Customer: <span className="font-bold">{selectedTxn.user}</span></p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0A1628] mb-1">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0A1628] mb-1">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#D31111]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0A1628] mb-1">Amount (&pound;)</label>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#0A1628] mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 bg-white"
                  >
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Flagged</option>
                    <option>Reversed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#0A1628] mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setSelectedTxn(null)} className="flex-1 py-2.5 rounded-lg border border-light text-sm text-[#64748B] hover:bg-[#F1F5F9]">
                  Cancel
                </button>
                <button type="submit" disabled={savingEdit} className="flex-1 btn-primary py-2.5 flex items-center justify-center text-sm">
                  {savingEdit ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Analytics Page ─── */
function AnalyticsPage() {
  const [totalAum, setTotalAum] = useState(0)
  const [totalDeposits, setTotalDeposits] = useState(0)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)
  const [accountDistribution, setAccountDistribution] = useState<any[]>([])
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([
    { label: 'Jan', value: 0 },
    { label: 'Feb', value: 0 },
    { label: 'Mar', value: 0 },
    { label: 'Apr', value: 0 },
    { label: 'May', value: 0 },
    { label: 'Jun', value: 0 },
  ])

  useEffect(() => {
    setErrorMsg('')
    if (!isSupabaseConfigured()) {
      setErrorMsg('Supabase is not configured. Please check your environment variables.')
      setLoading(false)
      return
    }

    async function loadAnalytics() {
      try {
        // 1. Fetch profiles
        const { data: profiles, error: pError } = await supabase
          .from('profiles_nbb')
          .select('balance, savings_balance')

        if (pError) throw pError

        if (profiles) {
          let sumCurrent = 0
          let sumSavings = 0
          profiles.forEach(p => {
            sumCurrent += parseFloat(p.balance || 0)
            sumSavings += parseFloat(p.savings_balance || 0)
          })

          const aum = sumCurrent + sumSavings
          setTotalAum(aum)
          setTotalAccounts(profiles.length)

          if (aum > 0) {
            setAccountDistribution([
              { label: 'Current Account', value: Math.round((sumCurrent / aum) * 100), color: '#D31111' },
              { label: 'Savings Account', value: Math.round((sumSavings / aum) * 100), color: '#0A1628' },
            ])
          } else {
            setAccountDistribution([
              { label: 'Current Account', value: 50, color: '#D31111' },
              { label: 'Savings Account', value: 50, color: '#0A1628' },
            ])
          }
        }

        // 2. Fetch transactions for current month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0,0,0,0)

        const { data: txns, error: tError } = await supabase
          .from('transactions_nbb')
          .select('amount')
          .gte('date', startOfMonth.toISOString())

        if (tError) throw tError

        if (txns) {
          let dep = 0
          let wit = 0
          txns.forEach(t => {
            const amt = parseFloat(t.amount || 0)
            if (amt > 0) {
              dep += amt
            } else {
              wit += Math.abs(amt)
            }
          })
          setTotalDeposits(dep)
          setTotalWithdrawals(wit)
        }

        // 3. Fetch monthly volumes for the last 6 months dynamically!
        const monthsData: { label: string; value: number }[] = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          const monthLabel = d.toLocaleString('en-US', { month: 'short' })
          
          const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)

          const { data: mTxns, error: mError } = await supabase
            .from('transactions_nbb')
            .select('amount')
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())
            .eq('status', 'Completed')

          let monthlyVol = 0
          if (mTxns && !mError) {
            mTxns.forEach(t => {
              monthlyVol += Math.abs(parseFloat(t.amount || 0))
            })
          }
          monthsData.push({ label: monthLabel, value: monthlyVol })
        }
        setRevenueData(monthsData)

      } catch (err: any) {
        console.error('Error loading analytics:', err)
        setErrorMsg(`Failed to load analytics: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#D31111]/30 border-t-[#D31111] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl text-[#0A1628]">Analytics</h1>
        <p className="text-[#64748B] mt-1">Performance and growth metrics</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-[#EF4444]">
          {errorMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <p className="text-sm text-[#64748B] mb-1">Total AUM</p>
          <p className="text-3xl font-semibold text-[#0A1628]">
            \u00A3{totalAum.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowUpRight size={14} className="text-[#10B981]" />
            <span className="text-xs text-[#10B981]">+8.2% vs last month</span>
          </div>
        </div>
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <p className="text-sm text-[#64748B] mb-1">Deposits this month</p>
          <p className="text-3xl font-semibold text-[#10B981]">
            \u00A3{totalDeposits.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowUpRight size={14} className="text-[#10B981]" />
            <span className="text-xs text-[#10B981]">+12.4% vs last month</span>
          </div>
        </div>
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <p className="text-sm text-[#64748B] mb-1">Withdrawals this month</p>
          <p className="text-3xl font-semibold text-[#D31111]">
            \u00A3{totalWithdrawals.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowDownRight size={14} className="text-[#D31111]" />
            <span className="text-xs text-[#D31111]">+3.1% vs last month</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <h3 className="font-display text-lg text-[#0A1628] mb-6">Monthly Volume (&pound;)</h3>
          <div className="flex items-end justify-between h-56 gap-3">
            {revenueData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <span className="text-xs text-[#64748B] mb-2">
                  &pound;{item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value.toFixed(0)}
                </span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-12 rounded-t-lg bg-[#D31111] transition-all duration-500"
                    style={{ height: `${(item.value / Math.max(...revenueData.map(r => r.value), 1)) * 180}px` }}
                  />
                </div>
                <span className="text-xs text-[#64748B] mt-2">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Types */}
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <h3 className="font-display text-lg text-[#0A1628] mb-6">Account Type Distribution</h3>
          <div className="space-y-4">
            {accountDistribution.map((type, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[#0A1628]">{type.label}</span>
                  <span className="text-sm font-medium text-[#0A1628]">{type.value}%</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${type.value}%`, backgroundColor: type.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-[#F1F5F9] rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-[#0A1628]">
                {totalAccounts}
              </p>
              <p className="text-xs text-[#64748B] mt-1">Total Accounts</p>
            </div>
            <div className="bg-[#F1F5F9] rounded-xl p-4 text-center">
              <p className="text-2xl font-semibold text-[#0A1628]">
                100%
              </p>
              <p className="text-xs text-[#64748B] mt-1">Retention Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Admin Dashboard ─── */
export default function AdminDashboard() {
  const configured = isSupabaseConfigured()

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminNav />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!configured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-[#D97706] flex items-center space-x-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Warning: Supabase is not configured. The dashboard is running in local mock data mode. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on your hosting provider (e.g. Vercel) to connect to your database.</span>
            </div>
          )}
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
