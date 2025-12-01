'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Users, Calendar, Loader2, LogOut } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
  subjectName: string
  lecturerName: string
  schedule: string
  enrolledAt: string
  studentCount: number
  status: 'ongoing' | 'completed' | 'upcoming'
}

const MOCK_COURSES: Course[] = [
  {
    id: '1',
    name: 'Lập trình Web 101 (C001)',
    code: 'C001',
    subjectName: 'Lập trình Web',
    lecturerName: 'Nguyễn Văn A',
    schedule: 'T3, T5 10:00 - 11:30',
    enrolledAt: '2024-09-15',
    studentCount: 35,
    status: 'ongoing'
  },
  {
    id: '2',
    name: 'Cơ sở dữ liệu (D001)',
    code: 'D001',
    subjectName: 'Cơ sở dữ liệu',
    lecturerName: 'Trần Thị B',
    schedule: 'T2, T4 14:00 - 15:30',
    enrolledAt: '2024-09-16',
    studentCount: 32,
    status: 'ongoing'
  },
  {
    id: '3',
    name: 'Kiến trúc máy tính (A001)',
    code: 'A001',
    subjectName: 'Kiến trúc máy tính',
    lecturerName: 'Phạm Văn C',
    schedule: 'T6 09:00 - 11:30',
    enrolledAt: '2024-09-17',
    studentCount: 28,
    status: 'ongoing'
  },
  {
    id: '4',
    name: 'Lập trình OOP (C002)',
    code: 'C002',
    subjectName: 'Lập trình OOP',
    lecturerName: 'Lê Văn D',
    schedule: 'T3 15:00 - 16:30',
    enrolledAt: '2024-09-10',
    studentCount: 40,
    status: 'ongoing'
  },
  {
    id: '5',
    name: 'Mạng máy tính (N001)',
    code: 'N001',
    subjectName: 'Mạng máy tính',
    lecturerName: 'Hoàng Thị E',
    schedule: 'T4, T6 13:00 - 14:30',
    enrolledAt: '2024-09-12',
    studentCount: 30,
    status: 'ongoing'
  }
]

export default function MyCoursesRoute() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('ongoing')

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    setLoading(true)
    try {
      // TODO: Replace with API call
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (courseId: string) => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký lớp này?')) return

    try {
      // TODO: Call unenroll API
      setCourses(courses.filter((c) => c.id !== courseId))
    } catch (error) {
      console.error('Failed to unenroll:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'upcoming':
        return 'bg-slate-100 text-slate-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Đang học'
      case 'completed':
        return 'Hoàn thành'
      case 'upcoming':
        return 'Sắp diễn ra'
      default:
        return 'Chưa xác định'
    }
  }

  const filteredCourses = filter === 'all' ? courses : courses.filter((c) => c.status === filter)

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 size={40} className='text-[#dd7323] animate-spin mx-auto mb-3' />
          <p className='text-slate-600'>Đang tải lớp học...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full py-8 px-4 sm:px-6 lg:px-8 bg-slate-50'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-slate-900'>Lớp học của tôi</h1>
            <p className='text-slate-600 mt-1'>Quản lý các lớp học bạn đã đăng ký</p>
          </div>
          <button
            onClick={() => (window.location.href = '/student/all-courses')}
            className='px-6 py-3 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-colors'
          >
            Đăng ký thêm lớp
          </button>
        </div>

        {/* Filter Tabs */}
        <div className='flex gap-2 mb-6'>
          {(['all', 'ongoing', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-[#dd7323] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {status === 'all' ? 'Tất cả' : status === 'ongoing' ? 'Đang học' : 'Hoàn thành'}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className='bg-white rounded-xl border border-slate-200 p-12 text-center'>
            <BookOpen size={48} className='mx-auto text-slate-300 mb-4' />
            <p className='text-slate-500 mb-4'>Bạn chưa đăng ký lớp học nào</p>
            <button
              onClick={() => (window.location.href = '/student/all-courses')}
              className='px-6 py-2 bg-[#dd7323] text-white rounded-lg hover:bg-[#c2621a] font-medium'
            >
              Đăng ký ngay
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1'
              >
                {/* Header */}
                <div className='bg-gradient-to-r from-[#dd7323] to-[#ff8c42] p-4 text-white'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='text-sm opacity-90'>{course.subjectName}</p>
                      <h3 className='text-lg font-bold mt-1'>{course.name}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(course.status)}`}>
                      {getStatusLabel(course.status)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className='p-4 space-y-3'>
                  <div className='flex items-center gap-2 text-slate-600'>
                    <Users size={16} />
                    <span className='text-sm'>{course.lecturerName}</span>
                  </div>

                  <div className='flex items-center gap-2 text-slate-600'>
                    <Calendar size={16} />
                    <span className='text-sm'>{course.schedule}</span>
                  </div>

                  <div className='flex items-center gap-2 text-slate-600'>
                    <BookOpen size={16} />
                    <span className='text-sm'>{course.studentCount} sinh viên</span>
                  </div>

                  <p className='text-xs text-slate-400'>
                    Đăng ký: {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                {/* Footer */}
                <div className='border-t border-slate-100 p-4 flex gap-2'>
                  <button
                    onClick={() => (window.location.href = `/student/course-details/${course.id}`)}
                    className='flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors'
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleUnenroll(course.id)}
                    className='px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors'
                    title='Hủy đăng ký'
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
