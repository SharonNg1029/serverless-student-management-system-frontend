import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { Spinner, VStack, Text } from '@chakra-ui/react'
import Navbar from './navbar'
import Footer from './footer'
import { useAuthStore } from '../../store/authStore'

/**
 * UserLayout - Layout for Student, Lecturer, and Common pages
 * This layout includes Navbar, main content area, and Footer
 * Also handles authentication check - redirects to login if not authenticated
 */
const UserLayout: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      // Kiểm tra localStorage trước
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage)
          if (parsed?.state?.isAuthenticated && parsed?.state?.user) {
            setChecking(false)
            return
          }
        } catch (e) {
          // Ignore parse error
        }
      }

      // Nếu không có trong localStorage, check với Cognito
      // Thêm timeout để tránh bị kẹt vô hạn
      try {
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => reject(new Error('Auth check timeout')), 10000)
        })
        await Promise.race([checkAuthStatus(), timeoutPromise])
      } catch (error) {
        console.error('Auth check failed or timed out:', error)
      }
      setChecking(false)
    }

    verifyAuth()
  }, [checkAuthStatus])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!checking && !isLoading && !isAuthenticated) {
      console.log('UserLayout: Not authenticated, redirecting to login')
      navigate('/auth/login', { replace: true })
    }
  }, [checking, isLoading, isAuthenticated, navigate])

  // Show loading while checking auth
  if (checking || isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <VStack gap={4}>
          <Spinner size='xl' color='#dd7323' />
          <Text color='gray.500'>Đang kiểm tra đăng nhập...</Text>
        </VStack>
      </div>
    )
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='layout min-h-screen flex flex-col'>
      <Navbar />
      <main className='layout-content flex-1'>
        <div className='container'>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default UserLayout
