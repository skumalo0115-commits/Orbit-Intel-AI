import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import MouseGlow from './components/MouseGlow'
import Navbar from './components/Navbar'
import SpaceBackground from './components/SpaceBackground'
import { useAuth } from './hooks/useAuth'
import AnalysisPage from './pages/AnalysisPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import api from './services/api'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

type AuthMode = 'login' | 'register'

type AuthCardProps = {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onAuthenticated: (username: string) => void
  onClose: () => void
}

function AuthCard({ mode, onModeChange, onAuthenticated, onClose }: AuthCardProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegister = mode === 'register'

  const submit = async () => {
    if (!username || !password || (isRegister && !email)) {
      setError(isRegister ? 'Please enter username, email and password.' : 'Please enter username and password.')
      return
    }

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const payload = isRegister
        ? { username: username.trim(), email: email.trim(), password }
        : { username: username.trim(), password }

      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const response = await api.post(endpoint, payload)

      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('profile_username', username.trim())
      localStorage.removeItem('profile_email')

      if (isRegister) {
        setSuccess('Registration successful. A welcome email has been sent if SMTP is configured.')
      }

      onAuthenticated(username.trim())
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Unable to reach API. Check backend and VITE_API_URL.')
      } else {
        setError('Unexpected error while authenticating. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-card p-8 w-full max-w-md space-y-5 relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 h-8 w-8 rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition"
        aria-label="Close authentication"
      >
        ×
      </button>

      <div className="pr-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Orbit Intel-AI</p>
        <h2 className="text-2xl font-semibold mt-2">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
      </div>

      <div className="space-y-3">
        <input
          className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {isRegister && (
          <input
            className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        <input
          className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {success && <p className="text-sm text-emerald-300">{success}</p>}

      <button
        type="button"
        className="w-full rounded-xl bg-cyan-400/85 hover:bg-cyan-300 text-slate-900 font-semibold py-2.5 transition disabled:opacity-70"
        onClick={submit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
      </button>

      {!isRegister ? (
        <p className="text-sm text-white/70 text-center">
          dont have an account?{' '}
          <button type="button" className="text-cyan-300 hover:text-cyan-200" onClick={() => onModeChange('register')}>
            register
          </button>
        </p>
      ) : (
        <p className="text-sm text-white/70 text-center">
          already have an account?{' '}
          <button type="button" className="text-cyan-300 hover:text-cyan-200" onClick={() => onModeChange('login')}>
            Login
          </button>
        </p>
      )}
    </div>
  )
}

export default function App() {
  const { isAuthenticated, saveToken, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const authRefresh = (username: string) => {
    const token = localStorage.getItem('token')
    if (token) saveToken(token)
    localStorage.setItem('profile_username', username)
    setShowAuthModal(false)
    setAuthMode('login')
    navigate('/dashboard')
  }

  const profileInitial = useMemo(() => {
    const username = localStorage.getItem('profile_username') || ''
    const email = localStorage.getItem('profile_email') || ''
    const seed = username || email
    return seed ? seed[0].toUpperCase() : 'U'
  }, [isAuthenticated])

  const signOut = () => {
    logout()
    localStorage.removeItem('profile_email')
    localStorage.removeItem('profile_username')
    setShowAuthModal(false)
    setAuthMode('login')
    navigate('/')
  }

  const openAuth = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  return (
    <>
      {location.pathname !== '/' && <SpaceBackground />}
      {location.pathname !== '/' && <MouseGlow />}
      {isAuthenticated && location.pathname !== '/' && <Navbar onHome={() => navigate('/')} onSignOut={signOut} profileInitial={profileInitial} />}

      <div className="min-h-screen">
        <main>
          <Routes>
            <Route
              path="/"
              element={<LandingPage onEnter={() => (isAuthenticated ? navigate('/dashboard') : openAuth())} isAuthenticated={isAuthenticated} profileInitial={profileInitial} onSignOut={signOut} />}
            />
            <Route
              path="/auth"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <div className="min-h-screen flex items-center justify-center p-6">
                    <AuthCard mode={authMode} onModeChange={setAuthMode} onAuthenticated={authRefresh} onClose={() => navigate('/')} />
                  </div>
                )
              }
            />
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage onSelect={(id) => navigate(`/analysis/${id}`)} /> : <Navigate to="/auth" />} />
            <Route path="/analysis/:documentId" element={isAuthenticated ? <AnalysisPage /> : <Navigate to="/auth" />} />
            <Route path="/analysis" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setShowAuthModal(false)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <AuthCard mode={authMode} onModeChange={setAuthMode} onAuthenticated={authRefresh} onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
    </>
  )
}
