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
  Button
} from '@chakra-ui/react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState
} from '@tanstack/react-table'
import { FileText, CheckCircle, Clock, ArrowUpDown, Upload } from 'lucide-react'
import StatsCard from '../ui/StatsCard'
import EmptyState from '../ui/EmptyState'
import SubmissionModal from './SubmissionModal'
import api from '../../utils/axios'

// ============================================
// MOCK DATA - Set to true to use mock data
// ============================================
const USE_MOCK_DATA = true

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 1,
    title: 'Lab 01 - Giới thiệu Python',
    type: 'homework',
    deadline: '2024-10-10T23:59:00Z',
    is_submitted: true,
    score: 8.5,
    max_score: 10
  },
  {
    id: 2,
    title: 'Lab 02 - Biến và kiểu dữ liệu',
    type: 'homework',
    deadline: '2024-10-17T23:59:00Z',
    is_submitted: true,
    score: 9.0,
    max_score: 10
  },
  {
    id: 3,
    title: 'Project Phase 1 - Phân tích yêu cầu',
    type: 'project',
    deadline: '2024-10-25T23:59:00Z',
    is_submitted: true,
    score: null,
    max_score: 10
  },
  {
    id: 4,
    title: 'Kiểm tra giữa kỳ',
    type: 'midterm',
    deadline: '2024-11-15T10:00:00Z',
    is_submitted: true,
    score: 7.5,
    max_score: 10
  },
  {
    id: 5,
    title: 'Lab 03 - Vòng lặp và điều kiện',
    type: 'homework',
    deadline: '2025-12-20T23:59:00Z',
    is_submitted: false,
    score: null,
    max_score: 10
  },
  {
    id: 6,
    title: 'Project Phase 2 - Thiết kế hệ thống',
    type: 'project',
    deadline: '2025-12-25T23:59:00Z',
    is_submitted: false,
    score: null,
    max_score: 10
  },
  {
    id: 7,
    title: 'Thi cuối kỳ',
    type: 'final',
    deadline: '2025-12-30T08:00:00Z',
    is_submitted: false,
    score: null,
    max_score: 10
  }
]

interface Assignment {
  id: number
  title: string
  type: 'homework' | 'project' | 'midterm' | 'final'
  deadline: string
  is_submitted: boolean
  score: number | null
  max_score: number
  description?: string
}

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

export default function AssignmentTab({ classId }: AssignmentTabProps) {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  
  // Modal state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchAssignments = useCallback(async () => {
    setLoading(true)

    // Use mock data for UI testing
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      setAssignments(MOCK_ASSIGNMENTS)
      setLoading(false)
      return
    }

    try {
      const response = await api.get<{ data: Assignment[] }>(`/api/student/classes/${classId}/assignments`)
      setAssignments(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch assignments:', err)
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  // Stats
  const stats = useMemo(() => {
    const total = assignments.length
    const submitted = assignments.filter((a) => a.is_submitted).length
    const graded = assignments.filter((a) => a.score !== null).length
    return { total, submitted, graded }
  }, [assignments])

  // Handle submit button click
  const handleSubmitClick = (e: React.MouseEvent, assignment: Assignment) => {
    e.stopPropagation() // Prevent row click
    setSelectedAssignment(assignment)
    setIsModalOpen(true)
  }

  // Handle submission success
  const handleSubmitSuccess = () => {
    // Update local state to mark as submitted
    if (selectedAssignment) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === selectedAssignment.id ? { ...a, is_submitted: true } : a))
      )
    }
  }

  // Check if deadline has passed
  const isOverdue = (deadline: string) => new Date(deadline) < new Date()

  // Table columns
  const columns = useMemo<ColumnDef<Assignment>[]>(
    () => [
      {
        accessorKey: 'index',
        header: 'STT',
        cell: ({ row }) => (
          <Text color='gray.600' fontSize='sm'>
            {row.index + 1}
          </Text>
        ),
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
        header: ({ column }) => (
          <HStack gap={1} cursor='pointer' onClick={() => column.toggleSorting()}>
            <Text>Deadline</Text>
            <ArrowUpDown size={14} />
          </HStack>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.deadline)
          const overdue = isOverdue(row.original.deadline)
          return (
            <Text color={overdue && !row.original.is_submitted ? 'red.500' : 'gray.600'} fontSize='sm'>
              {date.toLocaleDateString('vi-VN')}
            </Text>
          )
        },
        size: 100
      },
      {
        accessorKey: 'is_submitted',
        header: 'Trạng thái',
        cell: ({ row }) => (
          <Badge
            colorPalette={row.original.is_submitted ? 'green' : 'yellow'}
            variant='solid'
            borderRadius='full'
            size='sm'
          >
            {row.original.is_submitted ? 'Đã nộp' : 'Chưa nộp'}
          </Badge>
        ),
        size: 90
      },
      {
        accessorKey: 'score',
        header: 'Điểm',
        cell: ({ row }) => (
          <Text fontWeight='semibold' color={row.original.score !== null ? '#dd7323' : 'gray.400'} fontSize='sm'>
            {row.original.score !== null ? `${row.original.score}` : '—'}
          </Text>
        ),
        size: 60
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const assignment = row.original
          const overdue = isOverdue(assignment.deadline)
          
          // Only show submit button if not submitted
          if (assignment.is_submitted) {
            return (
              <Box display='flex' justifyContent='center' w='full'>
                <Text fontSize='xs' color='green.600' fontWeight='medium'>
                  ✓
                </Text>
              </Box>
            )
          }
          
          return (
            <Box display='flex' justifyContent='center' w='full'>
              <Button
                size='xs'
                bg={overdue ? 'gray.400' : '#dd7323'}
                color='white'
                borderRadius='lg'
                _hover={{ bg: overdue ? 'gray.400' : '#c5651f' }}
                onClick={(e) => handleSubmitClick(e, assignment)}
                disabled={overdue}
                px={3}
              >
                <Upload size={12} />
                <Text ml={1} fontSize='xs'>Nộp</Text>
              </Button>
            </Box>
          )
        },
        size: 80
      }
    ],
    []
  )

  const table = useReactTable({
    data: assignments,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  const handleRowClick = (assignmentId: number) => {
    navigate(`/student/course-details/${classId}/assignment/${assignmentId}`)
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
    <>
      <VStack gap={6} align='stretch'>
        {/* Stats */}
        <HStack gap={4} flexWrap='wrap'>
          <Box flex={1} minW='200px'>
            <StatsCard label='Tổng số bài tập' value={stats.total} icon={FileText} />
          </Box>
          <Box flex={1} minW='200px'>
            <StatsCard label='Đã nộp' value={`${stats.submitted}/${stats.total}`} icon={CheckCircle} />
          </Box>
          <Box flex={1} minW='200px'>
            <StatsCard label='Đã chấm' value={`${stats.graded}/${stats.total}`} icon={Clock} />
          </Box>
        </HStack>

        {/* Table */}
        {assignments.length === 0 ? (
          <EmptyState icon={FileText} title='Chưa có bài tập nào' description='Giảng viên chưa tạo bài tập cho lớp này' />
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
                    onClick={() => handleRowClick(row.original.id)}
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
      </VStack>

      {/* Submission Modal */}
      <SubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignment={selectedAssignment}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  )
}
