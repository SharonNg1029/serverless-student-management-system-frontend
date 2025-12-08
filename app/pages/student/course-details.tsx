'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Box, Tabs, VStack, HStack, Text, Spinner, Card, Circle, Badge } from '@chakra-ui/react'
import { FileText, MessageSquare, ChevronLeft } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { AssignmentTab, PostTab } from '../../components/course'
import { ErrorDisplay } from '../../components/ui/ErrorDisplay'
import api from '../../utils/axios'

// ============================================
// MOCK DATA - Set to false to use real API
// ============================================
const USE_MOCK_DATA = false

const MOCK_CLASS_INFO: Record<string, ClassInfo> = {
  'CS101-01': {
    id: 1,
    name: 'CS101-01',
    subject_name: 'Nhập môn lập trình',
    teacher_name: 'Nguyễn Văn An',
    semester: 'HK1',
    academic_year: '2024-2025'
  },
  'CS201-02': {
    id: 2,
    name: 'CS201-02',
    subject_name: 'Cấu trúc dữ liệu và giải thuật',
    teacher_name: 'Trần Thị Bình',
    semester: 'HK1',
    academic_year: '2024-2025'
  },
  'CS301-01': {
    id: 3,
    name: 'CS301-01',
    subject_name: 'Cơ sở dữ liệu',
    teacher_name: 'Lê Hoàng Cường',
    semester: 'HK1',
    academic_year: '2024-2025'
  },
  'CS401-03': {
    id: 4,
    name: 'CS401-03',
    subject_name: 'Phát triển ứng dụng Web',
    teacher_name: 'Phạm Minh Đức',
    semester: 'HK1',
    academic_year: '2024-2025'
  },
  'CS501-01': {
    id: 5,
    name: 'CS501-01',
    subject_name: 'Trí tuệ nhân tạo',
    teacher_name: 'Hoàng Thị Lan',
    semester: 'HK1',
    academic_year: '2024-2025'
  }
}

interface ClassInfo {
  id: number
  name: string
  subject_name: string
  teacher_name: string
  semester: string
  academic_year: string
}

export default function CourseDetailsRoute() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('assignments')

  const fetchClassInfo = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    setError(null)

    // Use mock data for UI testing
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const mockData = MOCK_CLASS_INFO[classId] || {
        id: 1,
        name: classId,
        subject_name: 'Môn học mẫu',
        teacher_name: 'Giảng viên mẫu',
        semester: 'HK1',
        academic_year: '2024-2025'
      }
      setClassInfo(mockData)
      setLoading(false)
      return
    }

    try {
      // Try to get class info from student API
      const response = await api.get(`/api/student/classes/${classId}`)
      console.log('Class info response:', response.data)

      // Handle different response formats
      const data = response.data?.data || response.data?.result || response.data
      if (data) {
        setClassInfo({
          id: data.id || 0,
          name: data.name || data.title || classId,
          subject_name: data.subject_name || data.subjectName || data.subtitle || '',
          teacher_name: data.teacher_name || data.teacherName || data.lecturerName || '',
          semester: data.semester || '',
          academic_year: data.academic_year || data.academicYear || ''
        })
      } else {
        // Fallback: use classId as name if no data returned
        setClassInfo({
          id: 0,
          name: classId,
          subject_name: '',
          teacher_name: '',
          semester: '',
          academic_year: ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch class info:', err)
      // Don't show error, just use classId as fallback
      setClassInfo({
        id: 0,
        name: classId,
        subject_name: '',
        teacher_name: '',
        semester: '',
        academic_year: ''
      })
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchClassInfo()
  }, [fetchClassInfo])

  if (loading) {
    return (
      <Box minH='60vh' display='flex' alignItems='center' justifyContent='center' bg='white'>
        <VStack gap={3}>
          <Spinner size='xl' color='#dd7323' borderWidth='4px' />
          <Text color='gray.600'>Đang tải thông tin lớp học...</Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return <ErrorDisplay variant='fetch' message={error} onRetry={fetchClassInfo} />
  }

  return (
    <Box w='full' py={8} px={{ base: 4, sm: 6, lg: 8 }} bg='white' minH='100vh'>
      <Box maxW='6xl' mx='auto'>
        {/* Back Button */}
        <HStack
          mb={4}
          px={6}
          gap={2}
          cursor='pointer'
          color='gray.600'
          _hover={{ color: '#dd7323' }}
          onClick={() => navigate('/student/my-courses')}
          w='fit-content'
        >
          <ChevronLeft size={20} />
          <Text fontWeight='medium'>Quay lại danh sách lớp</Text>
        </HStack>

        {/* Header */}
        <PageHeader
          icon={FileText}
          title={classInfo?.subject_name || classInfo?.name || 'Chi tiết lớp học'}
          subtitle={
            [
              classInfo?.name,
              classInfo?.teacher_name ? `GV: ${classInfo.teacher_name}` : null,
              classInfo?.semester,
              classInfo?.academic_year
            ]
              .filter(Boolean)
              .join(' • ') || 'Thông tin lớp học'
          }
        />

        {/* Tabs */}
        <Box px={6}>
          <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
            <Tabs.List bg='orange.50' borderRadius='xl' p={1} mb={6}>
              <Tabs.Trigger
                value='assignments'
                flex={1}
                borderRadius='lg'
                fontWeight='semibold'
                _selected={{ bg: '#dd7323', color: 'white' }}
                _hover={{ bg: activeTab === 'assignments' ? '#dd7323' : 'orange.100' }}
              >
                <HStack gap={2}>
                  <FileText size={18} />
                  <Text>Bài tập</Text>
                </HStack>
              </Tabs.Trigger>
              <Tabs.Trigger
                value='posts'
                flex={1}
                borderRadius='lg'
                fontWeight='semibold'
                _selected={{ bg: '#dd7323', color: 'white' }}
                _hover={{ bg: activeTab === 'posts' ? '#dd7323' : 'orange.100' }}
              >
                <HStack gap={2}>
                  <MessageSquare size={18} />
                  <Text>Bài đăng</Text>
                </HStack>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value='assignments'>
              <AssignmentTab classId={classId || ''} />
            </Tabs.Content>

            <Tabs.Content value='posts'>
              <PostTab classId={classId || ''} />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Box>
    </Box>
  )
}
