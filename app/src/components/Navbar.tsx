import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../App'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, logout, userRole } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#D31111] flex items-center justify-center">
              <span className="text-white font-display text-[10px]">NBB</span>
            </div>
            <span className="font-display text-xl text-[#0A1628]">North Bridge Bank</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {isHome && (
              <>
                <a href="#features" className="nav-link">Features</a>
                <a href="#security" className="nav-link">Security</a>
                <a href="#accounts" className="nav-link">Accounts</a>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link to={userRole === 'admin' ? '/admin' : '/dashboard'} className="nav-link active">
                  Dashboard
                </Link>
                <button onClick={logout} className="btn-primary text-sm py-2 px-4">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-cloud-grey transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} className="text-deep-navy" /> : <Menu size={24} className="text-deep-navy" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-light">
          <div className="px-4 py-4 space-y-3">
            {isHome && (
              <>
                <a href="#features" className="block py-2 text-sm font-medium text-slate" onClick={() => setMenuOpen(false)}>Features</a>
                <a href="#security" className="block py-2 text-sm font-medium text-slate" onClick={() => setMenuOpen(false)}>Security</a>
                <a href="#accounts" className="block py-2 text-sm font-medium text-slate" onClick={() => setMenuOpen(false)}>Accounts</a>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link to={userRole === 'admin' ? '/admin' : '/dashboard'} className="block py-2 text-sm font-medium text-deep-navy" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left py-2 text-sm font-medium text-[#D31111]">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-sm font-medium text-slate" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2 text-sm font-medium text-[#D31111]" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
