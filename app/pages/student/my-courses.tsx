'use client'

import { useEffect, useState, useCallback } from 'react'
import { Box, Button, Text, VStack, Spinner, HStack, Heading, Icon, Center } from '@chakra-ui/react'
import { ErrorDisplay } from '../../components/ui/ErrorDisplay'
import { BookOpen, GraduationCap, Plus } from 'lucide-react'
import api from '../../utils/axios'
import CourseCard, { type EnrolledClass } from '../../components/ui/CourseCard'
import { useAuthStore } from '../../store/authStore'
import { toaster } from '../../components/ui/toaster'

// API Response type matching backend ClassDTO
interface ClassDTO {
  class_id: string
  name: string
  student_count: number
  status: number
  subjectName: string
  lecturerName: string
  semester?: string
  academic_year?: string
  description?: string
  enrolled_at?: string
}

interface APIResponse {
  results: ClassDTO[]
}

export default function MyCoursesRoute() {
  const [courses, setCourses] = useState<EnrolledClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuthStore()

  const fetchMyCourses = useCallback(async () => {
    if (!user?.id) {
      setError('Vui lòng đăng nhập để xem danh sách lớp học.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Call API to get enrolled classes
      const response = await api.get<APIResponse>('/student/classes/class-enrolled', {
        params: {
          student_id: user.id
        }
      })

      // Map API response to EnrolledClass format
      const mappedCourses: EnrolledClass[] = (response.data.results || []).map((c) => ({
        classId: c.class_id,
        subjectId: c.class_id, // Using class_id as subjectId if not provided
        subjectName: c.subjectName || c.name,
        lecturerName: c.lecturerName,
        totalStudents: c.student_count,
        enrolledAt: c.enrolled_at
      }))

      setCourses(mappedCourses)
    } catch (err: any) {
      console.error('Failed to fetch enrolled courses:', err)
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách lớp học. Vui lòng thử lại.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchMyCourses()
  }, [fetchMyCourses])

  const handleViewDetails = (classId: string) => {
    window.location.href = `/student/course-details/${classId}`
  }

  const handleUnenroll = async (classId: string) => {
    if (!user?.id) {
      toaster.error({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để thực hiện thao tác này.'
      })
      throw new Error('User not authenticated')
    }

    try {
      // Call unenroll API - POST /student/enroll with action='unenroll'
      await api.post('/student/enroll', {
        class_id: classId,
        action: 'unenroll',
        studentId: user.id
      })

      // Remove from local state on success
      setCourses(courses.filter((c) => c.classId !== classId))

      toaster.success({
        title: 'Thành công',
        description: 'Đã hủy đăng ký lớp học thành công.'
      })
    } catch (err: any) {
      console.error('Failed to unenroll:', err)
      const errorMessage = err.response?.data?.message || 'Không thể hủy đăng ký lớp học. Vui lòng thử lại.'
      toaster.error({
        title: 'Lỗi',
        description: errorMessage
      })
      throw err // Re-throw to let CourseCard handle error state
    }
  }

  if (loading) {
    return (
      <Box minH='60vh' display='flex' alignItems='center' justifyContent='center'>
        <VStack gap={4} colorPalette='orange'>
          <Spinner size='xl' color='colorPalette.500' borderWidth='4px' />
          <Text color='fg.muted' fontWeight='medium'>
            Loading courses...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    // Detect unauthenticated error
    const isUnauth = error.toLowerCase().includes('đăng nhập') || error.toLowerCase().includes('login')
    return (
      <ErrorDisplay
        variant={isUnauth ? 'unauthenticated' : 'fetch'}
        message={error}
        onRetry={!isUnauth ? fetchMyCourses : undefined}
        retryLabel={!isUnauth ? undefined : 'Đăng nhập'}
      />
    )
  }

  // Main UI
  return (
    <Box w='full' py={8} px={{ base: 4, sm: 6, lg: 8 }} bg='white' minH='100vh'>
      <Box maxW='6xl' mx='auto'>
        {/* Header - simplified */}
        <HStack mb={10} justifyContent='space-between' flexWrap='wrap' gap={4} p={6}>
          <VStack alignItems='flex-start' gap={2}>
            <HStack gap={3}>
              <Box
                p={2}
                bg='orange.500'
                borderRadius='xl'
                shadow='lg'
                _hover={{ transform: 'rotate(5deg)', transition: 'all 0.3s' }}
              >
                <Icon asChild color='white'>
                  <GraduationCap size={32} />
                </Icon>
              </Box>
              <Heading
                size='4xl'
                fontWeight='bold'
                bgGradient='to-r'
                gradientFrom='gray.800'
                gradientTo='gray.600'
                bgClip='text'
              >
                My Courses
              </Heading>
            </HStack>
            <Text color='gray.600' fontSize='md' fontWeight='medium'>
              Manage the courses you have enrolled in
            </Text>
          </VStack>
          <Button
            colorPalette='orange'
            variant='solid'
            size='lg'
            borderRadius='xl'
            shadow='md'
            gap={2}
            px={6}
            fontWeight='semibold'
            _hover={{
              shadow: '0 8px 25px -5px rgba(237, 137, 54, 0.5)',
              transform: 'translateY(-2px)'
            }}
            transition='all 0.2s ease-in-out'
            onClick={() => (window.location.href = '/student/all-courses')}
          >
            <Plus size={18} />
            Enroll New Course
          </Button>
        </HStack>

        {/* Courses Grid or Suggest Enroll */}
        {courses.length === 0 ? (
          <Center py={20}>
            <VStack
              gap={8}
              p={12}
              bg='white'
              borderRadius='3xl'
              shadow='xl'
              border='2px dashed'
              borderColor='orange.200'
              maxW='lg'
              w='full'
              position='relative'
              overflow='hidden'
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                bgGradient: 'to-r',
                gradientFrom: 'orange.400',
                gradientTo: 'amber.400'
              }}
            >
              <Box p={6} borderRadius='full' bg='orange.50' shadow='inner' border='3px solid' borderColor='orange.100'>
                <Icon asChild color='orange.500' boxSize={16}>
                  <BookOpen size={64} />
                </Icon>
              </Box>
              <VStack gap={3}>
                <Text
                  fontWeight='bold'
                  fontSize='2xl'
                  bgGradient='to-r'
                  gradientFrom='gray.800'
                  gradientTo='gray.600'
                  bgClip='text'
                >
                  No courses enrolled yet!
                </Text>
                <Text color='gray.600' textAlign='center' fontSize='md' lineHeight='1.7' maxW='sm'>
                  You have not enrolled in any courses yet. Explore and enroll now!
                </Text>
              </VStack>
              <Button
                bg='orange.500'
                color='white'
                size='xl'
                borderRadius='xl'
                shadow='lg'
                px={8}
                _hover={{
                  bg: 'orange.600',
                  shadow: 'xl',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }}
                onClick={() => (window.location.href = '/student/all-courses')}
              >
                <BookOpen size={20} />
                Explore and enroll in courses
              </Button>
            </VStack>
          </Center>
        ) : (
          <Box w='full'>
            {/* Grid với Flexbox để căn giữa các card khi không đủ 3 */}
            <Box display='flex' flexWrap='wrap' justifyContent='center' gap={8} w='full'>
              {courses.map((course) => (
                <Box
                  key={course.classId}
                  w={{ base: 'full', md: 'calc(50% - 16px)', lg: 'calc(33.333% - 22px)' }}
                  maxW='360px'
                  display='flex'
                  justifyContent='center'
                >
                  <CourseCard course={course} onViewDetails={handleViewDetails} onUnenroll={handleUnenroll} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
