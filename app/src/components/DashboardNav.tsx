import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Send, Shield, HelpCircle, Bell, LogOut } from 'lucide-react'
import { useAuth } from '../App'

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/accounts', label: 'Accounts', icon: CreditCard },
  { path: '/dashboard/payments', label: 'Payments', icon: Send },
  { path: '/dashboard/cards', label: 'Cards', icon: Shield },
  { path: '/dashboard/support', label: 'Support', icon: HelpCircle },
]

export default function DashboardNav() {
  const location = useLocation()
  const { logout, userName, profilePictureUrl } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#D31111] flex items-center justify-center">
              <span className="text-white font-display text-[10px]">NBB</span>
            </div>
            <span className="font-display text-xl text-[#0A1628]">North Bridge Bank</span>
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
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#D31111] rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
              <Bell size={20} className="text-[#64748B]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#D31111] rounded-full" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center overflow-hidden">
                {profilePictureUrl ? (
                  <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xs font-medium">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-[#0A1628]">
                {userName || 'User'}
              </span>
            </div>
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
