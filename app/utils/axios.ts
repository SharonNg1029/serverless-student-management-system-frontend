import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios'
import { fetchAuthSession } from '@aws-amplify/auth'
import { toaster } from '../components/ui/toaster'

// Cấu hình base URL - URL của API Gateway
const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Tạo axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Flag để tránh multiple refresh requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })

  failedQueue = []
}

// Request interceptor - gửi CẢ HAI token trong header
// BE dùng idToken để xác thực user, accessToken cho một số API khác
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Lấy token từ Cognito session
      const session = await fetchAuthSession()
      const idToken = session.tokens?.idToken?.toString()
      const accessToken = session.tokens?.accessToken?.toString()

      console.log('=== TOKEN DEBUG ===')
      console.log('idToken exists:', !!idToken)
      console.log('accessToken exists:', !!accessToken)
      console.log('Request URL:', config.url)
      console.log('Base URL:', BASE_URL)

      if (config.headers) {
        // BE yêu cầu:
        // - Authorization: Bearer accessToken
        // - user-idToken: idToken (để lấy email/user info)
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
          console.log('Set Authorization header')
        }
        if (idToken) {
          config.headers['user-idToken'] = idToken
          console.log('Set user-idToken header')
        }
      }

      console.log('Final headers:', Object.keys(config.headers || {}))

      return config
    } catch (error) {
      console.error('Error getting token:', error)
      return config
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý response và errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Xử lý lỗi từ WAF (403, 429)
    if (error.response) {
      const status = error.response.status

      // WAF Block (403 Forbidden)
      if (status === 403) {
        console.error('Request blocked by WAF or Access Denied')
        toaster.create({
          title: 'Truy cập bị từ chối',
          description: 'Yêu cầu của bạn bị chặn bởi tường lửa (WAF) hoặc bạn không có quyền truy cập.',
          type: 'error',
          duration: 5000
        })
      }

      // WAF Rate Limit (429 Too Many Requests)
      if (status === 429) {
        console.error('Rate limit exceeded')
        toaster.create({
          title: 'Quá nhiều yêu cầu',
          description: 'Bạn đang gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
          type: 'warning',
          duration: 5000
        })
      }
    }

    // Xử lý lỗi 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đưa request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh token thông qua Cognito
        const session = await fetchAuthSession({ forceRefresh: true })
        const newIdToken = session.tokens?.idToken?.toString()
        const newAccessToken = session.tokens?.accessToken?.toString()

        if (originalRequest.headers) {
          // BE yêu cầu:
          // - Authorization: Bearer accessToken
          // - user-idToken: idToken
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }
          if (newIdToken) {
            originalRequest.headers['user-idToken'] = newIdToken
          }
        }

        processQueue(null)
        isRefreshing = false

        // Retry request với token mới
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false

        // Không thể refresh token, redirect về login
        console.error('Token refresh failed, redirecting to login')

        // Clear auth state
        localStorage.removeItem('auth-storage')

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied - insufficient permissions')
    }

    // Xử lý lỗi 500 - Server Error
    if (error.response?.status === 500) {
      console.error('Server error, please try again later')
    }

    // Chuyển đổi lỗi kỹ thuật thành thông báo thân thiện
    // Không hiển thị status code hay error message từ BE
    const status = error.response?.status
    let friendlyMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.'

    if (!error.response) {
      // Network error
      friendlyMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối.'
    } else if (status === 400) {
      friendlyMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
    } else if (status === 401) {
      friendlyMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    } else if (status === 403) {
      // Đã xử lý ở trên với WAF message
      friendlyMessage = 'Bạn không có quyền thực hiện thao tác này.'
    } else if (status === 404) {
      friendlyMessage = 'Không tìm thấy dữ liệu yêu cầu.'
    } else if (status === 405) {
      friendlyMessage = 'Thao tác không được hỗ trợ.'
    } else if (status === 409) {
      friendlyMessage = 'Dữ liệu bị xung đột. Vui lòng thử lại.'
    } else if (status === 422) {
      friendlyMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
    } else if (status === 429) {
      // Đã xử lý ở trên với rate limit message
      friendlyMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
    } else if (status && status >= 500) {
      friendlyMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.'
    }

    // Log chi tiết cho debugging (không hiển thị cho user)
    console.error('API Error:', {
      status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    })

    // Chỉ hiển thị toast nếu chưa được xử lý ở trên (403, 429)
    if (status !== 403 && status !== 429) {
      toaster.create({
        title: 'Lỗi',
        description: friendlyMessage,
        type: 'error',
        duration: 3000
      })
    }

    return Promise.reject(error)
  }
)

export default api
