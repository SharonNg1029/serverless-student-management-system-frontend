'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Box, Tabs, VStack, HStack, Text, Spinner } from '@chakra-ui/react'
import { FileText, MessageSquare, ChevronLeft, ClipboardList } from 'lucide-react'
import PageHeader from '../../../../components/ui/PageHeader'
import { ErrorDisplay } from '../../../../components/ui/ErrorDisplay'
import { LecturerAssignmentTab, LecturerPostTab, LecturerGradeTab } from '../../../../components/lecturer'
import { lecturerClassApi } from '../../../../services/lecturerApi'

// Mock data
// Class info interface for API response
interface ClassInfo {
  id: string
  name: string
  subjectId?: string
  subjectName?: string
  lecturerId?: string
  lecturerName?: string
  semester?: string
  academicYear?: string
  studentCount?: number
  status?: number
}

export default function LecturerClassDetail() {
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

    try {
      // Fetch class info from lecturer classes API
      const response = await lecturerClassApi.getClasses()
      const classes = (response as any)?.data || response?.results || []
      // Find the class by ID (classId might not have CLASS# prefix)
      const foundClass = classes.find(
        (c: any) => c.id === classId || c.id === `CLASS#${classId}` || c.id?.replace('CLASS#', '') === classId
      )

      if (foundClass) {
        setClassInfo({
          id: foundClass.id,
          name: foundClass.name,
          subjectId: foundClass.subjectId,
          subjectName: foundClass.subjectName,
          lecturerId: foundClass.lecturerId || foundClass.teacherId,
          lecturerName: foundClass.lecturerName,
          semester: foundClass.semester,
          academicYear: foundClass.academicYear,
          studentCount: foundClass.studentCount || 0,
          status: foundClass.status
        })
      } else {
        // Fallback: use classId as name
        setClassInfo({
          id: classId,
          name: classId,
          studentCount: 0
        })
      }
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
          title={classInfo?.subjectName || classInfo?.name || 'Chi tiết lớp học'}
          subtitle={`${classInfo?.name || ''} • ${classInfo?.studentCount || 0} sinh viên • ${classInfo?.semester || ''} ${classInfo?.academicYear || ''}`}
        />

        {/* Tabs */}
        <Box px={6}>
          <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
            <Tabs.List bg='white' borderBottom='2px solid' borderColor='gray.100' mb={6} gap={0}>
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
              <LecturerAssignmentTab classId={classId || ''} />
            </Tabs.Content>

            <Tabs.Content value='posts'>
              <LecturerPostTab classId={classId || ''} />
            </Tabs.Content>

            <Tabs.Content value='grades'>
              <LecturerGradeTab classId={classId || ''} studentCount={classInfo?.studentCount || 0} />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Box>
    </Box>
  )
}
