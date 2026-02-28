import { useMemo, useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  const isAuthenticated = useMemo(() => Boolean(token), [token])

  const saveToken = (nextToken: string) => {
    localStorage.setItem('token', nextToken)
    setToken(nextToken)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return { token, isAuthenticated, saveToken, logout }
}
