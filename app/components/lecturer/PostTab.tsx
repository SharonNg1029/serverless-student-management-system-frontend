'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Box, Text, VStack, HStack, Spinner, Card, Avatar, Badge, Button } from '@chakra-ui/react'
import { MessageSquare, Heart, Pin, ChevronDown, ChevronUp, Plus, Download, File, XCircle } from 'lucide-react'
import { toaster } from '../ui/toaster'
import ReactMarkdown from 'react-markdown'
import StatsCard from '../ui/StatsCard'
import EmptyState from '../ui/EmptyState'
import CreatePostModal, { type PostFormData } from './CreatePostModal'
import { lecturerPostApi } from '../../services/lecturerApi'
import type { PostDTO } from '../../types'

interface PostTabProps {
  classId: string
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return (
    date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  )
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
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
  return formatDateTime(dateStr)
}

export default function LecturerPostTab({ classId }: PostTabProps) {
  const [posts, setPosts] = useState<PostDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await lecturerPostApi.getPosts(classId)
      console.log('Posts response:', response)
      // BE trả về { data: [...], count, message, status }
      const data = (response as any)?.data || response?.results || []
      setPosts(data)
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Stats
  const stats = useMemo(() => {
    const total = posts.length
    const pinned = posts.filter((p) => p.is_pinned).length
    return { total, pinned }
  }, [posts])

  // Sort: pinned first, then by created_at DESC
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [posts])

  const handleCreatePost = async (data: PostFormData) => {
    await lecturerPostApi.createPost(classId, {
      class_id: parseInt(classId) || 0,
      title: data.title,
      content: data.content,
      is_pinned: data.is_pinned,
      attachment: data.attachment || undefined
    })
    fetchPosts()
  }

  if (loading) {
    return (
      <VStack gap={3} py={12}>
        <Spinner size='lg' color='#dd7323' />
        <Text color='gray.500'>Đang tải bài đăng...</Text>
      </VStack>
    )
  }

  return (
    <VStack gap={6} align='stretch'>
      {/* Header with Stats and New Button */}
      <HStack justify='space-between' flexWrap='wrap' gap={4}>
        <HStack gap={4} flexWrap='wrap'>
          <Box minW='180px'>
            <StatsCard label='Tổng bài đăng' value={stats.total} icon={MessageSquare} />
          </Box>
          <Box minW='180px'>
            <StatsCard label='Đã ghim' value={stats.pinned} icon={Pin} />
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
          <Text ml={2}>Tạo bài đăng mới</Text>
        </Button>
      </HStack>

      {/* Posts Feed */}
      {sortedPosts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title='Chưa có bài đăng nào'
          description='Tạo bài đăng mới để thông báo cho sinh viên'
        />
      ) : (
        <VStack gap={4} align='stretch'>
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} classId={classId} onDeleted={fetchPosts} />
          ))}
        </VStack>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        classId={classId}
      />
    </VStack>
  )
}

// Post Card Component
interface PostCardProps {
  post: PostDTO
  classId: string
  onDeleted: () => void
}

function PostCard({ post, classId, onDeleted }: PostCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const contentPreview = post.content.length > 300 ? post.content.slice(0, 300) + '...' : post.content
  const needsExpand = post.content.length > 300

  const handleClosePost = async () => {
    if (
      !confirm(
        'Bạn có chắc muốn đóng bài viết này? Nếu không có bình luận, bài viết sẽ bị xóa. Nếu có bình luận, bài viết sẽ bị ẩn.'
      )
    )
      return

    setDeleting(true)
    try {
      await lecturerPostApi.deletePost(String(post.id), classId)
      toaster.create({
        title: 'Đã đóng bài viết',
        type: 'success'
      })
      onDeleted()
    } catch (err: any) {
      console.error('Failed to close post:', err)
      toaster.create({
        title: 'Lỗi',
        description: err.message || 'Không thể đóng bài viết',
        type: 'error'
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card.Root bg='white' borderRadius='xl' border='1px solid' borderColor='orange.200' shadow='sm' overflow='hidden'>
      <Card.Body p={6}>
        {/* Header */}
        <HStack justify='space-between' mb={4}>
          <HStack gap={3}>
            <Avatar.Root size='md'>
              <Avatar.Image src={post.lecturer_avatar} />
              <Avatar.Fallback name={post.lecturer_name} />
            </Avatar.Root>
            <VStack align='flex-start' gap={0}>
              <Text fontWeight='semibold' color='gray.800'>
                {post.lecturer_name || 'Giảng viên'}
              </Text>
              <Text fontSize='sm' color='gray.500'>
                {formatDateTime(post.created_at)} ({getRelativeTime(post.created_at)})
              </Text>
            </VStack>
          </HStack>
          {post.is_pinned && (
            <Badge colorPalette='orange' variant='solid' borderRadius='full'>
              <Pin size={12} />
              <Text ml={1}>Ghim</Text>
            </Badge>
          )}
        </HStack>

        {/* Title */}
        <Text fontSize='lg' fontWeight='bold' color='gray.800' mb={3}>
          {post.title}
        </Text>

        {/* Content */}
        <Box
          className='markdown-content'
          color='gray.700'
          fontSize='sm'
          lineHeight='1.7'
          mb={4}
          css={{
            '& h1, & h2, & h3': { fontWeight: 'bold', marginTop: '1em', marginBottom: '0.5em' },
            '& p': { marginBottom: '0.5em' },
            '& ul, & ol': { paddingLeft: '1.5em', marginBottom: '0.5em' },
            '& code': { background: '#f4f4f5', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' },
            '& pre': { background: '#f4f4f5', padding: '12px', borderRadius: '8px', overflow: 'auto' }
          }}
        >
          <ReactMarkdown>{expanded ? post.content : contentPreview}</ReactMarkdown>
        </Box>

        {needsExpand && (
          <Button
            variant='ghost'
            size='sm'
            color='#dd7323'
            _hover={{ bg: 'orange.50' }}
            onClick={() => setExpanded(!expanded)}
            mb={4}
          >
            {expanded ? 'Thu gọn' : 'Xem thêm'}
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        )}

        {/* Attachment */}
        {post.attachment_url && (
          <HStack
            p={3}
            bg='orange.50'
            borderRadius='lg'
            justify='space-between'
            mb={4}
            _hover={{ bg: 'orange.100' }}
            transition='all 0.2s'
          >
            <HStack gap={2}>
              <File size={18} color='#dd7323' />
              <Text fontSize='sm' color='gray.700'>
                {post.attachment_name || 'File đính kèm'}
              </Text>
            </HStack>
            <Button
              size='sm'
              variant='ghost'
              color='#dd7323'
              onClick={() => window.open(post.attachment_url, '_blank')}
            >
              <Download size={16} />
              Tải xuống
            </Button>
          </HStack>
        )}

        {/* Actions */}
        <HStack gap={4} pt={4} borderTop='1px solid' borderColor='gray.100' justify='space-between'>
          <HStack gap={4}>
            <Button variant='ghost' size='sm' color='gray.600' _hover={{ bg: 'red.50', color: 'red.500' }}>
              <Heart size={18} />
              <Text ml={1}>{post.like_count}</Text>
            </Button>
            <Button variant='ghost' size='sm' color='gray.600' _hover={{ bg: 'gray.100' }}>
              <MessageSquare size={18} />
              <Text ml={1}>{post.comment_count}</Text>
            </Button>
          </HStack>
          <Button
            variant='ghost'
            size='sm'
            color='red.500'
            _hover={{ bg: 'red.50' }}
            onClick={handleClosePost}
            loading={deleting}
          >
            <XCircle size={16} />
            <Text ml={1}>Đóng bài viết</Text>
          </Button>
        </HStack>
      </Card.Body>
    </Card.Root>
  )
}
