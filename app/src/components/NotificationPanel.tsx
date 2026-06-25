import { X, Bell } from 'lucide-react'

interface NotificationPanelProps {
  onClose: () => void
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = [
    { id: 1, title: 'Transfer Received', message: 'You received \u00A33250.00 from North Bridge Bank Ltd', time: '2 min ago', read: false, type: 'success' },
    { id: 2, title: 'Card Payment', message: '\u00A347.32 spent at Tesco Superstore', time: '15 min ago', read: false, type: 'info' },
    { id: 3, title: 'Security Alert', message: 'New login detected from London, UK', time: '1 hour ago', read: false, type: 'warning' },
    { id: 4, title: 'Savings Interest', message: '\u00A372.15 interest added to your Savings account', time: '3 hours ago', read: true, type: 'success' },
    { id: 5, title: 'Monthly Statement', message: 'Your June statement is now available', time: '1 day ago', read: true, type: 'info' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-light bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <Bell size={20} className="text-[#D31111]" />
            <h3 className="font-display text-lg text-[#0A1628]">Notifications</h3>
            <span className="px-2 py-0.5 bg-[#FEE2E2] text-[#D31111] text-xs font-medium rounded-full">3 new</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        <div className="divide-y divide-light/50">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 hover:bg-[#F1F5F9] transition-colors cursor-pointer ${!n.read ? 'bg-[#FEE2E2]/20' : ''}`}>
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-[#D31111]' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0A1628]">{n.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5 truncate">{n.message}</p>
                  <p className="text-xs text-[#64748B] mt-1">{n.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-light">
          <button className="w-full text-center text-sm text-[#D31111] hover:underline py-2">
            Mark all as read
          </button>
        </div>
      </div>
    </div>
  )
}
