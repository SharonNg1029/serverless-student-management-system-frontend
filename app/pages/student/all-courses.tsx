'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Loader2, BookOpen } from 'lucide-react'
import { Box, SimpleGrid, Text, VStack, Spinner, Input, InputGroup } from '@chakra-ui/react'
import { ErrorDisplay } from '../../components/ui/ErrorDisplay'
import api from '../../utils/axios'

// API Response type
interface SubjectFromAPI {
  id: string
  name: string
  description?: string
  credits?: number
}

interface APIResponse {
  data: SubjectFromAPI[]
  count: number
  message: string
}

interface Subject {
  id: string
  name: string
  description: string
  credits: number
}

export default function AllCoursesRoute() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<APIResponse>('/api/v1/subjects')

      const mappedSubjects: Subject[] = (response.data.data || []).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || 'Chưa có mô tả',
        credits: s.credits || 0
      }))

      setSubjects(mappedSubjects)
    } catch (err) {
      setError('Không thể tải danh sách môn học. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Box minH='60vh' display='flex' alignItems='center' justifyContent='center' bg='gray.50'>
        <VStack gap={3}>
          <Spinner size='xl' color='orange.500' borderWidth='4px' />
          <Text color='gray.600'>Đang tải môn học...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return <ErrorDisplay variant='fetch' message={error} onRetry={fetchSubjects} />
  }

  return (
    <div className='w-full py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900'>Tất cả môn học</h1>
          <p className='text-slate-600 mt-1'>Khám phá các môn học có sẵn trong hệ thống</p>
        </div>

        {/* Search Bar */}
        <div className='mb-6'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10' size={20} />
            <input
              type='text'
              placeholder='Tìm kiếm theo tên môn học...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#dd7323]/20 focus:border-[#dd7323] outline-none bg-white'
            />
          </div>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <div className='bg-white rounded-xl border border-slate-200 p-12 text-center'>
            <BookOpen size={48} className='mx-auto text-slate-300 mb-4' />
            <p className='text-slate-500'>Không tìm thấy môn học nào</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                className='bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1'
              >
                {/* Header */}
                <div className='bg-gradient-to-r from-[#dd7323] to-[#ff8c42] p-4 text-white'>
                  <p className='text-sm opacity-90'>Mã môn: {subject.id}</p>
                  <h3 className='text-lg font-bold mt-1'>{subject.name}</h3>
                </div>

                {/* Content */}
                <div className='p-4 space-y-3'>
                  <div className='text-sm'>
                    <p className='text-slate-600 line-clamp-3'>{subject.description}</p>
                  </div>

                  {subject.credits > 0 && (
                    <div className='flex items-center gap-2'>
                      <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium'>
                        {subject.credits} tín chỉ
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className='border-t border-slate-100 p-4'>
                  <button
                    onClick={() => (window.location.href = `/student/subject/${subject.id}`)}
                    className='w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors'
                  >
                    Xem chi tiết
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
