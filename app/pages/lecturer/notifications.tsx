'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell, Trash2, Loader2 } from 'lucide-react'
import { fetchAuthSession } from '@aws-amplify/auth'

// API response format from BE
interface NotificationFromAPI {
  id: string
  title: string
  content: string
  type: string // "SYSTEM_ALERT", "INFO", "CLASS", etc.
  isRead: boolean
  createdAt: string
  className?: string
  classId?: string
}

interface LecturerClass {
  id: string
  name?: string
}

interface Notification {
  id: string
  title: string
  content: string
  type: 'system' | 'class'
  class_id?: string
  className?: string
  sent_at: string
  read: boolean
}

// Map BE type to UI type
const mapNotificationType = (type?: string): 'system' | 'class' => {
  switch (type?.toUpperCase()) {
    case 'SYSTEM_ALERT':
    case 'SYSTEM':
      return 'system'
    case 'CLASS':
    case 'INFO':
    default:
      return 'class'
  }
}

export default function LecturerNotificationsRoute() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'system' | 'class'>('all')

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      // Lấy idToken từ Cognito session
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()

      if (!idToken) {
        throw new Error('Không tìm thấy token xác thực')
      }

      const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

      // Gọi song song: notifications và lecturer classes
      const [notificationsResponse, classesResponse] = await Promise.all([
        fetch(`${baseUrl}/api/notifications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
            'user-idToken': idToken
          }
        }),
        fetch(`${baseUrl}/api/lecturer/classes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
            'user-idToken': idToken
          }
        })
      ])

      // Parse notifications response
      let allNotifications: NotificationFromAPI[] = []
      if (notificationsResponse.ok) {
        const notisData = await notificationsResponse.json()
        allNotifications = notisData.data || notisData.results || []
      }

      // Lấy danh sách classId của GV
      let lecturerClassIds: string[] = []
      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        const classes: LecturerClass[] = classesData.data || classesData.results || []
        lecturerClassIds = classes.map((c) => c.id)
      }

      // Filter notifications cho Lecturer:
      // - type: "system" → show luôn
      // - type: "class" → chỉ show nếu GV có classId đó
      const filteredNotifications = allNotifications.filter((n: NotificationFromAPI) => {
        const notificationType = (n.type || 'system').toLowerCase()

        // System notifications → show luôn
        if (notificationType === 'system') {
          return true
        }

        // Class notifications → chỉ show nếu GV có classId đó
        if (notificationType === 'class') {
          const notificationClassId = n.classId
          return notificationClassId && lecturerClassIds.includes(notificationClassId)
        }

        // Các type khác → show luôn (fallback)
        return true
      })

      const mappedNotifications: Notification[] = filteredNotifications.map((n: NotificationFromAPI) => ({
        id: String(n.id),
        title: n.title || 'Thông báo',
        content: n.content || '',
        type: mapNotificationType(n.type),
        class_id: n.classId,
        className: n.className,
        sent_at: n.createdAt || new Date().toISOString(),
        read: n.isRead ?? false
      }))

      setNotifications(mappedNotifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

      // Optimistic update
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))

      // API: PATCH /api/notifications/:id/read
      await fetch(`${baseUrl}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'user-idToken': idToken || ''
        }
      }).catch(() => {})
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

      // Optimistic update
      setNotifications(notifications.filter((n) => n.id !== id))

      // API call
      await fetch(`${baseUrl}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
          'user-idToken': idToken || ''
        }
      }).catch(() => {})
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (filter !== 'all') {
      filtered = notifications.filter((n) => n.type === filter)
    }

    return filtered.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return '⚙️'
      case 'class':
        return '📚'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'border-l-orange-400 bg-orange-50'
      case 'class':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-slate-400 bg-slate-50'
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 size={40} className='text-[#dd7323] animate-spin mx-auto mb-3' />
          <p className='text-slate-600'>Đang tải thông báo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full py-8 px-4 sm:px-6 lg:px-8 bg-white'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Thông báo</h1>
          <p className='text-slate-600 mt-1'>
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo chưa đọc'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
          {(['all', 'system', 'class'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-[#dd7323] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#dd7323]'
              }`}
            >
              {type === 'all' ? 'Tất cả' : type === 'system' ? 'Hệ thống' : 'Lớp học'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className='space-y-3'>
          {filteredNotifications.length === 0 ? (
            <div className='bg-white rounded-xl border border-slate-200 p-12 text-center'>
              <Bell size={48} className='mx-auto text-slate-300 mb-4' />
              <p className='text-slate-500'>Không có thông báo nào</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`border-l-4 rounded-r-lg p-4 cursor-pointer transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'shadow-sm' : ''
                }`}
              >
                <div className='flex items-start gap-4'>
                  <span className='text-3xl shrink-0'>{getNotificationIcon(notification.type)}</span>

                  <div className='flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className={`font-semibold ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className='inline-block w-2 h-2 bg-[#dd7323] rounded-full'></span>
                          )}
                        </div>
                        <p className='text-slate-600 text-sm mt-1'>{notification.content}</p>

                        <div className='flex items-center justify-between mt-2'>
                          <div className='flex gap-2'>
                            {notification.className && (
                              <span className='text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded'>
                                {notification.className}
                              </span>
                            )}
                            <span className='text-xs text-slate-400'>
                              {new Date(notification.sent_at).toLocaleDateString('vi-VN')}{' '}
                              {new Date(notification.sent_at).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notification.id)
                    }}
                    className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0'
                    title='Xóa thông báo'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
