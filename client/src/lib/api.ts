import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // Prepend /admin prefix to non-public, non-auth routes
  if (
    config.url &&
    !config.url.startsWith('http://') &&
    !config.url.startsWith('https://') &&
    !config.url.startsWith('/public') &&
    !config.url.startsWith('/auth') &&
    !config.url.startsWith('/admin')
  ) {
    config.url = '/admin' + (config.url.startsWith('/') ? '' : '/') + config.url
  }

  return config
})

// On 401 from any admin route, force logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url: string = err.config?.url || ''
      // Only auto-logout for protected admin API calls, NOT login/verify routes
      const isPublicAuthCall =
        url.includes('/auth/login') ||
        url.includes('/auth/verify-2fa') ||
        url.includes('/auth/resend-2fa') ||
        url.includes('/public/')
      if (!isPublicAuthCall) {
        useAuthStore.getState().logout()
      }
    }
    return Promise.reject(err)
  }
)

export default api
