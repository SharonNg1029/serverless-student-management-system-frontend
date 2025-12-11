'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  NativeSelect,
  Field,
  Dialog,
  Portal,
  CloseButton,
  Checkbox
} from '@chakra-ui/react'
import { FileText, Unlock, Upload, X, Download } from 'lucide-react'
import type { AssignmentType, AssignmentDTO } from '../../types'
import api from '../../utils/axios'
import { openFileDownload } from '../../services/lecturerApi'
import { toaster } from '../ui/toaster'

interface EditAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EditAssignmentFormData) => Promise<void>
  assignment: AssignmentDTO | null
}

export interface EditAssignmentFormData {
  title: string
  description: string // fileKey sẽ được lưu ở đây
  type: AssignmentType
  deadline: string
  maxScore: number
  weight: number // Trọng số (0-1)
  isPublished: boolean
  newFile?: File // File mới để upload
}

const TYPE_OPTIONS: { value: AssignmentType; label: string; weight: string }[] = [
  { value: 'homework', label: 'Bài tập', weight: '20%' },
  { value: 'project', label: 'Dự án', weight: '30%' },
  { value: 'midterm', label: 'Giữa kỳ', weight: '25%' },
  { value: 'final', label: 'Cuối kỳ', weight: '25%' }
]

export default function EditAssignmentModal({ isOpen, onClose, onSubmit, assignment }: EditAssignmentModalProps) {
  const [formData, setFormData] = useState<EditAssignmentFormData>({
    title: '',
    description: '',
    type: 'homework',
    deadline: '',
    maxScore: 10,
    weight: 0.2,
    isPublished: true,
    newFile: undefined
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Lưu fileKey hiện tại từ assignment để hiển thị
  const [currentFileKey, setCurrentFileKey] = useState<string>('')

  // Populate form when assignment changes
  useEffect(() => {
    if (assignment) {
      // Convert deadline to datetime-local format (YYYY-MM-DDTHH:mm)
      let deadlineFormatted = ''
      if (assignment.deadline) {
        const date = new Date(assignment.deadline)
        if (!isNaN(date.getTime())) {
          deadlineFormatted = date.toISOString().slice(0, 16)
        }
      }

      // Kiểm tra description có phải là fileKey không
      const desc = assignment.description || ''
      const isFileKey =
        desc.includes('assignments/') || /\.(pdf|doc|docx|zip|rar|png|jpg|jpeg|gif|ppt|pptx|xls|xlsx|txt)$/i.test(desc)

      setCurrentFileKey(isFileKey ? desc : '')

      setFormData({
        title: assignment.title || '',
        description: desc,
        type: assignment.type || 'homework',
        deadline: deadlineFormatted,
        maxScore: assignment.max_score || 10,
        weight: assignment.weight || 0.2,
        isPublished: assignment.is_published ?? true,
        newFile: undefined
      })
    }
  }, [assignment])

  const handleChange = (field: keyof EditAssignmentFormData, value: string | number | boolean | File | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleChange('newFile', file)
    }
  }

  const removeNewFile = () => {
    handleChange('newFile', undefined)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề'
    if (!formData.deadline) {
      newErrors.deadline = 'Vui lòng chọn deadline'
    } else {
      const deadlineDate = new Date(formData.deadline)
      if (isNaN(deadlineDate.getTime())) {
        newErrors.deadline = 'Deadline không hợp lệ'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      let finalDescription = formData.description

      // Nếu có file mới, upload lên S3 và lấy fileKey
      if (formData.newFile) {
        try {
          // Step 1: Get presigned URL
          const { data: presignedData } = await api.get('/api/upload/presigned-url', {
            params: { fileName: formData.newFile.name }
          })

          // Step 2: Upload to S3
          const uploadResponse = await fetch(presignedData.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: formData.newFile
          })

          if (!uploadResponse.ok) {
            throw new Error('Lỗi khi upload file lên S3')
          }

          finalDescription = presignedData.fileKey
          console.log('File uploaded, fileKey:', finalDescription)
        } catch (err: any) {
          console.error('Failed to upload file:', err)
          toaster.create({
            title: 'Lỗi',
            description: err.message || 'Không thể upload file',
            type: 'error'
          })
          setLoading(false)
          return
        }
      }

      await onSubmit({ ...formData, description: finalDescription })
      onClose()
    } catch (err) {
      console.error('Failed to update assignment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  const selectedType = TYPE_OPTIONS.find((t) => t.value === formData.type)

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && handleClose()}
      placement='center'
      motionPreset='slide-in-bottom'
    >
      <Portal>
        <Dialog.Backdrop bg='blackAlpha.600' backdropFilter='blur(4px)' />
        <Dialog.Positioner>
          <Dialog.Content borderRadius='2xl' shadow='2xl' maxW='xl' w='full' mx={4} overflow='hidden' bg='white'>
            <Dialog.Header p={6} pb={4}>
              <HStack gap={3}>
                <Box p={2} bg='#dd7323' borderRadius='lg'>
                  <FileText size={20} color='white' />
                </Box>
                <Dialog.Title fontSize='xl' fontWeight='bold' color='gray.800'>
                  Chỉnh sửa bài tập
                </Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body px={6} pb={6}>
              <VStack gap={4} align='stretch'>
                {/* Title */}
                <Field.Root invalid={!!errors.title}>
                  <Field.Label fontWeight='medium'>
                    Tiêu đề{' '}
                    <Text as='span' color='red.500'>
                      *
                    </Text>
                  </Field.Label>
                  <Input
                    placeholder='Nhập tiêu đề bài tập...'
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    borderColor={errors.title ? 'red.500' : 'orange.200'}
                    _focus={{ borderColor: '#dd7323', boxShadow: '0 0 0 1px #dd7323' }}
                  />
                  {errors.title && <Field.ErrorText>{errors.title}</Field.ErrorText>}
                </Field.Root>

                {/* Type & Weight */}
                <HStack gap={4}>
                  <Field.Root flex={1}>
                    <Field.Label fontWeight='medium'>Loại bài tập</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value as AssignmentType)}
                        borderColor='orange.200'
                        _hover={{ borderColor: '#dd7323' }}
                      >
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator color='#dd7323' />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root flex={1}>
                    <Field.Label fontWeight='medium'>Trọng số</Field.Label>
                    <Input
                      type='number'
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((formData.weight || 0.2) * 100)}
                      onChange={(e) => handleChange('weight', parseFloat(e.target.value) / 100)}
                      borderColor='orange.200'
                      _focus={{ borderColor: '#dd7323', boxShadow: '0 0 0 1px #dd7323' }}
                      placeholder='VD: 30'
                    />
                    <Text fontSize='xs' color='gray.500' mt={1}>
                      Nhập % (VD: 30 = 30%)
                    </Text>
                  </Field.Root>
                </HStack>

                {/* Deadline */}
                <Field.Root invalid={!!errors.deadline}>
                  <Field.Label fontWeight='medium'>
                    Deadline{' '}
                    <Text as='span' color='red.500'>
                      *
                    </Text>
                  </Field.Label>
                  <Input
                    type='datetime-local'
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    borderColor={errors.deadline ? 'red.500' : 'orange.200'}
                    _focus={{ borderColor: '#dd7323', boxShadow: '0 0 0 1px #dd7323' }}
                  />
                  {errors.deadline && <Field.ErrorText>{errors.deadline}</Field.ErrorText>}
                </Field.Root>

                {/* Max Score */}
                <Field.Root>
                  <Field.Label fontWeight='medium'>Điểm tối đa</Field.Label>
                  <Input
                    type='number'
                    value={formData.maxScore}
                    onChange={(e) => handleChange('maxScore', parseInt(e.target.value) || 10)}
                    borderColor='orange.200'
                    _focus={{ borderColor: '#dd7323', boxShadow: '0 0 0 1px #dd7323' }}
                    min={1}
                    max={100}
                  />
                </Field.Root>

                {/* File đính kèm */}
                <Field.Root>
                  <Field.Label fontWeight='medium'>File đính kèm</Field.Label>

                  {/* Hiển thị file hiện tại nếu có */}
                  {currentFileKey && !formData.newFile && (
                    <HStack
                      p={3}
                      bg='orange.50'
                      borderRadius='lg'
                      justify='space-between'
                      mb={3}
                      _hover={{ bg: 'orange.100' }}
                      transition='all 0.2s'
                    >
                      <HStack gap={2}>
                        <FileText size={18} color='#dd7323' />
                        <Text fontSize='sm' color='gray.700'>
                          File hiện tại
                        </Text>
                      </HStack>
                      <Button
                        size='sm'
                        variant='ghost'
                        color='#dd7323'
                        onClick={async () => {
                          try {
                            await openFileDownload(currentFileKey)
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

                  {/* Hiển thị file mới đã chọn */}
                  {formData.newFile && (
                    <HStack p={3} bg='green.50' borderRadius='lg' justify='space-between' mb={3}>
                      <HStack gap={2}>
                        <FileText size={18} color='green.500' />
                        <Text fontSize='sm' color='gray.700'>
                          {formData.newFile.name}
                        </Text>
                      </HStack>
                      <Button size='xs' variant='ghost' color='red.500' onClick={removeNewFile}>
                        <X size={14} />
                      </Button>
                    </HStack>
                  )}

                  {/* Upload area */}
                  <Box
                    w='full'
                    border='2px dashed'
                    borderColor='orange.200'
                    borderRadius='xl'
                    p={4}
                    textAlign='center'
                    cursor='pointer'
                    _hover={{ borderColor: '#dd7323', bg: 'orange.50' }}
                    transition='all 0.2s'
                    onClick={() => document.getElementById('edit-assignment-file-upload')?.click()}
                  >
                    <Upload size={24} color='#dd7323' style={{ margin: '0 auto 8px' }} />
                    <Text fontSize='sm' color='gray.600' fontWeight='medium'>
                      {formData.newFile ? 'Chọn file khác' : currentFileKey ? 'Thay đổi file' : 'Chọn file đính kèm'}
                    </Text>
                    <Text fontSize='xs' color='gray.400' mt={1}>
                      PDF, DOC, DOCX, ZIP, RAR, hình ảnh
                    </Text>
                    <input
                      id='edit-assignment-file-upload'
                      type='file'
                      hidden
                      onChange={handleFileChange}
                      accept='.pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg,.gif,.ppt,.pptx,.xls,.xlsx'
                    />
                  </Box>
                </Field.Root>

                {/* Is Published */}
                <HStack>
                  <Checkbox.Root
                    checked={formData.isPublished}
                    onCheckedChange={(e) => handleChange('isPublished', !!e.checked)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control
                      borderWidth='2px'
                      borderColor='gray.300'
                      _checked={{ bg: '#dd7323', borderColor: '#dd7323' }}
                      _hover={{ borderColor: '#dd7323' }}
                    >
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>
                      <HStack gap={1}>
                        <Unlock size={14} color='#dd7323' />
                        <Text>Mở bài tập (cho phép sinh viên nộp bài)</Text>
                      </HStack>
                    </Checkbox.Label>
                  </Checkbox.Root>
                </HStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer p={6} pt={4} borderTop='1px solid' borderColor='gray.100'>
              <HStack gap={3} justify='flex-end'>
                <Button variant='outline' borderColor='orange.200' onClick={handleClose}>
                  Hủy
                </Button>
                <Button bg='#dd7323' color='white' _hover={{ bg: '#c5651f' }} onClick={handleSubmit} loading={loading}>
                  Lưu thay đổi
                </Button>
              </HStack>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size='sm' pos='absolute' top={4} right={4} borderRadius='full' _hover={{ bg: 'gray.100' }} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
