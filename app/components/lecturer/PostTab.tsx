'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Box, Text, VStack, HStack, Spinner, Card, Avatar, Badge, Button } from '@chakra-ui/react'
import { MessageSquare, Heart, Pin, ChevronDown, ChevronUp, Plus, Download, File, XCircle, Trash2 } from 'lucide-react'
import { toaster } from '../ui/toaster'
import ReactMarkdown from 'react-markdown'
import StatsCard from '../ui/StatsCard'
import EmptyState from '../ui/EmptyState'
import CreatePostModal, { type PostFormData } from './CreatePostModal'
import { lecturerPostApi, openFileDownload } from '../../services/lecturerApi'
import { useAuthStore } from '../../store/authStore'
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

// Comment interface - support both string and number id from BE
interface CommentDTO {
  id: string | number
  content: string
  author_id?: string
  authorId?: string
  author_name?: string
  authorName?: string
  author_avatar?: string
  authorAvatar?: string
  created_at?: string
  createdAt?: string
  attachment_url?: string
  attachmentUrl?: string
  // BE trả về senderId thay vì author_id
  senderId?: string
  studentName?: string
  avatar?: string
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
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Lấy thông tin user hiện tại để kiểm tra quyền xóa comment
  // user.username chứa codeUser (ví dụ: "GV2512092023") - đây là ID dùng để so sánh với senderId
  const { user } = useAuthStore()
  // Ưu tiên username (codeUser) vì đây là format giống senderId từ BE
  const currentUserId = user?.username || user?.id || ''

  // Debug log để kiểm tra user info
  console.log('=== USER INFO DEBUG ===')
  console.log('User object:', user)
  console.log('Current User ID (username/codeUser):', currentUserId)

  // Get post ID - BE có thể trả về id, postId, hoặc post_id
  const postId = String((post as any).id || (post as any).postId || (post as any).post_id || '')

  // Debug log
  console.log('=== POST DATA DEBUG ===')
  console.log('Post object:', post)
  console.log('Post ID extracted:', postId)

  const contentPreview = post.content.length > 300 ? post.content.slice(0, 300) + '...' : post.content
  const needsExpand = post.content.length > 300

  // Fetch comments
  const fetchComments = async () => {
    if (!postId) {
      console.error('Post ID is empty!')
      return
    }
    setLoadingComments(true)
    try {
      console.log('Fetching comments for postId:', postId)
      const data = await lecturerPostApi.getComments(postId)
      setComments(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Failed to fetch comments:', err)
      toaster.create({
        title: 'Lỗi',
        description: err.message || 'Không thể tải bình luận',
        type: 'error'
      })
    } finally {
      setLoadingComments(false)
    }
  }

  // Toggle comments section
  const handleToggleComments = () => {
    if (!showComments) {
      fetchComments()
    }
    setShowComments(!showComments)
  }

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    if (!postId) {
      console.error('Post ID is empty!')
      toaster.create({
        title: 'Lỗi',
        description: 'Không tìm thấy ID bài viết',
        type: 'error'
      })
      return
    }

    setSubmittingComment(true)
    try {
      console.log('Creating comment for postId:', postId)
      await lecturerPostApi.createComment(postId, {
        content: newComment.trim()
      })
      toaster.create({
        title: 'Thành công',
        description: 'Đã gửi bình luận',
        type: 'success'
      })
      setNewComment('')
      fetchComments() // Refresh comments
    } catch (err: any) {
      console.error('Failed to create comment:', err)
      toaster.create({
        title: 'Lỗi',
        description: err.message || 'Không thể gửi bình luận',
        type: 'error'
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleClosePost = async () => {
    if (
      !confirm(
        'Bạn có chắc muốn đóng bài viết này? Nếu không có bình luận, bài viết sẽ bị xóa. Nếu có bình luận, bài viết sẽ bị ẩn.'
      )
    )
      return

    setDeleting(true)
    try {
      await lecturerPostApi.deletePost(postId, classId)
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

        {/* Attachment - sử dụng openFileDownload để lấy presigned URL */}
        {post.attachment_url && post.attachment_url !== 'null' && post.attachment_url !== 'string' && (
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
              onClick={async () => {
                try {
                  await openFileDownload(post.attachment_url!)
                } catch (err: any) {
                  toaster.create({
                    title: 'Lỗi',
                    description: err.message || 'Không thể tải file',
                    type: 'error'
                  })
                }
              }}
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
              <Text ml={1}>{(post as any).like_count ?? (post as any).likeCount ?? 0}</Text>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              color={showComments ? '#dd7323' : 'gray.600'}
              _hover={{ bg: 'orange.50' }}
              onClick={handleToggleComments}
            >
              <MessageSquare size={18} />
              <Text ml={1}>{(post as any).comment_count ?? (post as any).commentCount ?? 0}</Text>
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

        {/* Comments Section */}
        {showComments && (
          <Box mt={4} pt={4} borderTop='1px solid' borderColor='gray.100'>
            {/* New Comment Input */}
            <HStack gap={2} mb={4}>
              <input
                type='text'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='Viết bình luận...'
                className='flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
              />
              <Button
                size='sm'
                bg='#dd7323'
                color='white'
                _hover={{ bg: '#c5651f' }}
                onClick={handleSubmitComment}
                loading={submittingComment}
                disabled={!newComment.trim()}
              >
                Gửi
              </Button>
            </HStack>

            {/* Comments List */}
            {loadingComments ? (
              <HStack justify='center' py={4}>
                <Spinner size='sm' color='#dd7323' />
                <Text fontSize='sm' color='gray.500'>
                  Đang tải bình luận...
                </Text>
              </HStack>
            ) : comments.length === 0 ? (
              <Text fontSize='sm' color='gray.500' textAlign='center' py={4}>
                Chưa có bình luận nào
              </Text>
            ) : (
              <VStack gap={3} align='stretch'>
                {comments.map((comment) => {
                  // Debug: log toàn bộ comment object để xem BE trả về gì
                  console.log('=== FULL COMMENT OBJECT ===')
                  console.log(JSON.stringify(comment, null, 2))

                  const commentId = String(
                    (comment as any).id || (comment as any).commentId || (comment as any).comment_id || ''
                  )
                  // Lấy senderId từ API response (BE trả về senderId: "GV2512092023" hoặc "EN2512092037")
                  const senderId =
                    (comment as any).senderId ||
                    (comment as any).sender_id ||
                    (comment as any).userId ||
                    (comment as any).user_id ||
                    (comment as any).authorId ||
                    (comment as any).author_id ||
                    ''
                  // Lấy tên hiển thị: sender_name > studentName > senderId > fallback
                  const senderName =
                    (comment as any).sender_name ||
                    (comment as any).senderName ||
                    comment.author_name ||
                    comment.authorName ||
                    ''
                  const studentName = (comment as any).studentName
                  // Nếu studentName là null hoặc "string" (placeholder) thì không dùng
                  const isValidStudentName =
                    studentName && studentName !== null && studentName !== 'null' && studentName !== 'string'
                  // Hiển thị: senderName > studentName (nếu hợp lệ) > senderId > fallback
                  const displayName = senderName || (isValidStudentName ? studentName : '') || senderId || 'Người dùng'
                  // Kiểm tra xem comment có phải của user hiện tại không
                  // So sánh senderId với currentUserId (case-insensitive)
                  const isOwnComment = senderId && currentUserId && senderId === currentUserId

                  // Debug log để kiểm tra so sánh
                  console.log('=== COMMENT OWNER CHECK ===')
                  console.log('Comment senderId:', senderId)
                  console.log('Current User ID:', currentUserId)
                  console.log('Is own comment:', isOwnComment)
                  // Lấy avatar
                  const avatarUrl = comment.avatar || comment.author_avatar || comment.authorAvatar
                  // Lấy thời gian
                  const createdTime = comment.created_at || comment.createdAt || ''
                  // Lấy attachment URL - chỉ hiển thị nếu có giá trị thực (không phải null, undefined, "string", "")
                  const attachmentUrl = comment.attachment_url || comment.attachmentUrl
                  const hasAttachment =
                    attachmentUrl &&
                    attachmentUrl !== 'null' &&
                    attachmentUrl !== 'string' &&
                    attachmentUrl.trim() !== ''

                  return (
                    <Box key={commentId} p={3} bg='gray.50' borderRadius='lg'>
                      <HStack gap={3} align='flex-start'>
                        <Avatar.Root size='sm'>
                          <Avatar.Image src={avatarUrl} />
                          <Avatar.Fallback name={displayName} />
                        </Avatar.Root>
                        <VStack align='flex-start' gap={1} flex={1}>
                          <HStack gap={2} justify='space-between' w='full'>
                            <HStack gap={2}>
                              <Text fontSize='sm' fontWeight='semibold' color='gray.800'>
                                {displayName}
                              </Text>
                              {createdTime && (
                                <Text fontSize='xs' color='gray.500'>
                                  {getRelativeTime(createdTime)}
                                </Text>
                              )}
                            </HStack>
                            {/* Chỉ hiển thị nút xóa nếu comment là của user hiện tại */}
                            {isOwnComment && (
                              <Button
                                size='xs'
                                variant='ghost'
                                color='red.500'
                                _hover={{ bg: 'red.50' }}
                                onClick={async () => {
                                  if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return
                                  try {
                                    await lecturerPostApi.deleteComment(commentId, postId)
                                    toaster.create({
                                      title: 'Đã xóa bình luận',
                                      type: 'success'
                                    })
                                    fetchComments()
                                  } catch (err: any) {
                                    console.error('Failed to delete comment:', err)
                                    toaster.create({
                                      title: 'Lỗi',
                                      description: err.message || 'Không thể xóa bình luận',
                                      type: 'error'
                                    })
                                  }
                                }}
                                p={1}
                                title='Xóa bình luận'
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </HStack>
                          <Text fontSize='sm' color='gray.700'>
                            {comment.content}
                          </Text>
                          {/* Attachment - sử dụng openFileDownload để lấy presigned URL */}
                          {hasAttachment && (
                            <HStack
                              mt={2}
                              p={2}
                              bg='orange.50'
                              borderRadius='md'
                              gap={2}
                              _hover={{ bg: 'orange.100' }}
                              cursor='pointer'
                              onClick={async () => {
                                try {
                                  await openFileDownload(attachmentUrl)
                                } catch (err: any) {
                                  toaster.create({
                                    title: 'Lỗi',
                                    description: err.message || 'Không thể tải file',
                                    type: 'error'
                                  })
                                }
                              }}
                            >
                              <File size={14} color='#dd7323' />
                              <Text fontSize='xs' color='#dd7323'>
                                File đính kèm
                              </Text>
                              <Download size={12} color='#dd7323' />
                            </HStack>
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  )
                })}
              </VStack>
            )}
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  )
}
