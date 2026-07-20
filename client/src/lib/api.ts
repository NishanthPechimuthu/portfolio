import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  if (config.url && !config.url.startsWith('/public') && !config.url.startsWith('/auth')) {
    if (!config.url.startsWith('/admin')) {
      config.url = '/admin' + (config.url.startsWith('/') ? '' : '/') + config.url;
    }
  }

  return config
})

// Handle 401 — logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

export default api
