'use client'

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
  Card,
  Button,
  Flex,
  Input,
  createListCollection
} from '@chakra-ui/react'
import { BookOpen, Users, Search, GraduationCap, Plus, Calendar, Eye } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatsCard from '../../components/ui/StatsCard'
import EmptyState from '../../components/ui/EmptyState'
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from '../../components/ui/select'
import { lecturerClassApi } from '../../services/lecturerApi'
import type { ClassDTO } from '../../types'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const MOCK_CLASSES: ClassDTO[] = [
  { id: 1, name: 'CS101-01', subject_id: 1, subject_name: 'Nhập môn lập trình', teacher_id: 1, semester: 'HK1', academic_year: '2024-2025', student_count: 45, status: 1, created_at: '2024-09-01', updated_at: '' },
  { id: 2, name: 'CS201-02', subject_id: 2, subject_name: 'Cấu trúc dữ liệu và giải thuật', teacher_id: 1, semester: 'HK1', academic_year: '2024-2025', student_count: 38, status: 1, created_at: '2024-09-01', updated_at: '' },
  { id: 3, name: 'CS301-01', subject_id: 3, subject_name: 'Cơ sở dữ liệu', teacher_id: 1, semester: 'HK1', academic_year: '2024-2025', student_count: 42, status: 1, created_at: '2024-09-01', updated_at: '' },
  { id: 4, name: 'CS401-03', subject_id: 4, subject_name: 'Phát triển ứng dụng Web', teacher_id: 1, semester: 'HK2', academic_year: '2024-2025', student_count: 35, status: 1, created_at: '2024-09-01', updated_at: '' },
  { id: 5, name: 'CS501-01', subject_id: 5, subject_name: 'Trí tuệ nhân tạo', teacher_id: 1, semester: 'HK2', academic_year: '2024-2025', student_count: 30, status: 0, created_at: '2024-09-01', updated_at: '' }
]

// Card backgrounds
const CARD_BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
]

function getBackgroundIndex(id: number): number {
  return id % CARD_BACKGROUNDS.length
}

// Get status badge
function getStatusBadge(status: number) {
  if (status === 1) {
    return { label: 'Đang giảng dạy', color: 'blue' }
  }
  return { label: 'Đã kết thúc', color: 'green' }
}

export default function LecturerMyCourses() {
  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [semesterFilter, setSemesterFilter] = useState<string>('')

  // Fetch classes
  const { data: classesData, isLoading } = useQuery({
    queryKey: ['lecturer-classes'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 400))
        return { results: MOCK_CLASSES }
      }
      return lecturerClassApi.getClasses()
    }
  })

  const classes = classesData?.results || []

  // Get unique semesters and create collection for Select
  const semesterCollection = useMemo(() => {
    const uniqueSemesters = new Set(classes.map((c) => `${c.semester} ${c.academic_year}`))
    const items = [
      { value: '', label: 'Tất cả kỳ học' },
      ...Array.from(uniqueSemesters).map((sem) => ({ value: sem, label: sem }))
    ]
    return createListCollection({ items })
  }, [classes])

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.subject_name?.toLowerCase().includes(searchKeyword.toLowerCase())
      const matchesSemester = !semesterFilter || `${c.semester} ${c.academic_year}` === semesterFilter
      return matchesSearch && matchesSemester
    })
  }, [classes, searchKeyword, semesterFilter])

  // Stats
  const activeClasses = classes.filter((c) => c.status === 1).length
  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0)

  if (isLoading) {
    return (
      <Box minH='60vh' display='flex' alignItems='center' justifyContent='center' bg='white'>
        <VStack gap={3}>
          <Spinner size='xl' color='#dd7323' borderWidth='4px' />
          <Text color='gray.600'>Đang tải danh sách lớp...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box w='full' py={8} px={{ base: 4, sm: 6, lg: 8 }} bg='white' minH='100vh'>
      <Box maxW='6xl' mx='auto'>
        {/* Header */}
        <PageHeader icon={GraduationCap} title='Lớp học của tôi' subtitle='Quản lý các lớp học bạn đang giảng dạy'>
          <Button
            bg='#dd7323'
            color='white'
            size='lg'
            borderRadius='xl'
            shadow='md'
            gap={2}
            px={6}
            fontWeight='semibold'
            _hover={{ bg: '#c5651f', transform: 'translateY(-2px)' }}
            transition='all 0.2s'
          >
            <Plus size={18} />
            Tạo lớp mới
          </Button>
        </PageHeader>

        {/* Stats */}
        <HStack gap={4} px={6} mb={6} flexWrap='wrap'>
          <Box flex={1} minW='200px'>
            <StatsCard label='Tổng số lớp' value={classes.length} icon={BookOpen} />
          </Box>
          <Box flex={1} minW='200px'>
            <StatsCard label='Lớp đang hoạt động' value={activeClasses} icon={GraduationCap} />
          </Box>
          <Box flex={1} minW='200px'>
            <StatsCard label='Tổng sinh viên' value={totalStudents} icon={Users} />
          </Box>
        </HStack>

        {/* Search & Filter */}
        <Card.Root bg='white' borderRadius='xl' border='1px solid' borderColor='orange.200' shadow='sm' mb={6} mx={6}>
          <Card.Body p={4}>
            <HStack gap={4} flexWrap='wrap'>
              {/* Search */}
              <Box flex={1} minW='250px' position='relative'>
                <Box position='absolute' left={3} top='50%' transform='translateY(-50%)' color='gray.400'>
                  <Search size={18} />
                </Box>
                <Input
                  pl={10}
                  placeholder='Tìm kiếm theo tên lớp, môn học...'
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  borderColor='orange.200'
                  borderRadius='xl'
                  _focus={{ borderColor: '#dd7323', boxShadow: '0 0 0 1px #dd7323' }}
                />
              </Box>

              {/* Semester Filter */}
              <SelectRoot
                collection={semesterCollection}
                value={semesterFilter ? [semesterFilter] : ['']}
                onValueChange={(details) => setSemesterFilter(details.value[0] || '')}
                size='md'
                w='220px'
              >
                <SelectTrigger
                  borderColor='orange.200'
                  borderRadius='xl'
                  _hover={{ borderColor: '#dd7323' }}
                >
                  <SelectValueText placeholder='Tất cả kỳ học' />
                </SelectTrigger>
                <SelectContent>
                  {semesterCollection.items.map((item) => (
                    <SelectItem key={item.value} item={item}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <Box px={6}>
            <EmptyState
              icon={BookOpen}
              title='Không tìm thấy lớp học'
              description='Thử thay đổi bộ lọc hoặc tạo lớp mới'
            />
          </Box>
        ) : (
          <Flex 
            flexWrap='wrap' 
            gap={6} 
            px={6}
            justify={filteredClasses.length < 3 ? 'center' : 'flex-start'}
          >
            {filteredClasses.map((classData) => {
              const bgIndex = getBackgroundIndex(classData.id)
              const statusBadge = getStatusBadge(classData.status)

              return (
                <Card.Root
                  key={classData.id}
                  bg='white'
                  borderRadius='xl'
                  border='1px solid'
                  borderColor='orange.200'
                  shadow='sm'
                  overflow='hidden'
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg', borderColor: '#dd7323' }}
                  transition='all 0.2s'
                  w={{ base: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.333% - 16px)' }}
                  maxW='380px'
                >
                  {/* Card Header with gradient */}
                  <Box h='120px' position='relative' bgGradient={CARD_BACKGROUNDS[bgIndex]}>
                    {/* Status Badge */}
                    <Badge
                      position='absolute'
                      top={3}
                      right={3}
                      colorPalette={statusBadge.color}
                      variant='solid'
                      borderRadius='full'
                      px={3}
                    >
                      {statusBadge.label}
                    </Badge>

                    {/* Class Code */}
                    <Box position='absolute' bottom={3} left={3}>
                      <Text color='white' fontWeight='bold' fontSize='lg'>
                        {classData.name}
                      </Text>
                      <Text color='whiteAlpha.900' fontSize='sm'>
                        {classData.subject_name}
                      </Text>
                    </Box>
                  </Box>

                  {/* Card Body */}
                  <Card.Body p={4}>
                    <HStack gap={4} mb={4} color='gray.600' fontSize='sm'>
                      <HStack gap={1}>
                        <Users size={14} />
                        <Text>{classData.student_count} SV</Text>
                      </HStack>
                      <HStack gap={1}>
                        <Calendar size={14} />
                        <Text>
                          {classData.semester} {classData.academic_year}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* View Details Button */}
                    <Button
                      w='full'
                      bg='#dd7323'
                      color='white'
                      borderRadius='xl'
                      _hover={{ bg: '#c5651f' }}
                      onClick={() => navigate(`/lecturer/classes/${classData.id}`)}
                    >
                      <Eye size={16} />
                      <Text ml={2}>Vào lớp</Text>
                    </Button>
                  </Card.Body>
                </Card.Root>
              )
            })}
          </Flex>
        )}
      </Box>
    </Box>
  )
}
