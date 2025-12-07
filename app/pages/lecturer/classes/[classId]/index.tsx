'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Box, Tabs, VStack, HStack, Text, Spinner } from '@chakra-ui/react'
import { FileText, MessageSquare, ChevronLeft, ClipboardList } from 'lucide-react'
import PageHeader from '../../../../components/ui/PageHeader'
import { ErrorDisplay } from '../../../../components/ui/ErrorDisplay'
import { LecturerAssignmentTab, LecturerPostTab, LecturerGradeTab } from '../../../../components/lecturer'
import { lecturerClassApi } from '../../../../services/lecturerApi'
import type { ClassDTO } from '../../../../types'

// Mock data
const USE_MOCK_DATA = true

const MOCK_CLASS_INFO: Record<string, ClassDTO> = {
  '1': { id: 1, name: 'CS101-01', subject_id: 1, subject_name: 'Nhập môn lập trình', teacher_id: 1, teacher_name: 'Nguyễn Văn An', semester: 'HK1', academic_year: '2024-2025', student_count: 45, status: 1, created_at: '', updated_at: '' },
  '2': { id: 2, name: 'CS201-02', subject_id: 2, subject_name: 'Cấu trúc dữ liệu', teacher_id: 1, teacher_name: 'Nguyễn Văn An', semester: 'HK1', academic_year: '2024-2025', student_count: 38, status: 1, created_at: '', updated_at: '' },
  '3': { id: 3, name: 'CS301-01', subject_id: 3, subject_name: 'Cơ sở dữ liệu', teacher_id: 1, teacher_name: 'Nguyễn Văn An', semester: 'HK1', academic_year: '2024-2025', student_count: 42, status: 1, created_at: '', updated_at: '' }
}

export default function LecturerClassDetail() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classInfo, setClassInfo] = useState<ClassDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('assignments')

  const fetchClassInfo = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    setError(null)

    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 300))
      const mockData = MOCK_CLASS_INFO[classId] || {
        id: Number(classId),
        name: `Class-${classId}`,
        subject_id: 1,
        subject_name: 'Môn học mẫu',
        teacher_id: 1,
        semester: 'HK1',
        academic_year: '2024-2025',
        student_count: 30,
        status: 1,
        created_at: '',
        updated_at: ''
      }
      setClassInfo(mockData)
      setLoading(false)
      return
    }

    try {
      const data = await lecturerClassApi.getClassById(Number(classId))
      setClassInfo(data)
    } catch (err) {
      console.error('Failed to fetch class info:', err)
      setError('Không thể tải thông tin lớp học. Vui lòng thử lại.')
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
          onClick={() => navigate('/lecturer/my-courses')}
          w='fit-content'
        >
          <ChevronLeft size={20} />
          <Text fontWeight='medium'>Quay lại danh sách lớp</Text>
        </HStack>

        {/* Header */}
        <PageHeader
          icon={FileText}
          title={classInfo?.subject_name || 'Chi tiết lớp học'}
          subtitle={`${classInfo?.name || ''} • ${classInfo?.student_count || 0} sinh viên • ${classInfo?.semester || ''} ${classInfo?.academic_year || ''}`}
        />

        {/* Tabs */}
        <Box px={6}>
          <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
            <Tabs.List 
              bg='white' 
              borderBottom='2px solid' 
              borderColor='gray.100' 
              mb={6}
              gap={0}
            >
              <Tabs.Trigger
                value='assignments'
                px={6}
                py={3}
                fontWeight='medium'
                color='gray.500'
                borderBottom='3px solid'
                borderColor='transparent'
                marginBottom='-2px'
                _selected={{ 
                  color: '#dd7323', 
                  borderColor: '#dd7323',
                  fontWeight: 'semibold'
                }}
                _hover={{ color: '#dd7323' }}
                transition='all 0.2s'
              >
                <HStack gap={2}>
                  <FileText size={18} />
                  <Text>Bài tập</Text>
                </HStack>
              </Tabs.Trigger>
              <Tabs.Trigger
                value='posts'
                px={6}
                py={3}
                fontWeight='medium'
                color='gray.500'
                borderBottom='3px solid'
                borderColor='transparent'
                marginBottom='-2px'
                _selected={{ 
                  color: '#dd7323', 
                  borderColor: '#dd7323',
                  fontWeight: 'semibold'
                }}
                _hover={{ color: '#dd7323' }}
                transition='all 0.2s'
              >
                <HStack gap={2}>
                  <MessageSquare size={18} />
                  <Text>Bài đăng</Text>
                </HStack>
              </Tabs.Trigger>
              <Tabs.Trigger
                value='grades'
                px={6}
                py={3}
                fontWeight='medium'
                color='gray.500'
                borderBottom='3px solid'
                borderColor='transparent'
                marginBottom='-2px'
                _selected={{ 
                  color: '#dd7323', 
                  borderColor: '#dd7323',
                  fontWeight: 'semibold'
                }}
                _hover={{ color: '#dd7323' }}
                transition='all 0.2s'
              >
                <HStack gap={2}>
                  <ClipboardList size={18} />
                  <Text>Bảng điểm</Text>
                </HStack>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value='assignments'>
              <LecturerAssignmentTab classId={Number(classId)} />
            </Tabs.Content>

            <Tabs.Content value='posts'>
              <LecturerPostTab classId={Number(classId)} />
            </Tabs.Content>

            <Tabs.Content value='grades'>
              <LecturerGradeTab classId={Number(classId)} studentCount={classInfo?.student_count || 0} />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Box>
    </Box>
  )
}
