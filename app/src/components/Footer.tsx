import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#0A1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#D31111] flex items-center justify-center">
                <span className="text-white font-display text-[10px]">NBB</span>
              </div>
              <span className="font-display text-xl text-white">North Bridge Bank</span>
            </Link>
            <p className="text-sm text-[#64748B] mb-6">Banking with purpose. Building the bank that Britain deserves.</p>
            <div className="flex items-center space-x-4">
              {/* Social icons */}
              {['X', 'in', 'f'].map((s, i) => (
                <span key={i} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-[#64748B] hover:bg-[#D31111] hover:text-white transition-all cursor-pointer">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="label-ui text-white mb-4">Products</h4>
            <ul className="space-y-3">
              {[
                { label: 'Current Accounts', to: '/current-account' },
                { label: 'Savings', to: '/savings' },
                { label: 'Business', to: '/business' },
                { label: 'Wealth', to: '/wealth' },
                { label: 'Mortgages', to: '/mortgages' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-[#64748B] hover:text-white transition-colors duration-150">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="label-ui text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About', to: '/about' },
                { label: 'Careers', to: '/careers' },
                { label: 'Press', to: '/press' },
                { label: 'Sustainability', to: '/sustainability' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-[#64748B] hover:text-white transition-colors duration-150">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="label-ui text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Centre', to: '/dashboard/support' },
                { label: 'Contact', to: '/contact' },
                { label: 'Security', to: '/security' },
                { label: 'Accessibility', to: '/accessibility' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-[#64748B] hover:text-white transition-colors duration-150">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="label-ui text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Modern Slavery Statement'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#64748B] hover:text-white transition-colors duration-150 cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[#1E293B]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-xs text-[#64748B]">
              &copy; 2025 North Bridge Bank Bank Ltd. Authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority. Registered in England and Wales (No. 12345678).
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-[#64748B]">FSCS Protected</span>
              <span className="text-xs text-[#64748B]">FCA Authorised</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
