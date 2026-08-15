import { useState, useEffect } from 'react'
import { X, Bell, Check, Trash2 } from 'lucide-react'
import { useAuth } from '../App'
import { getNotifications, markNotificationRead, type Notification } from '../lib/db'

interface NotificationPanelProps {
  onClose: () => void
}

function timeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { userId } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    getNotifications(userId)
      .then((data) => {
        setNotifications(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err)
        setError('Unable to load notifications')
        setLoading(false)
      })
  }, [userId])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      // silently fail
    }
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read)
    for (const n of unread) {
      try {
        await markNotificationRead(n.id)
      } catch {
        // continue
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
          <Check size={14} className="text-[#10B981]" />
        </div>
      case 'warning':
        return <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
          <Bell size={14} className="text-[#F59E0B]" />
        </div>
      default:
        return <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
          <Bell size={14} className="text-[#3B82F6]" />
        </div>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-light bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <Bell size={20} className="text-[#D31111]" />
            <h3 className="font-display text-lg text-[#0A1628]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#FEE2E2] text-[#D31111] text-xs font-medium rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <X size={20} className="text-[#64748B]" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#610C04]/20 border-t-[#610C04] rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#64748B] mt-3">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#EF4444]">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={40} className="text-[#E2E8F0] mx-auto mb-3" />
            <p className="text-sm text-[#64748B]">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-light/50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`p-4 hover:bg-[#F1F5F9] transition-colors cursor-pointer ${!n.read ? 'bg-[#FEE2E2]/20' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-[#D31111]" />
                  )}
                  {getTypeIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A1628]">{n.title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{n.message}</p>
                    <p className="text-xs text-[#94A3B8] mt-1">{timeAgo(n.time)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 border-t border-light">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="w-full text-center text-sm text-[#D31111] hover:underline py-2 flex items-center justify-center space-x-1"
            >
              <Check size={14} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
