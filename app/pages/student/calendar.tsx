import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  IconButton,
  Button,
  Circle,
  HStack,
  VStack,
  Spinner,
  Center,
  Card
} from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Clock, BookOpen, FileText, ExternalLink } from 'lucide-react'
import { studentClassApi, type StudentClassAssignmentDTO } from '~/services/studentApi'
import api from '~/utils/axios'
import PageHeader from '~/components/ui/PageHeader'
import { toaster } from '~/components/ui/toaster'

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const MONTHS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12'
]

// Assignment type colors
const TYPE_COLORS: Record<string, string> = {
  homework: '#22c55e',
  project: '#8b5cf6',
  midterm: '#dd7323',
  final: '#ef4444'
}

const TYPE_LABELS: Record<string, string> = {
  homework: 'Bài tập',
  project: 'Dự án',
  midterm: 'Giữa kỳ',
  final: 'Cuối kỳ'
}

// Extended assignment with class info
interface CalendarAssignmentItem extends StudentClassAssignmentDTO {
  class_name?: string
  subject_name?: string
}

// Calendar day type
interface CalendarDayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  assignments: CalendarAssignmentItem[]
}

export default function StudentCalendar() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [assignments, setAssignments] = useState<CalendarAssignmentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Fetch all assignments from enrolled classes
  useEffect(() => {
    const fetchAllAssignments = async () => {
      try {
        setIsLoading(true)

        // 1. Get enrolled classes
        const enrolledClasses = await studentClassApi.getEnrolledClasses()
        console.log('Enrolled classes:', enrolledClasses)

        if (!enrolledClasses || enrolledClasses.length === 0) {
          setAssignments([])
          return
        }

        // 2. Fetch assignments for each class in parallel
        const assignmentPromises = enrolledClasses.map(async (cls: any) => {
          try {
            // API trả về "id" thay vì "class_id" - ví dụ: "8FDFBC5E"
            const rawClassId = cls.id || cls.class_id || ''
            const normalizedClassId = rawClassId.replace('CLASS#', '')
            
            console.log(`Fetching assignments for class: ${normalizedClassId}`)
            // Call API directly: /api/student/assignments?classId=xxx
            const response = await api.get('/api/student/assignments', {
              params: { classId: normalizedClassId }
            })
            console.log(`API Response for ${normalizedClassId}:`, response.data)
            
            // Extract assignments from response
            const classAssignments: StudentClassAssignmentDTO[] = 
              (response.data as any)?.data || 
              response.data?.results || 
              (Array.isArray(response.data) ? response.data : [])
            console.log(`Assignments for ${normalizedClassId}:`, classAssignments)

            // Add class info to each assignment
            return classAssignments.map((a) => ({
              ...a,
              class_id: normalizedClassId,
              class_name: cls.name || normalizedClassId,
              subject_name: cls.subjectName || ''
            }))
          } catch (error) {
            console.error(`Error fetching assignments for class ${cls.id || cls.class_id}:`, error)
            return []
          }
        })

        const allAssignmentsArrays = await Promise.all(assignmentPromises)
        const allAssignments = allAssignmentsArrays.flat()

        console.log('All assignments:', allAssignments)
        setAssignments(allAssignments)
      } catch (error: any) {
        console.error('Error fetching assignments:', error)
        toaster.create({
          title: 'Lỗi',
          description: 'Không thể tải danh sách bài tập',
          type: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllAssignments()
  }, [])

  // Generate calendar days
  const calendarDays = useMemo<CalendarDayData[]>(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    const days: CalendarDayData[] = []
    const current = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0]
      const dayAssignments = assignments.filter((a) => {
        if (!a.deadline) return false
        const assignmentDate = new Date(a.deadline).toISOString().split('T')[0]
        return assignmentDate === dateStr
      })

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        assignments: dayAssignments
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate, assignments])

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Handle day click - show modal with assignments
  const handleDayClick = (day: CalendarDayData) => {
    if (day.assignments.length > 0) {
      setSelectedDay(day)
      setModalOpen(true)
    }
  }

  // Format deadline time
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Check if deadline is overdue
  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  // Handle assignment click - navigate to class detail
  const handleAssignmentClick = (assignment: CalendarAssignmentItem) => {
    setModalOpen(false)
    navigate(`/student/course-details/${assignment.class_id}`)
  }

  return (
    <Box w='full' py={8} px={{ base: 4, sm: 6, lg: 8 }} bg='white' minH='100vh'>
      <Box maxW='1200px' mx='auto'>
        {/* Header */}
        <PageHeader icon={CalendarIcon} title='Lịch học' subtitle='Theo dõi deadline và lịch trình học tập'>
          <HStack gap={2}>
            <Button
              variant='outline'
              size='sm'
              borderColor='orange.200'
              color='#dd7323'
              _hover={{ bg: 'orange.50' }}
              onClick={goToToday}
            >
              Hôm nay
            </Button>
          </HStack>
        </PageHeader>

        {/* Calendar Navigation */}
        <Card.Root bg='white' borderRadius='xl' border='1px solid' borderColor='orange.200' shadow='sm' mb={6}>
          <Card.Body p={4}>
            <Flex justify='space-between' align='center'>
              <HStack gap={2}>
                <IconButton
                  aria-label='Tháng trước'
                  variant='ghost'
                  size='sm'
                  color='#dd7323'
                  _hover={{ bg: 'orange.50' }}
                  onClick={goToPrevMonth}
                >
                  <ChevronLeft size={20} />
                </IconButton>
                <IconButton
                  aria-label='Tháng sau'
                  variant='ghost'
                  size='sm'
                  color='#dd7323'
                  _hover={{ bg: 'orange.50' }}
                  onClick={goToNextMonth}
                >
                  <ChevronRight size={20} />
                </IconButton>
              </HStack>

              <Text fontSize='xl' fontWeight='bold' color='#dd7323'>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>

              {/* Legend */}
              <Flex gap={4} flexWrap='wrap'>
                <HStack gap={2}>
                  <Circle size='3' bg='green.500' />
                  <Text fontSize='sm' color='gray.600'>
                    Bài tập
                  </Text>
                </HStack>
                <HStack gap={2}>
                  <Circle size='3' bg='purple.500' />
                  <Text fontSize='sm' color='gray.600'>
                    Dự án
                  </Text>
                </HStack>
                <HStack gap={2}>
                  <Circle size='3' bg='#dd7323' />
                  <Text fontSize='sm' color='gray.600'>
                    Giữa kỳ
                  </Text>
                </HStack>
                <HStack gap={2}>
                  <Circle size='3' bg='red.500' />
                  <Text fontSize='sm' color='gray.600'>
                    Cuối kỳ
                  </Text>
                </HStack>
              </Flex>
            </Flex>
          </Card.Body>
        </Card.Root>

        {isLoading ? (
          <Center h='400px'>
            <VStack gap={4}>
              <Spinner size='xl' color='#dd7323' borderWidth='4px' />
              <Text color='gray.500'>Đang tải lịch...</Text>
            </VStack>
          </Center>
        ) : (
          <Card.Root
            bg='white'
            borderRadius='xl'
            border='1px solid'
            borderColor='orange.200'
            shadow='sm'
            overflow='hidden'
          >
            {/* Day headers */}
            <Grid templateColumns='repeat(7, 1fr)' bg='orange.50'>
              {DAYS.map((day) => (
                <GridItem key={day} p={3} textAlign='center'>
                  <Text fontWeight='semibold' color='#dd7323' fontSize='sm'>
                    {day}
                  </Text>
                </GridItem>
              ))}
            </Grid>

            {/* Calendar grid */}
            <Grid templateColumns='repeat(7, 1fr)' templateRows={`repeat(${Math.ceil(calendarDays.length / 7)}, 1fr)`}>
              {calendarDays.map((day, index) => (
                <GridItem
                  key={index}
                  p={2}
                  minH='100px'
                  bg={day.isToday ? 'orange.50' : day.isCurrentMonth ? 'white' : 'gray.50'}
                  borderTop='1px solid'
                  borderLeft={index % 7 === 0 ? 'none' : '1px solid'}
                  borderColor='orange.100'
                  position='relative'
                  cursor={day.assignments.length > 0 ? 'pointer' : 'default'}
                  _hover={{ bg: day.isCurrentMonth ? 'orange.50' : 'gray.100' }}
                  transition='all 0.2s'
                  onClick={() => handleDayClick(day)}
                >
                  {/* Date number */}
                  <Text
                    fontSize='sm'
                    fontWeight={day.isToday ? 'bold' : 'normal'}
                    color={day.isCurrentMonth ? (day.isToday ? '#dd7323' : 'gray.800') : 'gray.400'}
                    mb={1}
                  >
                    {day.isToday ? (
                      <Circle size='7' bg='#dd7323' color='white' display='inline-flex' fontSize='sm' fontWeight='bold'>
                        {day.date.getDate()}
                      </Circle>
                    ) : (
                      day.date.getDate()
                    )}
                  </Text>

                  {/* Assignments */}
                  <VStack align='stretch' gap={1}>
                    {day.assignments.slice(0, 3).map((assignment, idx) => (
                      <Box
                        key={`${assignment.id}-${idx}`}
                        px={2}
                        py={1}
                        bg={TYPE_COLORS[assignment.type] || '#6b7280'}
                        color='white'
                        borderRadius='md'
                        fontSize='xs'
                        _hover={{ opacity: 0.8, transform: 'scale(1.02)' }}
                        transition='all 0.2s'
                        lineClamp={1}
                      >
                        {assignment.title}
                      </Box>
                    ))}
                    {day.assignments.length > 3 && (
                      <Text fontSize='xs' color='#dd7323' fontWeight='medium' pl={1}>
                        +{day.assignments.length - 3} khác
                      </Text>
                    )}
                  </VStack>
                </GridItem>
              ))}
            </Grid>
          </Card.Root>
        )}

        {/* Assignment Modal */}
        {modalOpen && selectedDay && (
          <Box
            position='fixed'
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg='blackAlpha.600'
            zIndex={1000}
            display='flex'
            alignItems='center'
            justifyContent='center'
            onClick={() => setModalOpen(false)}
          >
            <Box
              bg='white'
              borderRadius='xl'
              maxW='500px'
              w='90%'
              maxH='80vh'
              overflow='hidden'
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <Flex
                justify='space-between'
                align='center'
                p={4}
                borderBottom='1px solid'
                borderColor='gray.200'
                bg='orange.50'
              >
                <Text fontWeight='bold' color='#dd7323'>
                  Bài tập ngày {selectedDay.date.toLocaleDateString('vi-VN')}
                </Text>
                <IconButton
                  aria-label='Đóng'
                  variant='ghost'
                  size='sm'
                  onClick={() => setModalOpen(false)}
                >
                  <X size={20} />
                </IconButton>
              </Flex>

              {/* Modal Body */}
              <Box p={4} maxH='60vh' overflowY='auto'>
                <VStack gap={3} align='stretch'>
                  {selectedDay.assignments.map((assignment, idx) => (
                    <Box
                      key={`${assignment.id}-${idx}`}
                      p={4}
                      borderRadius='lg'
                      border='1px solid'
                      borderColor='gray.200'
                      cursor='pointer'
                      _hover={{ borderColor: '#dd7323', shadow: 'sm', bg: 'orange.50' }}
                      transition='all 0.2s'
                      onClick={() => handleAssignmentClick(assignment)}
                    >
                      {/* Assignment Title */}
                      <Flex align='center' justify='space-between' mb={2}>
                        <Flex align='center' gap={2}>
                          <Circle size='3' bg={TYPE_COLORS[assignment.type] || '#6b7280'} />
                          <Text fontWeight='bold' color='gray.800'>
                            {assignment.title}
                          </Text>
                        </Flex>
                        <ExternalLink size={16} color='#dd7323' />
                      </Flex>

                      {/* Type Badge */}
                      <HStack gap={2} mb={2}>
                        <Box
                          px={2}
                          py={0.5}
                          borderRadius='full'
                          bg={`${TYPE_COLORS[assignment.type]}20`}
                          color={TYPE_COLORS[assignment.type]}
                          fontSize='xs'
                          fontWeight='semibold'
                        >
                          {TYPE_LABELS[assignment.type] || assignment.type}
                        </Box>
                        {assignment.is_submitted && (
                          <Box
                            px={2}
                            py={0.5}
                            borderRadius='full'
                            bg='green.100'
                            color='green.600'
                            fontSize='xs'
                            fontWeight='semibold'
                          >
                            Đã nộp
                          </Box>
                        )}
                        {!assignment.is_submitted && isOverdue(assignment.deadline) && (
                          <Box
                            px={2}
                            py={0.5}
                            borderRadius='full'
                            bg='red.100'
                            color='red.600'
                            fontSize='xs'
                            fontWeight='semibold'
                          >
                            Quá hạn
                          </Box>
                        )}
                      </HStack>

                      {/* Class Info */}
                      <HStack gap={2} mb={2} color='gray.600' fontSize='sm'>
                        <BookOpen size={14} />
                        <Text>{assignment.class_name || assignment.class_id}</Text>
                      </HStack>

                      {/* Deadline */}
                      <HStack gap={2} color={isOverdue(assignment.deadline) ? 'red.500' : 'gray.600'} fontSize='sm'>
                        <Clock size={14} />
                        <Text>Hạn nộp: {formatDeadline(assignment.deadline)}</Text>
                      </HStack>

                      {/* Description */}
                      {assignment.description && (
                        <Box mt={2} pt={2} borderTop='1px solid' borderColor='gray.100'>
                          <HStack gap={2} color='gray.500' fontSize='sm' mb={1}>
                            <FileText size={14} />
                            <Text fontWeight='medium'>Mô tả:</Text>
                          </HStack>
                          <Text fontSize='sm' color='gray.600'>
                            {assignment.description}
                          </Text>
                        </Box>
                      )}

                      {/* Score if available */}
                      {assignment.score !== null && assignment.score !== undefined && (
                        <Box mt={2} pt={2} borderTop='1px solid' borderColor='gray.100'>
                          <Text fontSize='sm' color='gray.600'>
                            Điểm: <Text as='span' fontWeight='bold' color='#dd7323'>{assignment.score}</Text>
                            {assignment.max_score && ` / ${assignment.max_score}`}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
