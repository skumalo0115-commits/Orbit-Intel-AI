import axios from 'axios'

const envBaseUrl = import.meta.env.VITE_API_URL as string | undefined
const defaultBaseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : window.location.origin

const api = axios.create({
  baseURL: envBaseUrl ?? defaultBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
