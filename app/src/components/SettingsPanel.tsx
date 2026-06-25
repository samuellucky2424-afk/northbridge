import { useState } from 'react'
import { X, Moon, Sun, User, Phone, MapPin, Mail, Check } from 'lucide-react'

interface SettingsPanelProps {
  onClose: () => void
  userName: string
}

export default function SettingsPanel({ onClose, userName }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance'>('profile')
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
  })

  const handleSetDarkMode = (val: boolean) => {
    setDarkMode(val)
    if (val) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    firstName: userName || 'Sarah',
    lastName: 'Miller',
    phone: '+44 7700 900000',
    houseAddress: '42 Baker Street',
    city: 'London',
    postcode: 'NW1 6XE',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light bg-white sticky top-0 z-10">
          <h3 className="font-display text-xl text-[#0A1628]">Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-light px-6">
          <button onClick={() => setActiveTab('profile')} className={`py-3 mr-6 text-sm font-medium border-b-2 transition-all ${activeTab === 'profile' ? 'border-[#D31111] text-[#D31111]' : 'border-transparent text-[#64748B]'}`}>
            Profile
          </button>
          <button onClick={() => setActiveTab('appearance')} className={`py-3 mr-6 text-sm font-medium border-b-2 transition-all ${activeTab === 'appearance' ? 'border-[#D31111] text-[#D31111]' : 'border-transparent text-[#64748B]'}`}>
            Appearance
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-[#0A1628] flex items-center justify-center">
                <span className="text-white text-lg font-medium">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#0A1628]">{profile.firstName} {profile.lastName}</p>
                <p className="text-sm text-[#64748B]">Personal Account</p>
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-[#64748B] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input type="email" value="sarah.miller@email.com" disabled
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-light bg-[#F1F5F9] text-[#64748B] cursor-not-allowed" />
              </div>
              <p className="text-xs text-[#64748B] mt-1">Email address cannot be changed</p>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-1.5">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input type="text" value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Last Name</label>
                <input type="text" value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input type="tel" value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#0A1628] mb-1.5">House Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input type="text" value={profile.houseAddress}
                  onChange={(e) => setProfile({...profile, houseAddress: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-1.5">City</label>
                <input type="text" value={profile.city}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0A1628] mb-1.5">Postcode</label>
                <input type="text" value={profile.postcode}
                  onChange={(e) => setProfile({...profile, postcode: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111]" />
              </div>
            </div>

            <button onClick={handleSave} className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2">
              {saved ? <><Check size={18} /><span>Saved</span></> : <><Check size={18} /><span>Save Changes</span></>}
            </button>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-medium text-[#0A1628] mb-2">Theme</h4>
              <p className="text-sm text-[#64748B] mb-4">Choose your preferred appearance for the dashboard.</p>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleSetDarkMode(false)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${!darkMode ? 'border-[#D31111] bg-[#FEE2E2]/30' : 'border-light hover:border-[#D31111]/30'}`}>
                  <Sun size={32} className="text-[#F59E0B] mx-auto mb-3" />
                  <p className="font-medium text-[#0A1628] mb-1">Light</p>
                  <p className="text-xs text-[#64748B]">Clean and bright</p>
                  {!darkMode && <span className="inline-block mt-2 w-4 h-4 rounded-full bg-[#D31111]"><Check size={12} className="text-white mx-auto mt-0.5" /></span>}
                </button>

                <button onClick={() => handleSetDarkMode(true)}
                  className={`p-6 rounded-2xl border-2 transition-all text-center ${darkMode ? 'border-[#D31111] bg-[#0A1628]/5' : 'border-light hover:border-[#0A1628]/30'}`}>
                  <Moon size={32} className="text-[#0A1628] mx-auto mb-3" />
                  <p className="font-medium text-[#0A1628] mb-1">Dark</p>
                  <p className="text-xs text-[#64748B]">Easy on the eyes</p>
                  {darkMode && <span className="inline-block mt-2 w-4 h-4 rounded-full bg-[#D31111]"><Check size={12} className="text-white mx-auto mt-0.5" /></span>}
                </button>
              </div>
            </div>

            <div className="border-t border-light pt-6">
              <h4 className="font-medium text-[#0A1628] mb-2">Language</h4>
              <select className="w-full px-4 py-3 rounded-xl border border-light text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D31111]/20 focus:border-[#D31111] bg-white">
                <option>English (UK)</option>
                <option>Welsh</option>
                <option>Scottish Gaelic</option>
              </select>
            </div>

            <div className="border-t border-light pt-6">
              <h4 className="font-medium text-[#0A1628] mb-2">Notifications</h4>
              <div className="space-y-3">
                {['Transaction alerts', 'Marketing emails', 'Security notifications'].map((n, i) => (
                  <label key={i} className="flex items-center justify-between py-2 cursor-pointer">
                    <span className="text-sm text-[#64748B]">{n}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#D31111]" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
