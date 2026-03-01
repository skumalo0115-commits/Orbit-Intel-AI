import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

type RetryableConfig = InternalAxiosRequestConfig & {
  __baseUrlIndex?: number
  __baseUrlCandidates?: string[]
}

const trimSlash = (value: string) => value.replace(/\/$/, '')

const getBaseUrlCandidates = (): string[] => {
  const envBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim()
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const origin = window.location.origin

  const candidates = [
    envBaseUrl,
    hostname === 'localhost' ? `${protocol}//localhost:8000` : `${protocol}//${hostname}:8000`,
    origin,
  ].filter((value): value is string => Boolean(value && value.length > 0))

  return [...new Set(candidates.map(trimSlash))]
}

const api = axios.create({
  baseURL: getBaseUrlCandidates()[0],
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const retryConfig = config as RetryableConfig
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (!retryConfig.__baseUrlCandidates || retryConfig.__baseUrlCandidates.length === 0) {
    retryConfig.__baseUrlCandidates = getBaseUrlCandidates()
  }

  if (retryConfig.__baseUrlIndex === undefined) {
    retryConfig.__baseUrlIndex = 0
  }

  const activeBase = retryConfig.__baseUrlCandidates[retryConfig.__baseUrlIndex]
  if (activeBase) {
    config.baseURL = activeBase
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined
    if (!config) {
      return Promise.reject(error)
    }

    const hasResponse = Boolean(error.response)
    const retryableStatus = error.response?.status === 404 || error.response?.status === 502
    const shouldRetry = !hasResponse || retryableStatus

    if (!shouldRetry) {
      return Promise.reject(error)
    }

    const candidates = config.__baseUrlCandidates ?? getBaseUrlCandidates()
    const currentIndex = config.__baseUrlIndex ?? 0
    const nextIndex = currentIndex + 1

    if (nextIndex >= candidates.length) {
      return Promise.reject(error)
    }

    config.__baseUrlCandidates = candidates
    config.__baseUrlIndex = nextIndex
    config.baseURL = candidates[nextIndex]

    return api.request(config)
  }
)

export default api
