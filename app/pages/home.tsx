'use client'

import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Badge,
  Card,
  HStack,
  VStack,
  Circle,
  Spinner,
  Center,
  IconButton,
  Button,
  Avatar
} from '@chakra-ui/react'
import {
  Bell,
  BookOpen,
  Award,
  Megaphone,
  Clock,
  ChevronRight as ArrowRight,
  ClipboardCheck,
  ExternalLink
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNotificationUIStore } from '../store/notificationUIStore'
import api from '../utils/axios'
import PageHeader from '../components/ui/PageHeader'
import StatsCard from '../components/ui/StatsCard'
import MiniCalendar from '../components/calendar/MiniCalendar'

// Import types from centralized types
import type { StudentDashboardStats } from '../types'

// Local type for notifications with extended fields
interface HomeNotification {
  id: string
  type: 'admin' | 'lecturer'
  title: string
  content: string
  createdAt: string
  isRead: boolean
  classId?: string | number
  senderName?: string
  senderAvatar?: string
}

// Local type alias for dashboard stats with additional field
interface DashboardStats extends Omit<StudentDashboardStats, 'completedAssignments'> {
  unreadNotifications: number
}

// API Response Types (specific to this page's API calls)
interface ClassFromAPI {
  id: string
  name: string
  classId?: string
  class_id?: string
}

// Response từ /api/notifications: { id, title, content, type, isRead, createdAt, classId, ... }
interface NotificationFromAPI {
  id: string | number
  title: string
  content: string
  type: string // 'system' | 'class'
  classId?: string // camelCase từ BE
  class_id?: string | number // snake_case fallback
  createdAt?: string // camelCase từ BE
  sent_at?: string // snake_case fallback
  isRead?: boolean // camelCase từ BE
  is_read?: boolean // snake_case fallback
}

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
  if (diffDays < 7) return `${diffDays} ngày trước`
  return formatDate(date)
}



export default function HomeRoute() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { openNotificationPanel } = useNotificationUIStore()
  const today = new Date()

  // Fetch enrolled classes
  const { data: enrolledClasses = [], isLoading: classesLoading } = useQuery<ClassFromAPI[]>({
    queryKey: ['enrolled-classes'],
    queryFn: async () => {
      const response = await api.get('/api/student/classes/enrolled')
      // BE trả về { data: [...], count, message, status }
      const data = response.data as any
      return data?.data || data?.results || []
    }
  })

  // Fetch notifications from API - dùng /api/notifications (giống Lecturer)
  const { data: notificationsRaw = [], isLoading: notificationsLoading } = useQuery<NotificationFromAPI[]>({
    queryKey: ['student-notifications'],
    queryFn: async () => {
      const response = await api.get('/api/notifications')
      // BE trả về array trực tiếp hoặc { data: [...] }
      const data = (response.data as any)?.data || response.data?.results || response.data || []
      return Array.isArray(data) ? data : []
    }
  })

  // Transform API notifications to UI format
  // Filter: show system notifications + class notifications chỉ khi student đã enrolled class đó
  const notifications: HomeNotification[] = useMemo(() => {
    // Lấy danh sách classId đã enrolled
    const enrolledClassIds = enrolledClasses.map((c: any) => c.id || c.classId || c.class_id)

    return notificationsRaw
      .filter((n) => {
        const notificationType = (n.type || 'system').toLowerCase()

        // System notifications → show luôn
        if (notificationType === 'system') {
          return true
        }

        // Class notifications → chỉ show nếu student đã enrolled class đó
        if (notificationType === 'class') {
          const notificationClassId = n.classId || n.class_id
          return notificationClassId && enrolledClassIds.includes(String(notificationClassId))
        }

        // Các type khác → show luôn (fallback)
        return true
      })
      .map((n) => ({
        id: String(n.id),
        type: (n.type || 'system').toLowerCase() === 'system' ? 'admin' : 'lecturer',
        title: n.title,
        content: n.content,
        createdAt: n.createdAt || n.sent_at || new Date().toISOString(),
        isRead: n.isRead ?? n.is_read ?? false,
        classId: n.classId || n.class_id
      }))
  }, [notificationsRaw, enrolledClasses])

  // Calculate unread count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])



  // Dashboard stats computed from real data
  const stats: DashboardStats = useMemo(
    () => ({
      enrolledClasses: enrolledClasses.length,
      upcomingDeadlines: 0, // Will be calculated by MiniCalendar
      unreadNotifications: unreadNotificationsCount,
      averageScore: 0 // TODO: Get from grades API when available
    }),
    [enrolledClasses.length, unreadNotificationsCount]
  )

  const statsLoading = classesLoading || notificationsLoading

  // Handle notification click - navigate to class if it's a class notification
  const handleNotificationClick = (notification: HomeNotification) => {
    if (notification.classId) {
      navigate(`/student/classes/${notification.classId}`)
    }
  }

  return (
    <Box minH='100vh' bg='white' py={8} px={{ base: 4, md: 6, lg: 8 }}>
      <Box maxW='1400px' mx='auto'>
        {/* ============================================
            HERO SECTION - White/Orange Theme
        ============================================ */}
        <Box mb={8}>
          {/* Header */}
          <PageHeader
            icon={Award}
            title={`Chào mừng, ${user?.fullName || 'Sinh viên'}!`}
            subtitle={`Hôm nay là ${getVietnameseDay(today.getDay())}, ngày ${formatDate(today)}`}
          />

          {/* Quick Stats Grid - Orange/White Theme */}
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} px={6}>
            <StatsCard
              label='Thông báo chưa đọc'
              value={stats?.unreadNotifications || 0}
              icon={Bell}
              isLoading={statsLoading}
              onClick={openNotificationPanel}
            />
            <StatsCard
              label='Lớp đã đăng ký'
              value={stats?.enrolledClasses || 0}
              icon={BookOpen}
              isLoading={statsLoading}
              onClick={() => navigate('/student/my-courses')}
            />
            <StatsCard
              label='Deadline tuần này'
              value={stats?.upcomingDeadlines || 0}
              icon={Clock}
              isLoading={statsLoading}
              onClick={() => navigate('/student/calendar')}
            />
            <StatsCard
              label='Điểm trung bình'
              value={stats?.averageScore?.toFixed(1) || '0.0'}
              icon={Award}
              isLoading={statsLoading}
              onClick={() => navigate('/student/ranking')}
            />
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
                        Truy cập hệ thống thi trắc nghiệm trực tuyến - C-ExamLab
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

        {/* ============================================
            MAIN CONTENT - 2 Columns
        ============================================ */}
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
                  onClick={openNotificationPanel}
                >
                  Xem tất cả
                  <ArrowRight size={16} />
                </Button>
              </HStack>
            </Card.Header>

            <Card.Body pt={2}>
              <VStack gap={3} align='stretch'>
                {notifications.slice(0, 5).map((notification) => (
                  <Box
                    key={notification.id}
                    p={4}
                    bg={notification.isRead ? 'gray.50' : 'orange.50'}
                    borderRadius='xl'
                    borderLeft='4px solid'
                    borderLeftColor='#dd7323'
                    cursor='pointer'
                    _hover={{ bg: notification.isRead ? 'gray.100' : 'orange.100', transform: 'translateX(4px)' }}
                    transition='all 0.2s'
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <HStack gap={3} align='flex-start'>
                      {/* Icon/Avatar */}
                      {notification.type === 'admin' ? (
                        <Circle size='10' bg='orange.100' flexShrink={0}>
                          <Megaphone size={18} color='#dd7323' />
                        </Circle>
                      ) : (
                        <Box position='relative' flexShrink={0}>
                          <Avatar.Root size='sm'>
                            <Avatar.Image src={notification.senderAvatar} />
                            <Avatar.Fallback name={notification.senderName} />
                          </Avatar.Root>
                          <Circle
                            size='5'
                            bg='#dd7323'
                            position='absolute'
                            bottom='-2px'
                            right='-2px'
                            border='2px solid white'
                          >
                            <Bell size={10} color='white' />
                          </Circle>
                        </Box>
                      )}

                      {/* Content */}
                      <VStack align='flex-start' gap={1} flex={1} minW={0}>
                        <HStack gap={2} flexWrap='wrap'>
                          <Text fontWeight='semibold' fontSize='sm' color='gray.800' lineClamp={1}>
                            {notification.title}
                          </Text>
                          {!notification.isRead && (
                            <Badge bg='#dd7323' color='white' size='sm' borderRadius='full'>
                              Mới
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize='sm' color='gray.600' lineClamp={2}>
                          {notification.content}
                        </Text>
                        <HStack gap={2} fontSize='xs' color='gray.500'>
                          {notification.senderName && (
                            <>
                              <Text>{notification.senderName}</Text>
                              <Text>•</Text>
                            </>
                          )}
                          <Text>{getRelativeTime(notification.createdAt)}</Text>
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                ))}

                {notifications.length === 0 && (
                  <Center py={8}>
                    <VStack gap={3}>
                      <Circle size='16' bg='orange.50'>
                        <Bell size={32} color='#dd7323' />
                      </Circle>
                      <Text color='gray.500'>Không có thông báo mới</Text>
                    </VStack>
                  </Center>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Right Column - Mini Calendar */}
          <MiniCalendar variant='student' onViewFull={() => navigate('/student/calendar')} />
        </Grid>
      </Box>
    </Box>
  )
}
