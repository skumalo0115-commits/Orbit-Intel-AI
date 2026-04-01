import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import MouseGlow from './components/MouseGlow'
import Navbar from './components/Navbar'
import SpaceBackground from './components/SpaceBackground'
import { useAuth } from './hooks/useAuth'
import AnalysisPage from './pages/AnalysisPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import api from './services/api'
import { getFirebaseAuth, googleProvider } from './services/firebase'

type AuthMode = 'login' | 'register'

type TokenPayload = {
  access_token: string
  username: string
  email: string
}

type AuthCardProps = {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onAuthenticated: (payload: TokenPayload) => void
  onClose: () => void
}

function GoogleButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      className="w-full rounded-xl border border-white/15 bg-white/6 hover:bg-white/10 text-white font-medium py-2.5 transition disabled:opacity-70 flex items-center justify-center gap-3"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 font-bold">G</span>
      {label}
    </button>
  )
}

function AuthCard({ mode, onModeChange, onAuthenticated, onClose }: AuthCardProps) {
  const [username, setUsername] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setUsername('')
    setIdentifier('')
    setPassword('')
    setError(null)
  }, [mode])

  const completeAuth = (payload: TokenPayload) => {
    localStorage.setItem('token', payload.access_token)
    localStorage.setItem('profile_username', payload.username)
    localStorage.setItem('profile_email', payload.email)
    onAuthenticated(payload)
  }

  const submitLogin = async () => {
    if (!identifier.trim() || !password) {
      setError('Please enter your username or email, plus your password.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await api.post<TokenPayload>('/auth/login', {
        identifier: identifier.trim(),
        password,
      })
      completeAuth(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Unable to reach API. Check backend and VITE_API_URL.')
      } else {
        setError('Unexpected error while logging in. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitGoogle = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const firebaseAuth = getFirebaseAuth()
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      const idToken = await result.user.getIdToken()
      const response = await api.post<TokenPayload>('/auth/google', { id_token: idToken })
      completeAuth(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Google sign-in could not be completed.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Google sign-in could not be completed.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitRegister = async () => {
    if (!username.trim() || !identifier.trim() || !password) {
      setError('Please enter a username, email, and password.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await api.post<TokenPayload>('/auth/register', {
        username: username.trim(),
        email: identifier.trim(),
        password,
      })
      completeAuth(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'We could not create your account right now.')
      } else {
        setError('We could not create your account right now.')
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
        X
      </button>

      <div className="pr-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Orbit Intel-AI</p>
        <h2 className="text-2xl font-semibold mt-2">
          {mode === 'login' && 'Welcome back'}
          {mode === 'register' && 'Create your account'}
        </h2>
        <p className="text-sm text-white/65 mt-2">
          {mode === 'login' && 'Sign in with your username or email, or use Google.'}
          {mode === 'register' && 'Register with email and password, or use Google if you prefer.'}
        </p>
      </div>

      {mode === 'login' && (
        <>
          <div className="space-y-3">
            <input
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
              placeholder="Username or email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
            <input
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="button"
            className="w-full rounded-xl bg-cyan-400/85 hover:bg-cyan-300 text-slate-900 font-semibold py-2.5 transition disabled:opacity-70"
            onClick={submitLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : 'Login'}
          </button>

          <div className="relative py-1 text-center text-xs uppercase tracking-[0.2em] text-white/40">
            <span className="relative z-10 bg-[#080d17] px-3">or</span>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/10" />
          </div>

          <GoogleButton label={isSubmitting ? 'Please wait...' : 'Continue with Google'} onClick={submitGoogle} disabled={isSubmitting} />

          <p className="text-sm text-white/70 text-center">
            need an account?{' '}
            <button type="button" className="text-cyan-300 hover:text-cyan-200" onClick={() => onModeChange('register')}>
              register
            </button>
          </p>
        </>
      )}

      {mode === 'register' && (
        <>
          <div className="space-y-3">
            <input
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
              placeholder="Email"
              type="email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
            <input
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="button"
            className="w-full rounded-xl bg-cyan-400/85 hover:bg-cyan-300 text-slate-900 font-semibold py-2.5 transition disabled:opacity-70"
            onClick={submitRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait...' : 'Register'}
          </button>

          <div className="relative py-1 text-center text-xs uppercase tracking-[0.2em] text-white/40">
            <span className="relative z-10 bg-[#080d17] px-3">or</span>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/10" />
          </div>

          <GoogleButton label={isSubmitting ? 'Please wait...' : 'Sign up with Google'} onClick={submitGoogle} disabled={isSubmitting} />

          <p className="text-sm text-white/70 text-center">
            already have an account?{' '}
            <button type="button" className="text-cyan-300 hover:text-cyan-200" onClick={() => onModeChange('login')}>
              go to login
            </button>
          </p>
        </>
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
  const showAmbientEffects = location.pathname === '/auth'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const authRefresh = (payload: TokenPayload) => {
    saveToken(payload.access_token)
    localStorage.setItem('profile_username', payload.username)
    localStorage.setItem('profile_email', payload.email)
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

  const closeAuth = () => {
    setShowAuthModal(false)
    setAuthMode('login')
  }

  return (
    <>
      {showAmbientEffects && <SpaceBackground />}
      {showAmbientEffects && <MouseGlow />}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={closeAuth}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-md" onClick={(event) => event.stopPropagation()}>
            <AuthCard mode={authMode} onModeChange={setAuthMode} onAuthenticated={authRefresh} onClose={closeAuth} />
          </div>
        </div>
      )}
    </>
  )
}
