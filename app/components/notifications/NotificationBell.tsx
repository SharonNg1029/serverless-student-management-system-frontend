import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNotificationUIStore } from '../../store/notificationUIStore'
import api from '../../utils/axios'

// ============================================
// API Response Type - Đã cập nhật theo response thực tế từ BE
// Response: { "results": [{ id, title, content, type, isRead, createdAt }] }
// ============================================
interface NotificationFromAPI {
  id: string
  title: string
  content: string
  type: string // "SYSTEM_ALERT", "INFO", etc.
  isRead: boolean // camelCase
  createdAt: string // camelCase
}

interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
}

interface NotificationBellProps {
  variant?: 'light' | 'dark'
}

// Polling interval: 30 giây
const POLLING_INTERVAL = 30000

// Map BE type to UI type
const mapNotificationType = (type?: string): 'info' | 'warning' | 'success' | 'error' => {
  switch (type) {
    case 'SYSTEM_ALERT':
      return 'warning'
    case 'ERROR':
      return 'error'
    case 'SUCCESS':
      return 'success'
    default:
      return 'info'
  }
}

export default function NotificationBell({ variant }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { isOpen, toggleNotificationPanel, closeNotificationPanel } = useNotificationUIStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Auto-detect variant based on user role if not specified
  const effectiveVariant = variant ?? (user?.role === 'Admin' ? 'light' : 'dark')
  const isDark = effectiveVariant === 'dark'

  // ============================================
  // FETCH NOTIFICATIONS - Gọi API /api/notifications
  // ============================================
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      // === GỌI API GET /api/notifications ===
      const response = await api.get<{ results: NotificationFromAPI[] }>('/api/notifications')

      // Map API response to local format
      const mappedNotifications: Notification[] = (response.data.results || []).map((n) => ({
        id: String(n.id),
        title: n.title || 'Thông báo',
        message: n.content || '',
        timestamp: n.createdAt || new Date().toISOString(),
        read: n.isRead ?? false,
        type: mapNotificationType(n.type)
      }))

      setNotifications(mappedNotifications)
    } catch (error) {
      // Silently fail - notifications are not critical
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Fetch on mount và setup polling
  useEffect(() => {
    fetchNotifications()

    // Polling mỗi 30 giây
    const interval = setInterval(fetchNotifications, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeNotificationPanel()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeNotificationPanel])

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  // ============================================
  // MARK AS READ - Gọi API PATCH /api/notifications/:id/read
  // ============================================
  const markAsRead = async (notificationId: string) => {
    try {
      // === GỌI API PATCH /api/notifications/:id/read ===
      await api.patch(`/api/notifications/${notificationId}/read`)
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    } catch (error) {
      // Vẫn update UI dù API fail
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    }
  }

  // ============================================
  // MARK ALL AS READ - Gọi API PATCH /api/notifications/read-all
  // ============================================
  const markAllAsRead = async () => {
    try {
      // === GỌI API PATCH /api/notifications/read-all ===
      await api.patch('/api/notifications/read-all')
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      // Vẫn update UI dù API fail
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    }
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleNotificationPanel}
        className={`relative p-2.5 rounded-full cursor-pointer transition-colors group ${
          isDark ? 'hover:bg-[rgba(227,130,20,0.1)]' : 'hover:bg-slate-100'
        }`}
      >
        <Bell
          size={20}
          className={`transition-colors ${
            isDark ? 'text-white group-hover:text-[#e38214]' : 'text-slate-600 group-hover:text-[#dd7323]'
          }`}
        />
        {unreadCount > 0 && (
          <span className='absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse'></span>
        )}
      </button>

      {isOpen && (
        <div className='absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg min-w-[320px] max-w-[400px] z-[9999] max-h-[400px] overflow-hidden flex flex-col'>
          <div className='p-4 border-b border-slate-200 flex justify-between items-center'>
            <h3 className='m-0 text-base font-semibold'>Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className='bg-transparent border-none text-[#dd7323] text-sm cursor-pointer py-1 px-2 hover:text-[#c46420] transition-colors'
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className='overflow-y-auto max-h-[350px]'>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-100 ${
                  notification.read ? 'bg-white' : 'bg-slate-50'
                }`}
              >
                <div className='font-semibold mb-1 text-slate-800'>{notification.title}</div>
                <div className='text-sm text-slate-600 mb-2'>{notification.message}</div>
                <div className='text-xs text-slate-400'>{new Date(notification.timestamp).toLocaleString('vi-VN')}</div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className='p-8 text-center text-slate-400 text-sm'>Không có thông báo mới</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
