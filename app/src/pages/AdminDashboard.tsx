import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import {
  LayoutDashboard, Users, Receipt, BarChart3,
  Search, ChevronLeft, ChevronRight, Bell, LogOut,
  ArrowUpRight, ArrowDownRight, UserCheck,
  Clock, AlertTriangle, Download, Ban, Plus, Edit, Trash2, X
} from 'lucide-react'
import NumberTicker from '../components/NumberTicker'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
            <div className="w-8 h-8 rounded-lg bg-[#D31111] flex items-center justify-center">
              <span className="text-white font-display text-[10px]">NBB</span>
            </div>
            <span className="font-display text-xl text-[#0A1628]">North Bridge Bank</span>
            <span className="ml-2 px-2 py-0.5 bg-[#FEE2E2] text-[#D31111] text-xs font-medium rounded-md">Admin</span>
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
                      ? 'text-[#D31111] bg-[#FEE2E2]'
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D31111] rounded-full" />
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

/* ─── Mock Data Fallbacks ─── */
const mockUsers = [
  { id: '1', name: 'Sarah Miller', email: 'sarah.m@email.com', status: 'Active', balance: 24562.80, savingsBalance: 1250.00, joined: '2024-01-15', kyc: 'Verified', account_number: '12345678' },
  { id: '2', name: 'James Wilson', email: 'j.wilson@email.com', status: 'Active', balance: 18234.50, savingsBalance: 400.00, joined: '2024-02-20', kyc: 'Verified', account_number: '87654321' },
  { id: '3', name: 'Emma Thompson', email: 'emma.t@email.com', status: 'Pending', balance: 0.00, savingsBalance: 0.00, joined: '2025-06-20', kyc: 'Pending', account_number: '56781234' },
  { id: '4', name: 'Oliver Brown', email: 'o.brown@email.com', status: 'Active', balance: 56789.20, savingsBalance: 3200.00, joined: '2023-08-10', kyc: 'Verified', account_number: '23456789' },
  { id: '5', name: 'Sophia Davis', email: 'sophia.d@email.com', status: 'Suspended', balance: 120.00, savingsBalance: 0.00, joined: '2024-05-05', kyc: 'Verified', account_number: '34567890' },
]

const mockTransactions = [
  { id: 'TXN001', user: 'Sarah Miller', desc: 'Tesco Superstore', amount: -47.32, status: 'Completed', date: '2025-06-25 09:23', category: 'Groceries' },
  { id: 'TXN002', user: 'James Wilson', desc: 'Salary Credit', amount: 3250.00, status: 'Completed', date: '2025-06-25 08:00', category: 'Income' },
  { id: 'TXN003', user: 'Oliver Brown', desc: 'Wire Transfer Out', amount: -15000.00, status: 'Flagged', date: '2025-06-24 16:45', category: 'Transfers' },
  { id: 'TXN004', user: 'Emma Thompson', desc: 'Initial Deposit', amount: 100.00, status: 'Pending', date: '2025-06-24 14:30', category: 'Income' },
  { id: 'TXN005', user: 'William Clark', desc: 'Netflix Subscription', amount: -10.99, status: 'Completed', date: '2025-06-24 11:15', category: 'Entertainment' },
]

/* ─── Admin Overview ─── */
function AdminOverview() {
  const [userCount, setUserCount] = useState(14247)
  const activeToday = 3891
  const [pendingKyc, setPendingKyc] = useState(47)
  const [latestTxns, setLatestTxns] = useState<any[]>([])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLatestTxns(mockTransactions.slice(0, 5))
      return
    }

    async function loadStats() {
      // Get profiles count
      const { count: uCount } = await supabase
        .from('profiles_nbb')
        .select('*', { count: 'exact', head: true })
      
      if (uCount !== null) setUserCount(uCount)

      // Get pending KYC/profiles
      const { count: kCount } = await supabase
        .from('profiles_nbb')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'suspended')
      
      if (kCount !== null) setPendingKyc(kCount)

      // Get latest transactions
      const { data } = await supabase
        .from('transactions_nbb')
        .select('id, description, category, amount, status, date, profiles_nbb(first_name, last_name)')
        .order('date', { ascending: false })
        .limit(5)
      
      if (data) {
        setLatestTxns(data.map((t: any) => ({
          id: t.id.slice(0, 8).toUpperCase(),
          user: t.profiles_nbb ? `${t.profiles_nbb.first_name} ${t.profiles_nbb.last_name}` : 'NBB Customer',
          desc: t.description,
          amount: parseFloat(t.amount),
          status: t.status,
          date: new Date(t.date).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
        })))
      }
    }

    loadStats()
  }, [])

  const stats = [
    { label: 'Total Registered Users', value: userCount, change: '+12%', icon: Users, color: '#0A1628' },
    { label: 'Active Today', value: activeToday, change: '+5%', icon: UserCheck, color: '#10B981' },
    { label: 'Suspended Accounts', value: pendingKyc, change: 'Flagged', icon: Clock, color: '#F59E0B' },
    { label: 'Support Tickets', value: 12, change: 'Stable', icon: AlertTriangle, color: '#D31111' },
  ]

  const dailyUsers = [2100, 2350, 2200, 2800, 3100, 3500, activeToday]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const chartMax = Math.max(...dailyUsers)
  const newSignups = [45, 62, 38, 55, 71, 48, 63]

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="font-display text-3xl text-[#0A1628]">Dashboard Overview</h1>
        <p className="text-[#64748B] mt-1">Real-time system metrics</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-light rounded-2xl p-6 hover:shadow-soft transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                s.change.includes('+') ? 'bg-[#10B981]/10 text-[#10B981]' :
                s.change.includes('-') ? 'bg-[#FEE2E2] text-[#D31111]' :
                'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                {s.change}
              </span>
            </div>
            <p className="text-3xl font-light text-[#0A1628]">
              <NumberTicker value={s.value} duration={1500} decimals={0} />
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
                      backgroundColor: i === dailyUsers.length - 1 ? '#D31111' : '#E2E8F0',
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
                    className="w-12 rounded-t-lg bg-[#D31111] transition-all duration-500"
                    style={{ height: `${(val / 80) * 160}px` }}
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
          <Link to="/admin/transactions" className="text-sm text-[#D31111] hover:underline font-medium">View all</Link>
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
                    {t.amount > 0 ? '+' : ''}\u00A3{Math.abs(t.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
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

  const loadUsers = async () => {
    if (!isSupabaseConfigured()) {
      setUsers(mockUsers.map(u => ({
        ...u,
        firstName: u.name.split(' ')[0],
        lastName: u.name.split(' ')[1] || '',
        phone: '+44 7700 900077',
        houseAddress: '10 Downing Street',
        city: 'London',
        country: 'United Kingdom',
        postcode: 'SW1A 2AA',
        occupation: 'Software Engineer',
        incomeSource: 'Employment'
      })))
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles_nbb')
        .select('*')
        .order('first_name', { ascending: true })

      if (data && !error) {
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
    } catch (err) {
      console.error('Error fetching users from Supabase:', err)
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
    const nextStatus = user.status === 'Suspended' ? 'active' : 'suspended'
    
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('profiles_nbb')
        .update({ status: nextStatus })
        .eq('id', user.id)

      if (error) {
        console.error('Error suspending user:', error.message)
        return
      }
    } else {
      // Mock update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus === 'suspended' ? 'Suspended' : 'Active' } : u))
    }

    loadUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('profiles_nbb')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Error deleting profile:', error.message)
        return
      }
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }

    loadUsers()
  }

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetAccountNumber || !fundAmount || parseFloat(fundAmount) <= 0) return
    setFunding(true)
    setFundSuccess('')

    const amount = parseFloat(fundAmount)
    const isSavings = targetWallet === 'savings'
    const formattedIsoDate = new Date(fundDate).toISOString()

    if (isSupabaseConfigured()) {
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

        setFundSuccess(`Successfully credited \u00A3${amount.toFixed(2)} to ${profile.first_name} ${profile.last_name || ''}'s ${isSavings ? 'Savings' : 'Current'} wallet`)
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
    } else {
      // Local fallback
      let userFound = false
      setUsers(prev => prev.map(u => {
        if (u.account_number === targetAccountNumber) {
          userFound = true
          const currentVal = isSavings ? (u.savingsBalance || 0) : u.balance
          const newBal = currentVal + amount
          return isSavings 
            ? { ...u, savingsBalance: newBal }
            : { ...u, balance: newBal }
        }
        return u
      }))

      if (userFound) {
        setFundSuccess(`Simulated Credit of \u00A3${amount.toFixed(2)} to ${isSavings ? 'Savings' : 'Current'} wallet successful!`)
        setFundAmount('')
        setFundDescription('Deposit Funds')
        setTimeout(() => setSelectedUser(null), 1500)
      } else {
        setFundSuccess(`Error: Account number ${targetAccountNumber} not found locally`)
      }
      setFunding(false)
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
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
                  ? 'bg-[#D31111] text-white'
                  : 'bg-white border border-light text-[#64748B] hover:border-[#D31111]'
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => {
              setSelectedUser({ isManual: true, name: 'Manual Entry', balance: 0, savingsBalance: 0 });
              setTargetAccountNumber('');
              setFundDescription('Salary Credit');
              setFundDate(new Date().toISOString().slice(0, 16));
              setTargetWallet('current');
              setFundSuccess('');
              setFundAmount('');
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#0A1628] text-white hover:bg-[#D31111] transition-all flex items-center space-x-2"
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
                      u.status === 'Active' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#FEE2E2] text-[#D31111]'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#0A1628] text-right">
                    \u00A3{u.balance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#64748B] text-right">
                    \u00A3{(u.savingsBalance || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
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
                        className="p-1.5 hover:bg-[#FEE2E2] text-[#D31111] rounded-lg transition-colors flex items-center space-x-1"
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
                    className="w-full px-4 py-3 rounded-xl border border-light text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
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
                  <p className="text-xs text-[#64748B]">Current Balance: <span className="font-semibold">\u00A3{selectedUser.balance.toFixed(2)}</span></p>
                  <p className="text-xs text-[#64748B]">Savings Balance: <span className="font-semibold">\u00A3{(selectedUser.savingsBalance || 0).toFixed(2)}</span></p>
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
                        ? 'border-[#D31111] bg-[#FEE2E2] text-[#D31111]'
                        : 'border-light bg-white text-[#64748B] hover:border-[#D31111]'
                    }`}
                  >
                    Current Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetWallet('savings')}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      targetWallet === 'savings'
                        ? 'border-[#D31111] bg-[#FEE2E2] text-[#D31111]'
                        : 'border-light bg-white text-[#64748B] hover:border-[#D31111]'
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
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
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
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
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
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
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
                    className="w-full px-3 py-2 rounded-lg border border-light text-sm focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]"
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

  const handleApproveTransaction = async (txn: any) => {
    if (!window.confirm('Are you sure you want to approve this transaction?')) return

    if (isSupabaseConfigured()) {
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
    } else {
      // Local fallback
      setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: 'Completed' } : t))
      alert('Simulated approval successful!')
    }
  }

  const handleDeclineTransaction = async (txn: any) => {
    if (!window.confirm('Are you sure you want to decline and reverse this transaction?')) return

    if (isSupabaseConfigured()) {
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
    } else {
      // Local fallback
      setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: 'Reversed' } : t))
      alert('Simulated decline and refund successful!')
    }
  }

  const loadTransactions = async () => {
    if (!isSupabaseConfigured()) {
      setTransactions(mockTransactions)
      return
    }

    try {
      const { data, error } = await supabase
        .from('transactions_nbb')
        .select('id, user_id, description, category, amount, status, date, profiles_nbb(first_name, last_name)')
        .order('date', { ascending: false })

      if (data && !error) {
        setTransactions(data.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          user: t.profiles_nbb ? `${t.profiles_nbb.first_name} ${t.profiles_nbb.last_name}` : 'Unknown Customer',
          desc: t.description,
          amount: parseFloat(t.amount),
          status: t.status,
          date: t.date,
          category: t.category
        })))
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
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
    e.preventDefault()
    if (!selectedTxn) return
    setSavingEdit(true)
    setEditSuccess('')

    const updatedAmount = parseFloat(editForm.amount) * (selectedTxn.amount < 0 ? -1 : 1)

    if (isSupabaseConfigured()) {
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
      } finally {
        setSavingEdit(false)
        loadTransactions()
      }
    } else {
      // Local fallback
      setTransactions(prev => prev.map(t => t.id === selectedTxn.id ? {
        ...t,
        desc: editForm.description,
        category: editForm.category,
        amount: updatedAmount,
        status: editForm.status,
        date: new Date(editForm.date).toLocaleString('en-GB')
      } : t))
      setEditSuccess('Simulated update successful!')
      setSavingEdit(false)
      setTimeout(() => setSelectedTxn(null), 1500)
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
                    {t.amount > 0 ? '+' : ''}\u00A3{Math.abs(t.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const revenue = [2.1, 2.4, 2.8, 3.2, 3.8, 4.1]

  const accountTypes = [
    { label: 'Current', value: 45, color: '#D31111' },
    { label: 'Savings', value: 30, color: '#0A1628' },
    { label: 'Business', value: 18, color: '#64748B' },
    { label: 'Wealth', value: 7, color: '#F1F5F9' },
  ]

  const maxRev = Math.max(...revenue)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-[#0A1628]">Analytics</h1>
        <p className="text-[#64748B] mt-1">Performance and growth metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <p className="text-sm text-[#64748B] mb-1">Total AUM</p>
          <p className="text-3xl font-light text-[#0A1628]">
            <NumberTicker value={9.7} prefix="\u00A3" suffix="B" decimals={1} duration={2000} />
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowUpRight size={14} className="text-[#10B981]" />
            <span className="text-xs text-[#10B981]">+8.2% vs last month</span>
          </div>
        </div>
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <p className="text-sm text-[#64748B] mb-1">Deposits this month</p>
          <p className="text-3xl font-light text-[#0A1628]">
            <NumberTicker value={5.4} prefix="\u00A3" suffix="M" decimals={1} duration={2000} />
          </p>
          <div className="flex items-center space-x-1 mt-2">
            <ArrowUpRight size={14} className="text-[#10B981]" />
            <span className="text-xs text-[#10B981]">+12.4% vs last month</span>
          </div>
        </div>
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <p className="text-sm text-[#64748B] mb-1">Withdrawals this month</p>
          <p className="text-3xl font-light text-[#0A1628]">
            <NumberTicker value={4.7} prefix="\u00A3" suffix="M" decimals={1} duration={2000} />
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
          <h3 className="font-display text-lg text-[#0A1628] mb-6">Monthly Revenue (\u00A3M)</h3>
          <div className="flex items-end justify-between h-56 gap-3">
            {revenue.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <span className="text-xs text-[#64748B] mb-2">{val}M</span>
                <div className="w-full flex justify-center">
                  <div
                    className="w-12 rounded-t-lg bg-[#D31111] transition-all duration-500"
                    style={{ height: `${(val / maxRev) * 180}px` }}
                  />
                </div>
                <span className="text-xs text-[#64748B] mt-2">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Types */}
        <div className="bg-white border border-light rounded-2xl p-6 shadow-soft">
          <h3 className="font-display text-lg text-[#0A1628] mb-6">Account Type Distribution</h3>
          <div className="space-y-4">
            {accountTypes.map((type, i) => (
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
              <p className="text-2xl font-light text-[#0A1628]">
                <NumberTicker value={142} suffix="K" decimals={0} duration={1500} />
              </p>
              <p className="text-xs text-[#64748B] mt-1">Total Accounts</p>
            </div>
            <div className="bg-[#F1F5F9] rounded-xl p-4 text-center">
              <p className="text-2xl font-light text-[#0A1628]">
                <NumberTicker value={94.2} suffix="%" decimals={1} duration={1500} />
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
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminNav />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
