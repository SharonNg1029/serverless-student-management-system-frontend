'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { VStack, Text, Spinner } from '@chakra-ui/react'
import { useAuthStore } from '../store/authStore'

/**
 * NotFound page - Handles 404 and redirects based on auth status
 * - If authenticated: redirect to role-based home page
 * - If not authenticated: redirect to login
 */
export default function NotFoundPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading, checkAuthStatus } = useAuthStore()

  const getRedirectPathByRole = (role?: string): string => {
    switch (role) {
      case 'Admin':
        return '/admin/settings'
      case 'Lecturer':
        return '/lecturer/dashboard'
      case 'Student':
        return '/home'
      default:
        return '/home'
    }
  }

  useEffect(() => {
    const handleRedirect = async () => {
      // Kiểm tra localStorage trước
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage)
          if (parsed?.state?.isAuthenticated && parsed?.state?.user?.role) {
            const redirectPath = getRedirectPathByRole(parsed.state.user.role)
            console.log('NotFound: Authenticated, redirecting to', redirectPath)
            navigate(redirectPath, { replace: true })
            return
          }
        } catch (e) {
          // Ignore parse error
        }
      }

      // Nếu không có trong localStorage, check với Cognito
      await checkAuthStatus()
    }

    handleRedirect()
  }, [checkAuthStatus, navigate])

  // Redirect based on auth status after checkAuthStatus completes
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.role) {
        const redirectPath = getRedirectPathByRole(user.role)
        console.log('NotFound: Authenticated, redirecting to', redirectPath)
        navigate(redirectPath, { replace: true })
      } else {
        console.log('NotFound: Not authenticated, redirecting to login')
        navigate('/auth/login', { replace: true })
      }
    }
  }, [isLoading, isAuthenticated, user, navigate])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <VStack gap={4}>
        <Spinner size='xl' color='#dd7323' />
        <Text color='gray.500'>Đang chuyển hướng...</Text>
      </VStack>
    </div>
  )
}
