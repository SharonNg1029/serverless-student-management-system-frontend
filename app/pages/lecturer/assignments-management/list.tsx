'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  FileText,
  Plus,
  Search,
  Loader2,
  Filter,
  X,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  File
} from 'lucide-react'
import { lecturerClassApi, lecturerMaterialApi } from '../../../services/lecturerApi'
import { toaster } from '../../../components/ui/toaster'
import type { ClassDTO, MaterialDTO } from '../../../types'

interface AssignmentWithComments extends MaterialDTO {
  comments_count?: number
  likes_count?: number
  liked_by_current_user?: boolean
}

interface Comment {
  id: number
  author: string
  avatar: string
  content: string
  file_url?: string
  file_name?: string
  timestamp: string
  likes: number
  liked: boolean
}

// Mock comments for testing
const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    author: 'Nguyễn Văn A',
    avatar: 'https://ui-avatars.com/api/?name=Nguyễn+Văn+A&background=dd7323&color=fff',
    content: 'Em đã hoàn thành bài tập này. Em gửi file bên dưới.',
    file_url: 'https://example.com/baitap_sv1.pdf',
    file_name: 'baitap_sv1.pdf',
    timestamp: '2 giờ trước',
    likes: 1,
    liked: false
  },
  {
    id: 2,
    author: 'Trần Thị B',
    avatar: 'https://ui-avatars.com/api/?name=Trần+Thị+B&background=3b82f6&color=fff',
    content: 'Mình có câu hỏi về phần 2 của bài tập. Phần này có phải là...',
    timestamp: '1 giờ trước',
    likes: 0,
    liked: false
  },
  {
    id: 3,
    author: 'Lê Văn C',
    avatar: 'https://ui-avatars.com/api/?name=Lê+Văn+C&background=10b981&color=fff',
    content: 'Em nộp bài tập rồi ạ',
    file_url: 'https://example.com/baitap_sv3.zip',
    file_name: 'baitap_sv3.zip',
    timestamp: '30 phút trước',
    likes: 2,
    liked: true
  }
]

export default function LecturerAssignmentsList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [classes, setClasses] = useState<ClassDTO[]>([])
  const [assignments, setAssignments] = useState<AssignmentWithComments[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<number | null>(null)
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({})
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({})

  // Filters
  const [selectedClass, setSelectedClass] = useState<number | ''>(
    Number.parseInt(searchParams.get('class_id') || '') || ''
  )
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 500)
    return () => clearTimeout(timer)
  }, [keyword])

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses()
  }, [])

  // Fetch assignments when class or keyword changes
  useEffect(() => {
    if (selectedClass) {
      fetchAssignments(selectedClass)
    } else {
      setAssignments([])
      setLoading(false)
    }
  }, [selectedClass, debouncedKeyword])

  const fetchClasses = async () => {
    try {
      const res = await lecturerClassApi.getClasses({ status: 1 })
      // Fallback to mock classes if API fails
      const classesData = res.results || [
        {
          id: 1,
          name: 'Lập trình Web 101',
          subject_name: 'Web Development',
          semester: 'Học kỳ I',
          academic_year: '2024-2025'
        }
      ]
      setClasses(classesData)

      if (!selectedClass && classesData.length > 0) {
        setSelectedClass(classesData[0].id)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchAssignments = async (classId: number) => {
    try {
      setLoading(true)
      const params: any = {}
      if (debouncedKeyword) params.keyword = debouncedKeyword

      const res = await lecturerMaterialApi.getMaterials(classId, params)
      // Mock assignments for testing
      const assignmentsData = res.results || [
        {
          id: 1,
          title: 'Bài tập 1: HTML & CSS Cơ Bản',
          description: 'Tạo một trang web đơn giản với HTML và CSS. Yêu cầu: Header, Navigation, Main content, Footer',
          uploaded_at: new Date().toISOString(),
          file_type: 'pdf',
          file_url: 'https://example.com/assignment1.pdf',
          comments_count: 5,
          likes_count: 3
        },
        {
          id: 2,
          title: 'Bài tập 2: JavaScript DOM Manipulation',
          description:
            'Viết các hàm JavaScript để thao tác với DOM. Xử lý sự kiện click, submit form, validate dữ liệu',
          uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          file_type: 'docx',
          comments_count: 8,
          likes_count: 5
        }
      ]
      setAssignments(assignmentsData)

      // Load mock comments for each assignment
      assignmentsData.forEach((assignment) => {
        setComments((prev) => ({
          ...prev,
          [assignment.id]: MOCK_COMMENTS
        }))
      })
    } catch (error: any) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (assignment: MaterialDTO) => {
    if (!confirm(`Bạn có chắc muốn xóa bài tập "${assignment.title}"?`)) return

    try {
      await lecturerMaterialApi.deleteMaterial(assignment.id)
      toaster.create({
        title: 'Xóa thành công',
        description: `Đã xóa bài tập "${assignment.title}"`,
        type: 'success'
      })
      if (selectedClass) fetchAssignments(Number(selectedClass))
    } catch (error: any) {
      toaster.create({
        title: 'Xóa thất bại',
        description: error.response?.data?.message || 'Có lỗi xảy ra',
        type: 'error'
      })
    }
  }

  const handleLikeComment = (assignmentId: number, commentId: number) => {
    setComments((prev) => ({
      ...prev,
      [assignmentId]: prev[assignmentId].map((c) =>
        c.id === commentId ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      )
    }))
  }

  const handlePostComment = (assignmentId: number) => {
    const content = newComment[assignmentId] || ''
    if (!content.trim()) return

    const newCmt: Comment = {
      id: Math.max(...(comments[assignmentId]?.map((c) => c.id) || [0])) + 1,
      author: 'Giảng viên',
      avatar: 'https://ui-avatars.com/api/?name=Giảng+viên&background=dd7323&color=fff',
      content: content,
      timestamp: 'Bây giờ',
      likes: 0,
      liked: false
    }

    setComments((prev) => ({
      ...prev,
      [assignmentId]: [...(prev[assignmentId] || []), newCmt]
    }))
    setNewComment((prev) => ({
      ...prev,
      [assignmentId]: ''
    }))
  }

  const clearFilters = () => {
    setKeyword('')
  }

  return (
    <div className='space-y-6 pb-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Bài tập & Thảo luận</h1>
          <p className='text-slate-500 mt-1'>Đăng bài tập và tương tác với sinh viên</p>
        </div>
        <button
          onClick={() =>
            navigate(`/lecturer/assignments-management/form${selectedClass ? `?class_id=${selectedClass}` : ''}`)
          }
          className='flex items-center gap-2 px-4 py-2 bg-[#dd7323] text-white rounded-xl hover:bg-[#c2621a] font-medium transition-all shadow-lg shadow-orange-200'
        >
          <Plus size={18} />
          Tạo bài tập mới
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-16 z-10'>
        <div className='flex flex-wrap gap-3 items-end'>
          <div className='w-64'>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              <Filter size={14} className='inline mr-1' /> Chọn lớp học
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value === '' ? '' : Number.parseInt(e.target.value))}
              className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent'
            >
              <option value=''>Chọn lớp...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className='flex-1 min-w-[200px]'>
            <label className='block text-sm font-medium text-slate-700 mb-1'>
              <Search size={14} className='inline mr-1' /> Tìm kiếm
            </label>
            <input
              type='text'
              placeholder='Tìm kiếm bài tập...'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent'
            />
          </div>

          {keyword && (
            <button
              onClick={clearFilters}
              className='px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2'
            >
              <X size={16} /> Xóa
            </button>
          )}
        </div>
      </div>

      {/* Assignments Feed */}
      {!selectedClass ? (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center'>
          <FileText size={48} className='mx-auto mb-4 text-slate-300' />
          <p className='text-slate-500'>Vui lòng chọn lớp học để xem danh sách bài tập</p>
        </div>
      ) : loading ? (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center'>
          <Loader2 size={40} className='text-[#dd7323] animate-spin mb-3' />
          <p className='text-slate-600'>Đang tải danh sách bài tập...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className='bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center'>
          <FileText size={48} className='mx-auto mb-4 text-slate-300' />
          <p className='text-slate-500'>Chưa có bài tập nào trong lớp này</p>
          <button
            onClick={() => navigate(`/lecturer/assignments-management/form?class_id=${selectedClass}`)}
            className='mt-4 text-[#dd7323] hover:underline'
          >
            Tạo bài tập mới
          </button>
        </div>
      ) : (
        <div className='space-y-6 max-w-2xl mx-auto'>
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all'
            >
              {/* Post Header */}
              <div className='p-5 border-b border-slate-100'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-[#dd7323] rounded-full flex items-center justify-center text-white font-bold'>
                      GV
                    </div>
                    <div>
                      <h4 className='font-semibold text-slate-800'>Giảng viên</h4>
                      <p className='text-xs text-slate-500'>
                        {new Date(assignment.uploaded_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <button className='p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded'>
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className='p-5 border-b border-slate-100'>
                <h3 className='font-bold text-lg text-slate-800 mb-2'>{assignment.title}</h3>
                <p className='text-slate-600 text-sm leading-relaxed mb-4'>{assignment.description}</p>

                {/* File Attachment */}
                {assignment.file_url && (
                  <div className='bg-slate-50 p-3 rounded-lg flex items-center gap-3 border border-slate-200'>
                    <div className='w-10 h-10 bg-orange-100 rounded flex items-center justify-center'>
                      <File size={18} className='text-[#dd7323]' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-slate-800 truncate'>Tệp đính kèm</p>
                      <p className='text-xs text-slate-500'>{assignment.file_type || 'PDF'}</p>
                    </div>
                    <a
                      href={assignment.file_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='px-3 py-1 bg-[#dd7323] text-white text-xs rounded hover:bg-[#c2621a] transition-colors'
                    >
                      Tải về
                    </a>
                  </div>
                )}
              </div>

              {/* Post Stats */}
              <div className='px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500'>
                <span>{assignment.likes_count || 0} lượt thích</span>
                <span>{(comments[assignment.id] || []).length} bình luận</span>
              </div>

              {/* Post Actions */}
              <div className='px-5 py-3 flex items-center gap-2 border-b border-slate-100'>
                <button className='flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-[#dd7323] hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium'>
                  <Heart size={16} />
                  Thích
                </button>
                <button
                  onClick={() => setExpandedAssignmentId(expandedAssignmentId === assignment.id ? null : assignment.id)}
                  className='flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium'
                >
                  <MessageCircle size={16} />
                  Bình luận
                </button>
                <button className='flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors text-sm font-medium'>
                  <Share2 size={16} />
                  Chia sẻ
                </button>
              </div>

              {/* Comments Section */}
              {expandedAssignmentId === assignment.id && (
                <div className='bg-slate-50'>
                  {/* Comments List */}
                  <div className='space-y-4 p-5'>
                    {(comments[assignment.id] || []).map((comment) => (
                      <div key={comment.id} className='flex gap-3'>
                        <img
                          src={comment.avatar || '/placeholder.svg'}
                          alt={comment.author}
                          className='w-9 h-9 rounded-full flex-shrink-0'
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='bg-white rounded-lg p-3 border border-slate-200'>
                            <p className='font-semibold text-sm text-slate-800'>{comment.author}</p>
                            <p className='text-sm text-slate-700 mt-1'>{comment.content}</p>

                            {/* File in Comment */}
                            {comment.file_url && (
                              <div className='mt-2 flex items-center gap-2 bg-slate-100 p-2 rounded text-xs'>
                                <File size={14} className='text-slate-500' />
                                <a
                                  href={comment.file_url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-[#dd7323] hover:underline'
                                >
                                  {comment.file_name || 'Tệp đính kèm'}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className='flex items-center gap-3 mt-2 px-3 text-xs text-slate-500'>
                            <button
                              onClick={() => handleLikeComment(assignment.id, comment.id)}
                              className={`flex items-center gap-1 ${
                                comment.liked ? 'text-red-500' : 'hover:text-red-500'
                              }`}
                            >
                              <Heart size={12} fill={comment.liked ? 'currentColor' : 'none'} />
                              {comment.likes}
                            </button>
                            <span>{comment.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className='px-5 pb-4 border-t border-slate-200 pt-3'>
                    <div className='flex gap-3 items-end'>
                      <img
                        src='https://ui-avatars.com/api/?name=Giảng+viên&background=dd7323&color=fff'
                        alt='You'
                        className='w-8 h-8 rounded-full flex-shrink-0'
                      />
                      <div className='flex-1 flex gap-2'>
                        <input
                          type='text'
                          placeholder='Viết bình luận...'
                          value={newComment[assignment.id] || ''}
                          onChange={(e) =>
                            setNewComment((prev) => ({
                              ...prev,
                              [assignment.id]: e.target.value
                            }))
                          }
                          className='flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent'
                        />
                        <button
                          onClick={() => handlePostComment(assignment.id)}
                          className='px-4 py-2 bg-[#dd7323] text-white rounded-lg hover:bg-[#c2621a] text-sm font-medium transition-colors'
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
