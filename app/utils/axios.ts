import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

// Cấu hình base URL - thay đổi theo môi trường của bạn
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Tạo axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào mỗi request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý response và errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401) {
      // Xóa token và redirect về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied');
    }

    // Xử lý lỗi 500 - Server Error
    if (error.response?.status === 500) {
      console.error('Server error, please try again later');
    }

    return Promise.reject(error);
  }
);

export default api;
