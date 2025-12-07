'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  Box,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
  Card,
  Table,
  Button,
  Input,
  createListCollection
} from '@chakra-ui/react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table'
import { FileText, CheckCircle, Clock, ArrowUpDown, Plus, Search, Filter } from 'lucide-react'
import StatsCard from '../ui/StatsCard'
import EmptyState from '../ui/EmptyState'
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from '../ui/select'
import CreateAssignmentModal, { type AssignmentFormData } from './CreateAssignmentModal'
import { lecturerAssignmentApi } from '../../services/lecturerApi'
import type { AssignmentDTO } from '../../types'

// Filter collections for Select components
const typeFilterCollection = createListCollection({
  items: [
    { value: '', label: 'Tất cả loại' },
    { value: 'homework', label: 'Bài tập' },
    { value: 'project', label: 'Dự án' },
    { value: 'midterm', label: 'Giữa kỳ' },
    { value: 'final', label: 'Cuối kỳ' }
  ]
})

const gradingFilterCollection = createListCollection({
  items: [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'graded', label: 'Đã chấm xong' },
    { value: 'pending', label: 'Chưa chấm xong' },
    { value: 'no_submission', label: 'Chưa có bài nộp' }
  ]
})

const USE_MOCK_DATA = true

// Extended mock data with graded_count
interface ExtendedAssignmentDTO extends AssignmentDTO {
  graded_count?: number
}

const MOCK_ASSIGNMENTS: ExtendedAssignmentDTO[] = [
  { id: 1, class_id: 1, title: 'Lab 01 - Giới thiệu Python', description: '', type: 'homework', weight: 0.2, deadline: '2024-10-10T23:59:00Z', max_score: 10, is_published: true, submission_count: 40, graded_count: 40, created_at: '', updated_at: '' },
  { id: 2, class_id: 1, title: 'Lab 02 - Biến và kiểu dữ liệu', description: '', type: 'homework', weight: 0.2, deadline: '2024-10-17T23:59:00Z', max_score: 10, is_published: true, submission_count: 38, graded_count: 30, created_at: '', updated_at: '' },
  { id: 3, class_id: 1, title: 'Project Phase 1', description: '', type: 'project', weight: 0.3, deadline: '2024-10-25T23:59:00Z', max_score: 10, is_published: true, submission_count: 35, graded_count: 0, created_at: '', updated_at: '' },
  { id: 4, class_id: 1, title: 'Kiểm tra giữa kỳ', description: '', type: 'midterm', weight: 0.25, deadline: '2024-11-15T10:00:00Z', max_score: 10, is_published: true, submission_count: 45, graded_count: 45, created_at: '', updated_at: '' },
  { id: 5, class_id: 1, title: 'Lab 03 - Vòng lặp', description: '', type: 'homework', weight: 0.2, deadline: '2025-12-20T23:59:00Z', max_score: 10, is_published: false, submission_count: 0, graded_count: 0, created_at: '', updated_at: '' }
]

interface AssignmentTabProps {
  classId: number
}

const TYPE_LABELS: Record<string, string> = {
  homework: 'Bài tập',
  project: 'Dự án',
  midterm: 'Giữa kỳ',
  final: 'Cuối kỳ'
}

const TYPE_COLORS: Record<string, string> = {
  homework: 'green',
  project: 'purple',
  midterm: 'orange',
  final: 'red'
}

export default function LecturerAssignmentTab({ classId }: AssignmentTabProps) {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<ExtendedAssignmentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  
  // Filters
  const [searchKeyword, setSearchKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [gradingFilter, setGradingFilter] = useState<string>('')
  
  // Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 400))
      setAssignments(MOCK_ASSIGNMENTS)
      setLoading(false)
      return
    }
    try {
      const response = await lecturerAssignmentApi.getAssignments(classId)
      setAssignments(response.results || [])
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Filtered data
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Search filter
      const matchesSearch = !searchKeyword || 
        a.title.toLowerCase().includes(searchKeyword.toLowerCase())
      
      // Type filter
      const matchesType = !typeFilter || a.type === typeFilter
      
      // Grading status filter
      let matchesGrading = true
      if (gradingFilter === 'graded') {
        matchesGrading = (a.graded_count || 0) >= (a.submission_count || 0) && (a.submission_count || 0) > 0
      } else if (gradingFilter === 'pending') {
        matchesGrading = (a.graded_count || 0) < (a.submission_count || 0)
      } else if (gradingFilter === 'no_submission') {
        matchesGrading = (a.submission_count || 0) === 0
      }
      
      return matchesSearch && matchesType && matchesGrading
    })
  }, [assignments, searchKeyword, typeFilter, gradingFilter])

  // Stats
  const stats = useMemo(() => {
    const total = assignments.length
    const published = assignments.filter((a) => a.is_published).length
    const pendingGrade = assignments.filter((a) => 
      (a.graded_count || 0) < (a.submission_count || 0)
    ).length
    return { total, published, pendingGrade }
  }, [assignments])

  // Get grading status
  const getGradingStatus = (assignment: ExtendedAssignmentDTO) => {
    const submitted = assignment.submission_count || 0
    const graded = assignment.graded_count || 0
    
    if (submitted === 0) {
      return { label: 'Chưa có bài nộp', color: 'gray' }
    }
    if (graded >= submitted) {
      return { label: 'Đã chấm xong', color: 'green' }
    }
    return { label: `Chưa chấm (${graded}/${submitted})`, color: 'yellow' }
  }

  // Table columns
  const columns = useMemo<ColumnDef<ExtendedAssignmentDTO>[]>(
    () => [
      {
        accessorKey: 'index',
        header: 'STT',
        cell: ({ row }) => <Text color='gray.600' fontSize='sm'>{row.index + 1}</Text>,
        size: 50
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <HStack gap={1} cursor='pointer' onClick={() => column.toggleSorting()}>
            <Text>Tiêu đề</Text>
            <ArrowUpDown size={14} />
          </HStack>
        ),
        cell: ({ row }) => (
          <Text fontWeight='medium' color='gray.800'>
            {row.original.title}
          </Text>
        )
      },
      {
        accessorKey: 'type',
        header: 'Loại',
        cell: ({ row }) => (
          <Badge colorPalette={TYPE_COLORS[row.original.type]} variant='subtle' borderRadius='full'>
            {TYPE_LABELS[row.original.type]}
          </Badge>
        ),
        size: 90
      },
      {
        accessorKey: 'deadline',
        header: 'Deadline',
        cell: ({ row }) => {
          const date = new Date(row.original.deadline)
          return (
            <Text color='gray.600' fontSize='sm'>
              {date.toLocaleDateString('vi-VN')}
            </Text>
          )
        },
        size: 100
      },
      {
        accessorKey: 'submission_count',
        header: 'Đã nộp',
        cell: ({ row }) => (
          <Text fontWeight='medium' color='#dd7323'>
            {row.original.submission_count || 0}
          </Text>
        ),
        size: 80
      },
      {
        accessorKey: 'grading_status',
        header: 'Trạng thái chấm',
        cell: ({ row }) => {
          const status = getGradingStatus(row.original)
          return (
            <Badge
              colorPalette={status.color}
              variant='solid'
              borderRadius='full'
              size='sm'
            >
              {status.label}
            </Badge>
          )
        },
        size: 140
      }
    ],
    []
  )

  const table = useReactTable({
    data: filteredAssignments,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const handleRowClick = (assignment: ExtendedAssignmentDTO) => {
    const submitted = assignment.submission_count || 0
    const graded = assignment.graded_count || 0
    
    // Nếu đã chấm hết hoặc chưa có bài nộp -> chuyển sang trang xem điểm (view mode)
    // Nếu còn bài chưa chấm -> chuyển sang trang chấm điểm (grading mode)
    if (submitted === 0 || graded >= submitted) {
      navigate(`/lecturer/classes/${classId}/assignments/${assignment.id}?mode=view`)
    } else {
      navigate(`/lecturer/classes/${classId}/assignments/${assignment.id}?mode=grade`)
    }
  }

  const handleCreateAssignment = async (data: AssignmentFormData) => {
    if (USE_MOCK_DATA) {
      // Mock create
      const newAssignment: ExtendedAssignmentDTO = {
        id: Date.now(),
        class_id: classId,
        title: data.title,
        description: data.description,
        type: data.type,
        weight: data.type === 'homework' ? 0.2 : data.type === 'project' ? 0.3 : 0.25,
        deadline: data.deadline,
        max_score: data.max_score,
        is_published: data.is_published,
        submission_count: 0,
        graded_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setAssignments((prev) => [...prev, newAssignment])
      return
    }
    
    // Use new API: POST /lecturer/assignments
    await lecturerAssignmentApi.createAssignment({
      class_id: classId,
      title: data.title,
      description: data.description,
      type: data.type,
      deadline: data.deadline,
      max_score: data.max_score,
      is_published: data.is_published,
      files: data.files
    })
    fetchAssignments()
  }

  if (loading) {
    return (
      <VStack gap={3} py={12}>
        <Spinner size='lg' color='#dd7323' />
        <Text color='gray.500'>Đang tải danh sách bài tập...</Text>
      </VStack>
    )
  }

  return (
    <VStack gap={6} align='stretch'>
      {/* Header with Stats and New Button */}
      <HStack justify='space-between' flexWrap='wrap' gap={4}>
        <HStack gap={4} flexWrap='wrap'>
          <Box minW='180px'>
            <StatsCard label='Tổng số bài tập' value={stats.total} icon={FileText} />
          </Box>
          <Box minW='180px'>
            <StatsCard label='Đã xuất bản' value={`${stats.published}/${stats.total}`} icon={CheckCircle} />
          </Box>
          <Box minW='180px'>
            <StatsCard label='Chờ chấm điểm' value={stats.pendingGrade} icon={Clock} />
          </Box>
        </HStack>
        <Button
          bg='#dd7323'
          color='white'
          borderRadius='xl'
          _hover={{ bg: '#c5651f' }}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          <Text ml={2}>Tạo bài tập mới</Text>
        </Button>
      </HStack>

      {/* Filters */}
      <Card.Root bg='white' borderRadius='xl' border='1px solid' borderColor='orange.200' shadow='sm'>
        <Card.Body p={4}>
          <HStack gap={4} flexWrap='wrap'>
            {/* Search */}
            <Box flex={1} minW='200px' position='relative'>
              <Box position='absolute' left={3} top='50%' transform='translateY(-50%)' color='gray.400'>
                <Search size={18} />
              </Box>
              <Input
                pl={10}
                placeholder='Tìm kiếm theo tiêu đề...'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                borderColor='orange.200'
                borderRadius='xl'
                _focus={{ borderColor: '#dd7323', boxShadow: '0 0 0 1px #dd7323' }}
              />
            </Box>

            {/* Type Filter */}
            <SelectRoot
              collection={typeFilterCollection}
              value={typeFilter ? [typeFilter] : ['']}
              onValueChange={(details) => setTypeFilter(details.value[0] || '')}
              size='md'
              w='160px'
            >
              <SelectTrigger
                borderColor='orange.200'
                borderRadius='xl'
                _hover={{ borderColor: '#dd7323' }}
              >
                <SelectValueText placeholder='Tất cả loại' />
              </SelectTrigger>
              <SelectContent>
                {typeFilterCollection.items.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>

            {/* Grading Status Filter */}
            <SelectRoot
              collection={gradingFilterCollection}
              value={gradingFilter ? [gradingFilter] : ['']}
              onValueChange={(details) => setGradingFilter(details.value[0] || '')}
              size='md'
              w='190px'
            >
              <SelectTrigger
                borderColor='orange.200'
                borderRadius='xl'
                _hover={{ borderColor: '#dd7323' }}
              >
                <SelectValueText placeholder='Tất cả trạng thái' />
              </SelectTrigger>
              <SelectContent>
                {gradingFilterCollection.items.map((item) => (
                  <SelectItem key={item.value} item={item}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Table */}
      {filteredAssignments.length === 0 ? (
        <EmptyState 
          icon={FileText} 
          title='Không tìm thấy bài tập' 
          description={assignments.length === 0 ? 'Tạo bài tập mới để bắt đầu' : 'Thử thay đổi bộ lọc'} 
        />
      ) : (
        <Card.Root bg='white' borderRadius='xl' border='1px solid' borderColor='orange.200' shadow='sm' overflow='hidden'>
          <Table.Root size='sm'>
            <Table.Header>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id} bg='orange.50'>
                  {headerGroup.headers.map((header) => (
                    <Table.ColumnHeader
                      key={header.id}
                      py={3}
                      px={3}
                      color='#dd7323'
                      fontWeight='semibold'
                      fontSize='xs'
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              ))}
            </Table.Header>
            <Table.Body>
              {table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  cursor='pointer'
                  _hover={{ bg: 'orange.50' }}
                  transition='all 0.2s'
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id} py={3} px={3}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Root>
      )}

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAssignment}
        classId={classId}
      />
    </VStack>
  )
}
