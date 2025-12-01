'use client'

import { useEffect, useState } from 'react'
import { Search, Loader2, Plus, BookOpen } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
  subjectName: string
  lecturerName: string
  schedule: string
  capacity: number
  enrolled: number
  isEnrolled: boolean
  prerequisites?: string
  semester: string
}

const MOCK_COURSES: Course[] = [
  {
    id: '10',
    name: 'Lập trình React',
    code: 'C003',
    subjectName: 'Lập trình Frontend',
    lecturerName: 'Nguyễn Văn F',
    schedule: 'T3, T5 14:00 - 15:30',
    enrolled: 28,
    capacity: 40,
    isEnrolled: false,
    prerequisites: 'Lập trình Web 101',
    semester: '1'
  },
  {
    id: '11',
    name: 'API & RESTful Services',
    code: 'C004',
    subjectName: 'Lập trình Backend',
    lecturerName: 'Trần Thị G',
    schedule: 'T2, T4 15:00 - 16:30',
    enrolled: 32,
    capacity: 40,
    isEnrolled: false,
    prerequisites: 'Lập trình OOP',
    semester: '1'
  },
  {
    id: '12',
    name: 'Bảo mật thông tin',
    code: 'S001',
    subjectName: 'An ninh mạng',
    lecturerName: 'Phạm Văn H',
    schedule: 'T6 09:00 - 11:30',
    enrolled: 25,
    capacity: 30,
    isEnrolled: false,
    prerequisites: 'Mạng máy tính',
    semester: '1'
  },
  {
    id: '13',
    name: 'Hệ điều hành',
    code: 'S002',
    subjectName: 'Hệ thống',
    lecturerName: 'Lê Văn I',
    schedule: 'T3 09:00 - 10:30',
    enrolled: 30,
    capacity: 40,
    isEnrolled: false,
    prerequisites: 'Kiến trúc máy tính',
    semester: '1'
  },
  {
    id: '14',
    name: 'Machine Learning Basics',
    code: 'AI001',
    subjectName: 'Trí tuệ nhân tạo',
    lecturerName: 'Hoàng Thị J',
    schedule: 'T2 13:00 - 14:30',
    enrolled: 35,
    capacity: 40,
    isEnrolled: false,
    prerequisites: 'Xử lý dữ liệu',
    semester: '1'
  }
]

export default function AllCoursesRoute() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAllCourses()
  }, [])

  const fetchAllCourses = async () => {
    setLoading(true)
    try {
      // TODO: Replace with API call:
      // const data = await fetch('/api/student/search?type=classes').then(r => r.json())
      // setCourses(data.results)
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      // TODO: Call enroll API:
      // await fetch('/api/student/enroll', {
      //   method: 'POST',
      //   body: JSON.stringify({ class_id: courseId, action: 'enroll' })
      // })
      setCourses(courses.map((c) => (c.id === courseId ? { ...c, isEnrolled: true, enrolled: c.enrolled + 1 } : c)))
    } catch (error) {
      console.error('Failed to enroll:', error)
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center bg-slate-50'>
        <div className='text-center'>
          <Loader2 size={40} className='text-[#dd7323] animate-spin mx-auto mb-3' />
          <p className='text-slate-600'>Đang tải khóa học...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full py-8 px-4 sm:px-6 lg:px-8 bg-slate-50'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Tất cả khóa học</h1>
          <p className='text-slate-600 mt-1'>Tìm kiếm và đăng ký khóa học mới</p>
        </div>

        {/* Search Bar */}
        <div className='mb-6'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' size={20} />
            <input
              type='text'
              placeholder='Tìm kiếm theo tên khóa học, mã lớp, chủ đề hoặc giảng viên...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none bg-white'
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className='bg-white rounded-xl border border-slate-200 p-12 text-center'>
            <BookOpen size={48} className='mx-auto text-slate-300 mb-4' />
            <p className='text-slate-500'>Không tìm thấy khóa học nào</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCourses.map((course) => {
              const isFull = course.enrolled >= course.capacity

              return (
                <div
                  key={course.id}
                  className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1'
                >
                  {/* Header */}
                  <div className='bg-gradient-to-r from-slate-800 to-slate-600 p-4 text-white'>
                    <p className='text-sm opacity-90'>{course.subjectName}</p>
                    <h3 className='text-lg font-bold mt-1'>{course.name}</h3>
                    <p className='text-xs opacity-75 mt-1'>{course.code}</p>
                  </div>

                  {/* Content */}
                  <div className='p-4 space-y-3'>
                    <div className='text-sm'>
                      <p className='text-slate-600'>
                        <span className='font-semibold'>Giảng viên:</span> {course.lecturerName}
                      </p>
                    </div>

                    <div className='text-sm'>
                      <p className='text-slate-600 mb-1'>
                        <span className='font-semibold'>Lịch:</span> {course.schedule}
                      </p>
                    </div>

                    <div className='text-sm'>
                      <p className='text-slate-600 mb-1'>
                        <span className='font-semibold'>Sĩ số:</span> {course.enrolled}/{course.capacity}
                      </p>
                      <div className='w-full bg-slate-200 rounded-full h-2 overflow-hidden'>
                        <div
                          className={`h-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${(course.enrolled / course.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {course.prerequisites && (
                      <div className='text-xs bg-slate-100 text-slate-600 p-2 rounded'>
                        <span className='font-semibold'>Yêu cầu:</span> {course.prerequisites}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className='border-t border-slate-100 p-4'>
                    {course.isEnrolled ? (
                      <button disabled className='w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium'>
                        ✓ Đã đăng ký
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={isFull}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          isFull
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-[#dd7323] text-white hover:bg-[#c2621a]'
                        }`}
                      >
                        <Plus size={16} />
                        {isFull ? 'Đã đầy' : 'Đăng ký'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
