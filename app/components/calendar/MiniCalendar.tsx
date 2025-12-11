import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Card,
  HStack,
  Circle,
  Spinner,
  Center,
  IconButton,
  Button
} from '@chakra-ui/react'
import { Calendar, ChevronLeft, ChevronRight, ChevronRight as ArrowRight } from 'lucide-react'
import { studentClassApi, type StudentClassAssignmentDTO } from '~/services/studentApi'
import { lecturerClassApi } from '~/services/lecturerApi'
import api from '~/utils/axios'

// Calendar constants
const DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Calendar day type
interface CalendarDayData {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  hasDeadline: boolean
  deadlineCount: number
  assignments: AssignmentDeadline[]
}

// Assignment type for internal use
interface AssignmentDeadline {
  id: string | number
  title: string
  deadline: string
  type?: string
  class_id?: string
  class_name?: string
  subject_name?: string
  description?: string
  is_submitted?: boolean
}

interface MiniCalendarProps {
  variant: 'student' | 'lecturer'
  onViewFull?: () => void
  title?: string
}

export default function MiniCalendar({ variant, onViewFull, title }: MiniCalendarProps) {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [deadlines, setDeadlines] = useState<AssignmentDeadline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Fetch deadlines based on variant
  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        setIsLoading(true)

        if (variant === 'student') {
          // Student: fetch assignments from enrolled classes
          const enrolledClasses = await studentClassApi.getEnrolledClasses()
          
          if (!enrolledClasses || enrolledClasses.length === 0) {
            setDeadlines([])
            return
          }

          const assignmentPromises = enrolledClasses.map(async (cls: any) => {
            try {
              const classId = (cls.id || cls.class_id || '').replace('CLASS#', '')
              const response = await api.get('/api/student/assignments', {
                params: { classId }
              })
              const assignments: StudentClassAssignmentDTO[] =
                (response.data as any)?.data ||
                response.data?.results ||
                (Array.isArray(response.data) ? response.data : [])

              return assignments.map((a) => ({
                id: a.id,
                title: a.title,
                deadline: a.deadline,
                type: a.type,
                class_id: classId,
                class_name: cls.name || classId
              }))
            } catch {
              return []
            }
          })

          const allAssignments = (await Promise.all(assignmentPromises)).flat()
          setDeadlines(allAssignments)
        } else {
          // Lecturer: fetch assignments from teaching classes, deadline = assignment deadline + 7 days
          const classesResponse = await lecturerClassApi.getClasses()
          const classes = (classesResponse as any)?.data || classesResponse?.results || []

          if (!classes || classes.length === 0) {
            setDeadlines([])
            return
          }

          const assignmentPromises = classes.map(async (cls: any) => {
            try {
              const classId = (cls.id || '').replace('CLASS#', '')
              const response = await api.get(`/api/lecturer/classes/${classId}/assignments`)
              const assignments =
                (response.data as any)?.data ||
                response.data?.results ||
                (Array.isArray(response.data) ? response.data : [])

              // Lecturer deadline = assignment deadline + 7 days
              return assignments.map((a: any) => {
                const originalDeadline = new Date(a.deadline || a.dueDate)
                const gradingDeadline = new Date(originalDeadline.getTime() + 7 * 24 * 60 * 60 * 1000)
                return {
                  id: a.id,
                  title: a.title,
                  deadline: gradingDeadline.toISOString(),
                  type: a.type,
                  class_id: classId,
                  class_name: cls.name || classId
                }
              })
            } catch {
              return []
            }
          })

          const allAssignments = (await Promise.all(assignmentPromises)).flat()
          setDeadlines(allAssignments)
        }
      } catch (error) {
        console.error('Error fetching deadlines:', error)
        setDeadlines([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeadlines()
  }, [variant])

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
      const dayDeadlines = deadlines.filter((d) => {
        if (!d.deadline) return false
        const deadlineDate = new Date(d.deadline).toISOString().split('T')[0]
        return deadlineDate === dateStr
      })

      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        hasDeadline: dayDeadlines.length > 0,
        deadlineCount: dayDeadlines.length,
        assignments: dayDeadlines
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate, deadlines])

  // Calendar navigation
  const goToPrevMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const goToNextMonth = () => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  // Handle day click - open modal with assignments
  const handleDayClick = (day: CalendarDayData) => {
    if (day.hasDeadline && day.assignments.length > 0) {
      setSelectedDay(day)
      setModalOpen(true)
    }
  }

  // Handle assignment click - navigate to class detail
  const handleAssignmentClick = (assignment: AssignmentDeadline) => {
    setModalOpen(false)
    if (variant === 'lecturer') {
      navigate(`/lecturer/classes/${assignment.class_id}`)
    } else {
      navigate(`/student/course-details/${assignment.class_id}`)
    }
  }

  // Format deadline time
  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  }

  // Default view full handler
  const handleViewFull = () => {
    if (onViewFull) {
      onViewFull()
    } else if (variant === 'student') {
      navigate('/student/calendar')
    }
  }

  const calendarTitle = title || (variant === 'student' ? 'Lịch' : 'Deadline chấm bài')
  const legendText = variant === 'student' ? 'Deadline bài tập' : 'Deadline chấm bài'

  return (
    <Card.Root
      bg='white'
      borderRadius='xl'
      border='1px solid'
      borderColor='orange.100'
      shadow='sm'
      height='fit-content'
    >
      <Card.Header pb={2} pt={5} px={6}>
        <HStack justify='space-between'>
          <HStack gap={3}>
            <Box p={2} bg='#dd7323' borderRadius='lg'>
              <Calendar size={20} color='white' />
            </Box>
            <Heading size='md' color='gray.800'>
              {calendarTitle}
            </Heading>
          </HStack>
          {variant === 'student' && (
            <Button
              variant='ghost'
              size='sm'
              color='#dd7323'
              _hover={{ bg: 'orange.50' }}
              onClick={handleViewFull}
            >
              Xem đầy đủ
              <ArrowRight size={16} />
            </Button>
          )}
        </HStack>
      </Card.Header>

      <Card.Body pt={2} pb={4}>
        {/* Calendar Navigation */}
        <HStack justify='space-between' mb={3}>
          <IconButton
            aria-label='Tháng trước'
            variant='ghost'
            size='sm'
            color='#dd7323'
            _hover={{ bg: 'orange.50' }}
            onClick={goToPrevMonth}
          >
            <ChevronLeft size={18} />
          </IconButton>
          <Text fontWeight='semibold' color='#dd7323'>
            Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
          </Text>
          <IconButton
            aria-label='Tháng sau'
            variant='ghost'
            size='sm'
            color='#dd7323'
            _hover={{ bg: 'orange.50' }}
            onClick={goToNextMonth}
          >
            <ChevronRight size={18} />
          </IconButton>
        </HStack>

        {isLoading ? (
          <Center h='200px'>
            <Spinner size='lg' color='#dd7323' />
          </Center>
        ) : (
          <>
            {/* Day Headers */}
            <Grid templateColumns='repeat(7, 1fr)' gap={1} mb={2}>
              {DAYS_SHORT.map((day) => (
                <Text key={day} textAlign='center' fontSize='xs' fontWeight='semibold' color='#dd7323'>
                  {day}
                </Text>
              ))}
            </Grid>

            {/* Calendar Grid */}
            <Grid templateColumns='repeat(7, 1fr)' gap={1}>
              {calendarDays.map((day, index) => (
                <GridItem
                  key={index}
                  p={1}
                  textAlign='center'
                  borderRadius='md'
                  bg={day.isToday ? '#dd7323' : 'transparent'}
                  color={day.isToday ? 'white' : day.isCurrentMonth ? 'gray.800' : 'gray.400'}
                  position='relative'
                  minH='32px'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  cursor={day.hasDeadline ? 'pointer' : 'default'}
                  _hover={day.hasDeadline ? { bg: day.isToday ? '#c5651f' : 'gray.100' } : {}}
                  onClick={() => handleDayClick(day)}
                >
                  <Text fontSize='sm' fontWeight={day.isToday ? 'bold' : 'normal'}>
                    {day.date.getDate()}
                  </Text>
                  {day.hasDeadline && !day.isToday && (
                    <Circle
                      size='1.5'
                      bg='red.500'
                      position='absolute'
                      bottom='1px'
                      left='50%'
                      transform='translateX(-50%)'
                    />
                  )}
                </GridItem>
              ))}
            </Grid>

            {/* Legend */}
            <HStack gap={4} mt={4} justify='center'>
              <HStack gap={1}>
                <Circle size='1.5' bg='red.500' />
                <Text fontSize='xs' color='gray.600'>
                  {legendText}
                </Text>
              </HStack>
            </HStack>
          </>
        )}
      </Card.Body>

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
            maxW='400px'
            w='90%'
            maxH='70vh'
            overflow='hidden'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <Box p={4} borderBottom='1px solid' borderColor='gray.200' bg='orange.50'>
              <HStack justify='space-between'>
                <Text fontWeight='bold' color='#dd7323'>
                  {variant === 'student' ? 'Bài tập' : 'Cần chấm'} trước ngày {selectedDay.date.toLocaleDateString('vi-VN')}
                </Text>
                <IconButton
                  aria-label='Đóng'
                  variant='ghost'
                  size='sm'
                  onClick={() => setModalOpen(false)}
                >
                  <Calendar size={16} />
                </IconButton>
              </HStack>
            </Box>

            {/* Modal Body */}
            <Box p={4} maxH='50vh' overflowY='auto'>
              <Grid gap={2}>
                {selectedDay.assignments.map((assignment, idx) => (
                  <Box
                    key={`${assignment.id}-${idx}`}
                    p={3}
                    borderRadius='lg'
                    border='1px solid'
                    borderColor='gray.200'
                    cursor='pointer'
                    _hover={{ borderColor: '#dd7323', bg: 'orange.50' }}
                    transition='all 0.2s'
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <Text fontWeight='semibold' fontSize='sm' color='gray.800' mb={1}>
                      {assignment.title}
                    </Text>
                    <HStack gap={2} fontSize='xs' color='gray.500'>
                      <Text>{assignment.class_name}</Text>
                      <Text>•</Text>
                      <Text>{formatDeadline(assignment.deadline)}</Text>
                    </HStack>
                  </Box>
                ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </Card.Root>
  )
}
