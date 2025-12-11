'use client'

import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  Text,
  Heading,
  Badge,
  Card,
  HStack,
  VStack,
  Circle,
  Spinner,
  Center,
  Button
} from '@chakra-ui/react'
import {
  Bell,
  BookOpen,
  Award,
  Megaphone,
  ChevronRight as ArrowRight,
  FileText,
  Users,
  ClipboardCheck,
  ExternalLink
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import PageHeader from '../../components/ui/PageHeader'
import StatsCard from '../../components/ui/StatsCard'
import { lecturerClassApi, lecturerNotificationApi } from '../../services/lecturerApi'
import type { ClassDTO, NotificationDTO } from '../../types'
import MiniCalendar from '../../components/calendar/MiniCalendar'

// ============================================
// HELPER FUNCTIONS
// ============================================
const getVietnameseDay = (day: number): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  return days[day]
}

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  return formatDate(date)
}

export default function LecturerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const today = new Date()

  // Fetch classes - API trả về { data: [...], count, message, status }
  const { data: classesData, isLoading: classesLoading } = useQuery({
    queryKey: ['lecturer-classes'],
    queryFn: async () => {
      const response = await lecturerClassApi.getClasses()
      return response
    }
  })

  // Fetch notifications - API trả về array trực tiếp
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['lecturer-notifications'],
    queryFn: async () => {
      try {
        const response = await lecturerNotificationApi.getReceivedNotifications()
        // API đã trả về array trực tiếp
        return Array.isArray(response) ? response : []
      } catch {
        // Nếu API lỗi, trả về empty array
        return []
      }
    }
  })

  // Parse classes from API response - handle both formats
  const classes = useMemo(() => {
    const data = (classesData as any)?.data || classesData?.results || []
    return Array.isArray(data) ? data : []
  }, [classesData])

  // Parse notifications - filter theo type
  // - type: "system" → show luôn
  // - type: "class" → chỉ show nếu GV có classId đó trong danh sách lớp của mình
  const notifications = useMemo(() => {
    const allNotifications = Array.isArray(notificationsData) ? notificationsData : []

    // Lấy danh sách classId của GV
    const lecturerClassIds = classes.map((c: any) => c.id)

    // Filter notifications
    return allNotifications.filter((n: any) => {
      const notificationType = n.type || 'system'

      // System notifications → show luôn
      if (notificationType === 'system') {
        return true
      }

      // Class notifications → chỉ show nếu GV có classId đó
      if (notificationType === 'class') {
        const notificationClassId = n.classId || n.class_id
        return notificationClassId && lecturerClassIds.includes(notificationClassId)
      }

      // Các type khác → show luôn (fallback)
      return true
    })
  }, [notificationsData, classes])

  // Calculate stats
  const unreadCount = notifications.filter((n: any) => !n.is_read && !n.isRead).length
  const activeClasses = classes.filter((c: any) => c.status === 1 || c.status === 'active').length
  const totalStudents = classes.reduce((sum: number, c: any) => sum + (c.student_count || c.studentCount || 0), 0)

  const statsLoading = classesLoading || notificationsLoading

  return (
    <Box minH='100vh' bg='white' py={8} px={{ base: 4, md: 6, lg: 8 }}>
      <Box maxW='1400px' mx='auto'>
        {/* Hero Section */}
        <Box mb={8}>
          <PageHeader
            icon={Award}
            title={`Chào mừng quay trở lại, ${user?.fullName || 'Giảng viên'}!`}
            subtitle={`Hôm nay là ${getVietnameseDay(today.getDay())}, ngày ${formatDate(today)}`}
          />

          {/* Quick Stats Grid */}
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} px={6}>
            <StatsCard
              label='Thông báo chưa đọc'
              value={unreadCount}
              icon={Bell}
              isLoading={statsLoading}
              onClick={() => navigate('/lecturer/notifications')}
            />
            <StatsCard
              label='Lớp đang giảng dạy'
              value={activeClasses}
              icon={BookOpen}
              isLoading={statsLoading}
              onClick={() => navigate('/lecturer/my-courses')}
            />
            <StatsCard label='Tổng sinh viên' value={totalStudents} icon={Users} isLoading={statsLoading} />
            <StatsCard label='Bài tập chưa chấm' value='--' icon={FileText} isLoading={statsLoading} />
          </Grid>

          {/* Exam System Card */}
          <Box px={6} mt={6}>
            <Card.Root
              bg='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              borderRadius='2xl'
              shadow='lg'
              overflow='hidden'
              position='relative'
              _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
              transition='all 0.3s'
              cursor='pointer'
              onClick={() => window.open('https://c-examlab.vercel.app', '_blank')}
            >
              <Box
                position='absolute'
                top='-20px'
                right='-20px'
                w='120px'
                h='120px'
                bg='rgba(255,255,255,0.1)'
                borderRadius='full'
              />
              <Box
                position='absolute'
                bottom='-30px'
                left='-30px'
                w='100px'
                h='100px'
                bg='rgba(255,255,255,0.05)'
                borderRadius='full'
              />
              <Card.Body p={6}>
                <HStack justify='space-between' align='center'>
                  <HStack gap={4}>
                    <Circle size='14' bg='rgba(255,255,255,0.2)'>
                      <ClipboardCheck size={28} color='white' />
                    </Circle>
                    <VStack align='flex-start' gap={1}>
                      <Heading size='lg' color='white' fontWeight='bold'>
                        Hệ thống làm bài kiểm tra
                      </Heading>
                      <Text color='whiteAlpha.800' fontSize='sm'>
                        Quản lý và tạo đề thi trắc nghiệm trực tuyến - C-ExamLab
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack gap={2} color='white'>
                    <Text fontSize='sm' fontWeight='medium'>
                      Truy cập ngay
                    </Text>
                    <ExternalLink size={20} />
                  </HStack>
                </HStack>
              </Card.Body>
            </Card.Root>
          </Box>
        </Box>

        {/* Main Content - 2 Columns */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 400px' }} gap={8} px={6}>
          {/* Left Column - Recent Notifications */}
          <Card.Root bg='white' borderRadius='xl' border='1px solid' borderColor='orange.100' shadow='sm'>
            <Card.Header pb={3} pt={5} px={6}>
              <HStack justify='space-between'>
                <HStack gap={3}>
                  <Box p={2} bg='#dd7323' borderRadius='lg'>
                    <Bell size={20} color='white' />
                  </Box>
                  <Heading size='md' color='gray.800'>
                    Thông báo gần đây
                  </Heading>
                </HStack>
                <Button
                  variant='ghost'
                  size='sm'
                  color='#dd7323'
                  _hover={{ bg: 'orange.50' }}
                  onClick={() => navigate('/lecturer/notifications')}
                >
                  Xem tất cả
                  <ArrowRight size={16} />
                </Button>
              </HStack>
            </Card.Header>

            <Card.Body pt={2}>
              <VStack gap={3} align='stretch'>
                {notificationsLoading ? (
                  <Center py={8}>
                    <Spinner size='lg' color='#dd7323' />
                  </Center>
                ) : !notifications || notifications.length === 0 ? (
                  <Center py={8}>
                    <VStack gap={3}>
                      <Circle size='16' bg='orange.50'>
                        <Bell size={32} color='#dd7323' />
                      </Circle>
                      <Text color='gray.500'>Không có thông báo mới</Text>
                    </VStack>
                  </Center>
                ) : (
                  notifications.slice(0, 5).map((notification: any) => {
                    const isRead = notification.is_read || notification.isRead
                    const createdAt = notification.created_at || notification.createdAt
                    return (
                      <Box
                        key={notification.id}
                        p={4}
                        bg={isRead ? 'gray.50' : 'orange.50'}
                        borderRadius='xl'
                        borderLeft='4px solid'
                        borderLeftColor='#dd7323'
                        cursor='pointer'
                        _hover={{ bg: isRead ? 'gray.100' : 'orange.100', transform: 'translateX(4px)' }}
                        transition='all 0.2s'
                      >
                        <HStack gap={3} align='flex-start'>
                          <Circle size='10' bg='orange.100' flexShrink={0}>
                            <Megaphone size={18} color='#dd7323' />
                          </Circle>
                          <VStack align='flex-start' gap={1} flex={1} minW={0}>
                            <HStack gap={2} flexWrap='wrap'>
                              <Text fontWeight='semibold' fontSize='sm' color='gray.800' lineClamp={1}>
                                {notification.title}
                              </Text>
                              {!isRead && (
                                <Badge bg='#dd7323' color='white' size='sm' borderRadius='full'>
                                  Mới
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize='sm' color='gray.600' lineClamp={2}>
                              {notification.content}
                            </Text>
                            <Text fontSize='xs' color='gray.500'>
                              {createdAt ? getRelativeTime(createdAt) : ''}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    )
                  })
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Right Column - Mini Calendar */}
          <MiniCalendar variant='lecturer' />
        </Grid>
      </Box>
    </Box>
  )
}
