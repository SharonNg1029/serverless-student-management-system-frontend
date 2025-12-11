import { useState, useEffect } from 'react'
import { HStack, IconButton, Text, Box } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true
}: PaginationProps) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  if (totalItems === 0) return null

  return (
    <Box
      display='flex'
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'stretch', md: 'center' }}
      justifyContent='space-between'
      gap={4}
      py={4}
      px={2}
    >
      {/* Info & Page Size */}
      <HStack gap={4} flexWrap='wrap'>
        <Text fontSize='sm' color='gray.600'>
          Hiển thị {startItem} - {endItem} / {totalItems} kết quả
        </Text>
        {showPageSizeSelector && onPageSizeChange && (
          <HStack gap={2}>
            <Text fontSize='sm' color='gray.600'>
              Số dòng:
            </Text>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className='px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dd7323] focus:border-transparent'
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </HStack>
        )}
      </HStack>

      {/* Page Navigation */}
      <HStack gap={1}>
        {/* First Page */}
        <IconButton
          aria-label='Trang đầu'
          size='sm'
          variant='ghost'
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
        >
          <ChevronsLeft size={16} />
        </IconButton>

        {/* Previous Page */}
        <IconButton
          aria-label='Trang trước'
          size='sm'
          variant='ghost'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
        >
          <ChevronLeft size={16} />
        </IconButton>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <Text key={`ellipsis-${index}`} px={2} color='gray.400' fontSize='sm'>
              ...
            </Text>
          ) : (
            <IconButton
              key={page}
              aria-label={`Trang ${page}`}
              size='sm'
              variant={currentPage === page ? 'solid' : 'ghost'}
              bg={currentPage === page ? '#dd7323' : undefined}
              color={currentPage === page ? 'white' : 'gray.700'}
              _hover={{
                bg: currentPage === page ? '#c2621a' : 'gray.100'
              }}
              onClick={() => onPageChange(page as number)}
              minW='32px'
            >
              {page}
            </IconButton>
          )
        )}

        {/* Next Page */}
        <IconButton
          aria-label='Trang sau'
          size='sm'
          variant='ghost'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
        >
          <ChevronRight size={16} />
        </IconButton>

        {/* Last Page */}
        <IconButton
          aria-label='Trang cuối'
          size='sm'
          variant='ghost'
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
        >
          <ChevronsRight size={16} />
        </IconButton>
      </HStack>
    </Box>
  )
}

// Helper hook for pagination logic
export const usePagination = <T,>(data: T[], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)

  // Reset to page 1 when data or pageSize changes
  useEffect(() => {
    setCurrentPage(1)
  }, [data.length, pageSize])

  // Ensure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    paginatedData
  }
}
