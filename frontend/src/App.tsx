import axios from 'axios'
import { signInWithPopup } from 'firebase/auth'
import { Eye, EyeOff, Loader2, X } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import MouseGlow from './components/MouseGlow'
import Navbar from './components/Navbar'
import SpaceBackground from './components/SpaceBackground'
import { useAuth } from './hooks/useAuth'
import AnalysisPage from './pages/AnalysisPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import api from './services/api'
import { canUseGoogleSignIn, getFirebaseAuthOrNull, getGoogleProvider, missingFirebaseEnvKeys } from './services/firebase'

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

const getApiErrorMessage = (err: unknown, fallback: string) => {
  if (!axios.isAxiosError(err)) {
    return fallback
  }

  const detail = err.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item) return String(item.msg)
        return ''
      })
      .filter(Boolean)
      .join(' ')
  }

  if (err.response?.status) {
    return `${fallback} Server returned ${err.response.status}.`
  }

  if (err.message) {
    return `${fallback} ${err.message}`
  }

  return fallback
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

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

function PasswordField({
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  isVisible,
  onToggleVisibility,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  autoComplete: string
  disabled: boolean
  isVisible: boolean
  onToggleVisibility: () => void
}) {
  const Icon = isVisible ? EyeOff : Eye

  return (
    <div className="relative">
      <input
        className="w-full bg-white/10 border border-white/15 rounded-xl pl-3 pr-12 py-2 outline-none focus:border-cyan-300/60 disabled:opacity-70"
        type={isVisible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-white/65 hover:bg-white/10 hover:text-white transition disabled:opacity-60"
        onClick={onToggleVisibility}
        disabled={disabled}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
      >
        <Icon size={18} />
      </button>
    </div>
  )
}

function AuthCard({ mode, onModeChange, onAuthenticated, onClose }: AuthCardProps) {
  const [username, setUsername] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setUsername('')
    setIdentifier('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setIsPasswordVisible(false)
    setIsConfirmPasswordVisible(false)
    setError(null)
  }, [mode])

  const completeAuth = (payload: TokenPayload) => {
    localStorage.setItem('token', payload.access_token)
    localStorage.setItem('profile_username', payload.username)
    localStorage.setItem('profile_email', payload.email)
    onAuthenticated(payload)
  }

  const submitLogin = async (event?: FormEvent) => {
    event?.preventDefault()

    const normalizedIdentifier = identifier.trim().toLowerCase()

    if (!normalizedIdentifier || !password) {
      setError('Please enter your username or email, plus your password.')
      return
    }

    if (normalizedIdentifier.length < 3 || password.length < 8) {
      setError('Check your username/email and password, then try again.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await api.post<TokenPayload>('/api/auth/login', {
        identifier: normalizedIdentifier,
        password,
      })
      completeAuth(response.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to reach API. Check backend and VITE_API_URL.'))
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
      const response = await api.post<TokenPayload>('/api/auth/google', { id_token: idToken })
      completeAuth(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(getApiErrorMessage(err, 'Google sign-in could not be completed.'))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Google sign-in could not be completed.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitRegister = async (event?: FormEvent) => {
    event?.preventDefault()

    const normalizedUsername = username.trim().toLowerCase()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedUsername || !normalizedEmail || !password || !confirmPassword) {
      setError('Please enter a username, email, and password.')
      return
    }

    if (!/^[a-z0-9_-]{3,50}$/.test(normalizedUsername)) {
      setError('Username must be 3-50 characters and can only use letters, numbers, underscores, or hyphens.')
      return
    }

    if (!isValidEmail(normalizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await api.post<TokenPayload>('/api/auth/register', {
        username: normalizedUsername,
        email: normalizedEmail,
        password,
      })
      completeAuth(response.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'We could not create your account right now.'))
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
        <X size={17} />
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

      <form className="space-y-5" onSubmit={mode === 'login' ? submitLogin : submitRegister}>
        {mode === 'login' && (
          <>
          <div className="space-y-3">
            <input
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60 disabled:opacity-70"
              placeholder="Username or email"
              value={identifier}
              autoComplete="username"
              disabled={isSubmitting}
              onChange={(event) => setIdentifier(event.target.value)}
            />
            <PasswordField
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              disabled={isSubmitting}
              isVisible={isPasswordVisible}
              onChange={setPassword}
              onToggleVisibility={() => setIsPasswordVisible((current) => !current)}
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-400/85 hover:bg-cyan-300 text-slate-900 font-semibold py-2.5 transition disabled:opacity-70 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 size={17} className="animate-spin" />}
            {isSubmitting ? 'Signing in...' : 'Login'}
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
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60 disabled:opacity-70"
              placeholder="Username"
              value={username}
              autoComplete="username"
              disabled={isSubmitting}
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 outline-none focus:border-cyan-300/60 disabled:opacity-70"
              placeholder="Email"
              type="email"
              value={email}
              autoComplete="email"
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
            />
            <PasswordField
              placeholder="Password"
              value={password}
              autoComplete="new-password"
              disabled={isSubmitting}
              isVisible={isPasswordVisible}
              onChange={setPassword}
              onToggleVisibility={() => setIsPasswordVisible((current) => !current)}
            />
            <PasswordField
              placeholder="Confirm password"
              value={confirmPassword}
              autoComplete="new-password"
              disabled={isSubmitting}
              isVisible={isConfirmPasswordVisible}
              onChange={setConfirmPassword}
              onToggleVisibility={() => setIsConfirmPasswordVisible((current) => !current)}
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-400/85 hover:bg-cyan-300 text-slate-900 font-semibold py-2.5 transition disabled:opacity-70 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 size={17} className="animate-spin" />}
            {isSubmitting ? 'Creating account...' : 'Register'}
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
      </form>
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
