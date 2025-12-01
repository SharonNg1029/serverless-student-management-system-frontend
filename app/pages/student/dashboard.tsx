'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { BookOpen, AlertCircle, Bell, TrendingUp, Loader2 } from 'lucide-react'

interface DashboardStats {
  enrolledClasses: number
  upcomingAssignments: number
  unreadNotifications: number
  averageScore: number
}

interface RecentActivity {
  id: number
  type: 'assignment' | 'notification' | 'grade' | 'post'
  title: string
  content: string
  date: string
  className: string
}

const MOCK_STATS: DashboardStats = {
  enrolledClasses: 5,
  upcomingAssignments: 8,
  unreadNotifications: 3,
  averageScore: 8.2
}

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: 1,
    type: 'assignment',
    title: 'Bài tập tuần 5',
    content: 'Lập trình Web 101 - Hạn nộp: 2 ngày nữa',
    date: '1 giờ trước',
    className: 'Lập trình Web 101'
  },
  {
    id: 2,
    type: 'grade',
    title: 'Bài kiểm tra đã được chấm',
    content: 'Điểm: 9.0/10 - Database Design',
    date: '3 giờ trước',
    className: 'Database Design'
  },
  {
    id: 3,
    type: 'post',
    title: 'Bài đăng mới từ giảng viên',
    content: 'Hướng dẫn làm bài tập tuần này',
    date: '5 giờ trước',
    className: 'Lập trình Web 101'
  },
  {
    id: 4,
    type: 'notification',
    title: 'Thông báo từ hệ thống',
    content: 'Lớp Lập trình Web 101 sẽ có bài kiểm tra vào thứ 5',
    date: '1 ngày trước',
    className: 'Lập trình Web 101'
  },
  {
    id: 5,
    type: 'assignment',
    title: 'Bài tập tuần 4',
    content: 'Cơ sở dữ liệu - Hạn nộp: 5 ngày nữa',
    date: '2 ngày trước',
    className: 'Cơ sở dữ liệu'
  }
]

export default function StudentDashboardRoute() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(MOCK_ACTIVITIES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return '📝'
      case 'grade':
        return '📊'
      case 'post':
        return '💬'
      case 'notification':
        return '🔔'
      default:
        return '•'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'border-l-blue-500 bg-blue-50'
      case 'grade':
        return 'border-l-green-500 bg-green-50'
      case 'post':
        return 'border-l-purple-500 bg-purple-50'
      case 'notification':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-slate-500 bg-slate-50'
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 size={40} className='text-[#dd7323] animate-spin mx-auto mb-3' />
          <p className='text-slate-600'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full py-8 px-4 sm:px-6 lg:px-8 bg-slate-50'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Dashboard</h1>
          <p className='text-slate-600 mt-1'>Chào mừng, {user?.fullName}</p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-slate-500 text-sm font-medium'>Lớp đã đăng ký</p>
                <p className='text-3xl font-bold text-slate-900 mt-2'>{stats.enrolledClasses}</p>
              </div>
              <div className='p-3 bg-blue-100 rounded-lg'>
                <BookOpen size={24} className='text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-slate-500 text-sm font-medium'>Bài tập sắp tới</p>
                <p className='text-3xl font-bold text-slate-900 mt-2'>{stats.upcomingAssignments}</p>
              </div>
              <div className='p-3 bg-orange-100 rounded-lg'>
                <AlertCircle size={24} className='text-orange-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-slate-500 text-sm font-medium'>Thông báo mới</p>
                <p className='text-3xl font-bold text-slate-900 mt-2'>{stats.unreadNotifications}</p>
              </div>
              <div className='p-3 bg-green-100 rounded-lg'>
                <Bell size={24} className='text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-slate-500 text-sm font-medium'>Điểm trung bình</p>
                <p className='text-3xl font-bold text-slate-900 mt-2'>{stats.averageScore.toFixed(1)}</p>
              </div>
              <div className='p-3 bg-purple-100 rounded-lg'>
                <TrendingUp size={24} className='text-purple-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-6'>
          <h2 className='text-xl font-bold text-slate-900 mb-6'>Hoạt động gần đây</h2>

          <div className='space-y-4'>
            {recentActivities.length === 0 ? (
              <p className='text-slate-500 text-center py-8'>Chưa có hoạt động nào</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className={`border-l-4 rounded-r-lg p-4 ${getActivityColor(activity.type)}`}>
                  <div className='flex items-start gap-3'>
                    <span className='text-2xl'>{getActivityIcon(activity.type)}</span>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-slate-900'>{activity.title}</h3>
                      <p className='text-slate-600 text-sm mt-1'>{activity.content}</p>
                      <div className='flex items-center justify-between mt-2'>
                        <span className='text-xs text-slate-500'>{activity.className}</span>
                        <span className='text-xs text-slate-400'>{activity.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
