import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const base = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/api`
  : '/api'

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
