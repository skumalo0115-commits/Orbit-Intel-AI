import { useMemo, useState } from 'react'

const isTokenExpired = (token: string): boolean => {
  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return true

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(window.atob(padded)) as { exp?: number }

    if (!payload.exp) return false
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

const getInitialToken = (): string | null => {
  const stored = localStorage.getItem('token')
  if (!stored) return null

  if (isTokenExpired(stored)) {
    localStorage.removeItem('token')
    return null
  }

  return stored
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(getInitialToken)

  const isAuthenticated = useMemo(() => Boolean(token), [token])

  const saveToken = (nextToken: string) => {
    if (isTokenExpired(nextToken)) {
      localStorage.removeItem('token')
      setToken(null)
      return
    }

    localStorage.setItem('token', nextToken)
    setToken(nextToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return { token, isAuthenticated, saveToken, logout }
}
