'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  Text,
  HStack,
  VStack,
  Badge,
  Dialog,
  Portal,
  CloseButton,
  IconButton,
  Box,
  Icon,
  Separator
} from '@chakra-ui/react'
import { BookOpen, Users, LogOut, Eye, Calendar } from 'lucide-react'

export interface EnrolledClass {
  classId: string
  subjectId: string
  subjectName: string
  lecturerName: string
  totalStudents: number
  enrolledAt?: string
}

interface CourseCardProps {
  course: EnrolledClass
  onViewDetails: (classId: string) => void
  onUnenroll: (classId: string) => Promise<void>
}

export default function CourseCard({ course, onViewDetails, onUnenroll }: CourseCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUnenrolling, setIsUnenrolling] = useState(false)

  const handleUnenroll = async () => {
    setIsUnenrolling(true)
    try {
      await onUnenroll(course.classId)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to unenroll:', error)
    } finally {
      setIsUnenrolling(false)
    }
  }

  return (
    <>
      <Card.Root
        variant='elevated'
        overflow='hidden'
        _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
        transition='all 0.2s ease-in-out'
        borderRadius='xl'
        w='full'
        maxW='360px'
      >
        {/* Header with gradient */}
        <Card.Header p={4} bgGradient='to-r' gradientFrom='orange.500' gradientTo='orange.400' color='white'>
          <HStack justifyContent='space-between' alignItems='flex-start' w='full'>
            <VStack alignItems='flex-start' gap={1} flex={1}>
              <Card.Title fontSize='lg' fontWeight='bold' color='white' lineClamp={2}>
                {course.subjectName}
              </Card.Title>
              <Card.Description fontSize='sm' color='whiteAlpha.900'>
                {course.classId}
              </Card.Description>
            </VStack>
            <Badge colorPalette='green' variant='solid' size='sm' borderRadius='full'>
              Enrolled
            </Badge>
          </HStack>
        </Card.Header>

        {/* Body */}
        <Card.Body gap={4} p={4}>
          <HStack gap={3} color='fg.muted' flexWrap='wrap'>
            <HStack gap={2}>
              <Icon asChild color='orange.500'>
                <Users size={16} />
              </Icon>
              <Text fontSize='sm' fontWeight='medium'>
                {course.lecturerName}
              </Text>
            </HStack>

            <Separator orientation='vertical' height='4' />

            <HStack gap={2}>
              <Icon asChild color='blue.500'>
                <BookOpen size={16} />
              </Icon>
              <Text fontSize='sm'>{course.totalStudents} students</Text>
            </HStack>
          </HStack>

          {course.enrolledAt && (
            <HStack gap={2} color='fg.muted'>
              <Icon asChild color='gray.500'>
                <Calendar size={14} />
              </Icon>
              <Text fontSize='xs'>Enroll Date: {new Date(course.enrolledAt).toLocaleDateString('vi-VN')}</Text>
            </HStack>
          )}
        </Card.Body>

        {/* Footer */}
        <Card.Footer p={4} pt={0} gap={2}>
          <Button
            bg='orange.400'
            color='white'
            flex={1}
            size='sm'
            borderRadius='lg'
            _hover={{ bg: 'orange.500' }}
            onClick={() => onViewDetails(course.classId)}
          >
            <Eye size={16} />
            View Details
          </Button>
          <IconButton
            aria-label='Unenroll'
            bg='white'
            color='red.500'
            border='1px solid'
            borderColor='gray.200'
            size='sm'
            borderRadius='lg'
            _hover={{ bg: 'red.50', borderColor: 'red.200' }}
            onClick={() => setIsDialogOpen(true)}
          >
            <LogOut size={16} />
          </IconButton>
        </Card.Footer>
      </Card.Root>

      {/* Unenroll Confirmation Dialog */}
      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
        role='alertdialog'
        placement='center'
        motionPreset='slide-in-bottom'
      >
        <Portal>
          <Dialog.Backdrop bg='blackAlpha.600' backdropFilter='blur(4px)' />
          <Dialog.Positioner>
            <Dialog.Content borderRadius='2xl' shadow='2xl' maxW='md' mx={4} overflow='hidden'>
              <Dialog.Header pt={6} pb={2} px={6}>
                <VStack gap={4} w='full' align='center'>
                  {/* Warning Icon */}
                  <Box
                    p={4}
                    borderRadius='full'
                    bg='red.50'
                    border='4px solid'
                    borderColor='red.100'
                    shadow='lg'
                    _dark={{ bg: 'red.900', borderColor: 'red.800' }}
                  >
                    <Icon asChild color='red.500' boxSize={8}>
                      <LogOut size={32} />
                    </Icon>
                  </Box>
                  <Dialog.Title fontSize='xl' fontWeight='bold' textAlign='center' color='gray.800'>
                    Confirm Unenrollment
                  </Dialog.Title>
                </VStack>
              </Dialog.Header>

              <Dialog.Body py={4} px={6}>
                <VStack gap={4} align='center'>
                  <Text color='gray.600' textAlign='center' lineHeight='1.7'>
                    Are you sure you want to unenroll from the class
                  </Text>
                  <Box bg='gray.50' borderRadius='xl' p={4} w='full' border='1px solid' borderColor='gray.200'>
                    <VStack gap={1}>
                      <Text fontWeight='bold' fontSize='lg' color='orange.600'>
                        {course.classId}
                      </Text>
                      <Text color='gray.700' fontWeight='medium'>
                        {course.subjectName}
                      </Text>
                    </VStack>
                  </Box>
                  <HStack gap={2} bg='red.50' borderRadius='lg' p={3} w='full' border='1px solid' borderColor='red.200'>
                    <Text color='red.600' fontSize='lg'>
                      ⚠️
                    </Text>
                    <Text fontSize='sm' color='red.600' fontWeight='medium'>
                      This action cannot be undone!
                    </Text>
                  </HStack>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap={3} px={6} pb={6} pt={2}>
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant='outline'
                    disabled={isUnenrolling}
                    borderRadius='xl'
                    flex={1}
                    size='lg'
                    fontWeight='semibold'
                    borderWidth='2px'
                    _hover={{ bg: 'gray.50' }}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette='red'
                  onClick={handleUnenroll}
                  loading={isUnenrolling}
                  loadingText='Đang xử lý...'
                  borderRadius='xl'
                  flex={1}
                  size='lg'
                  fontWeight='semibold'
                  shadow='md'
                  _hover={{
                    shadow: 'lg',
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s'
                  }}
                >
                  Confirm Unenrollment
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton
                  size='sm'
                  pos='absolute'
                  top={4}
                  right={4}
                  borderRadius='full'
                  _hover={{ bg: 'gray.100' }}
                />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
