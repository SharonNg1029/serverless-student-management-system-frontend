'use client'

import { useEffect, useState } from 'react'
import { Bell, Trash2, Loader2 } from 'lucide-react'

interface Notification {
  id: number
  title: string
  content: string
  type: 'system' | 'class' | 'personal'
  class_id?: number
  className?: string
  sent_at: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Thông báo hạn nộp bài tập',
    content: 'Bài tập tuần 5 của lớp Lập trình Web 101 sẽ hết hạn vào 18:00 ngày mai',
    type: 'class',
    className: 'Lập trình Web 101',
    class_id: 1,
    sent_at: '2024-11-28T14:30:00',
    read: false
  },
  {
    id: 2,
    title: 'Điểm kiểm tra đã công bố',
    content: 'Giảng viên đã công bố điểm kiểm tra của lớp Cơ sở dữ liệu. Bạn đạt 9.0/10',
    type: 'class',
    className: 'Cơ sở dữ liệu',
    class_id: 2,
    sent_at: '2024-11-28T10:15:00',
    read: false
  },
  {
    id: 3,
    title: 'Lịch học thay đổi',
    content: 'Lớp Kiến trúc máy tính sẽ học vào lúc 10:00 - 11:30 thay vì 09:00 - 10:30 vào thứ 6',
    type: 'class',
    className: 'Kiến trúc máy tính',
    class_id: 3,
    sent_at: '2024-11-27T16:45:00',
    read: true
  },
  {
    id: 4,
    title: 'Cập nhật hệ thống',
    content: 'Hệ thống học tập sẽ bảo trì vào 22:00 - 23:00 ngày 30/11/2024',
    type: 'system',
    sent_at: '2024-11-27T09:00:00',
    read: true
  },
  {
    id: 5,
    title: 'Có bình luận mới trong bài đăng của bạn',
    content: 'Giảng viên Nguyễn Văn A đã bình luận về câu hỏi của bạn',
    type: 'personal',
    sent_at: '2024-11-26T15:20:00',
    read: true
  },
  {
    id: 6,
    title: 'Tham gia lớp thành công',
    content: 'Bạn đã được chấp nhận tham gia lớp Lập trình OOP (C002)',
    type: 'class',
    className: 'Lập trình OOP',
    class_id: 4,
    sent_at: '2024-11-25T12:30:00',
    read: true
  }
]

export default function NotificationsReceiveRoute() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'system' | 'class' | 'personal' | 'unread'>('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // TODO: Replace with API call
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (filter === 'unread') {
      filtered = notifications.filter((n) => !n.read)
    } else if (filter !== 'all') {
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
      case 'personal':
        return '💬'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'border-l-slate-400 bg-slate-50'
      case 'class':
        return 'border-l-blue-500 bg-blue-50'
      case 'personal':
        return 'border-l-purple-500 bg-purple-50'
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
    <div className='w-full py-8 px-4 sm:px-6 lg:px-8 bg-slate-50'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Thông báo</h1>
          <p className='text-slate-600 mt-1'>
            {unreadCount} thông báo chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
          {(['all', 'unread', 'system', 'class', 'personal'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-[#dd7323] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {type === 'all'
                ? 'Tất cả'
                : type === 'unread'
                  ? 'Chưa đọc'
                  : type === 'system'
                    ? 'Hệ thống'
                    : type === 'class'
                      ? 'Lớp học'
                      : 'Cá nhân'}
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
                  <span className='text-3xl flex-shrink-0'>{getNotificationIcon(notification.type)}</span>

                  <div className='flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className={`font-semibold ${!notification.read ? 'text-slate-900' : 'text-slate-800'}`}>
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
                    className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0'
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
