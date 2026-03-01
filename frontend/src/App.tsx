import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import MouseGlow from './components/MouseGlow'
import Navbar from './components/Navbar'
import SpaceBackground from './components/SpaceBackground'
import { useAuth } from './hooks/useAuth'
import AnalysisPage from './pages/AnalysisPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import api from './services/api'
import { useMemo, useState } from 'react'
import axios from 'axios'

function AuthCard({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async (type: 'login' | 'register') => {
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setError(null)
    try {
      const response = await api.post(`/auth/${type}`, { email, password })
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('profile_email', email)
      onAuthenticated()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Unable to reach API. Check backend and VITE_API_URL.')
      } else {
        setError('Unexpected error while authenticating. Please try again.')
      }
    }
  }

  return (
    <div className="glass-card p-8 w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Sign in or create an account</h2>
      <input className="w-full bg-white/10 rounded-lg p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full bg-white/10 rounded-lg p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="flex gap-2">
        <button className="flex-1 glass-card p-2" onClick={() => submit('login')}>
          Login
        </button>
        <button className="flex-1 glass-card p-2" onClick={() => submit('register')}>
          Register
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, saveToken, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const authRefresh = () => {
    const token = localStorage.getItem('token')
    if (token) saveToken(token)
    setShowAuthModal(false)
    navigate('/dashboard')
  }

  const profileInitial = useMemo(() => {
    const email = localStorage.getItem('profile_email') || ''
    return email ? email[0].toUpperCase() : 'U'
  }, [isAuthenticated])

  const signOut = () => {
    logout()
    localStorage.removeItem('profile_email')
    setShowAuthModal(false)
    navigate('/')
  }

  return (
    <>
      {location.pathname !== '/' && <SpaceBackground />}
      {location.pathname !== '/' && <MouseGlow />}
      {isAuthenticated && location.pathname !== '/' && <Navbar onHome={() => navigate('/')} onResults={() => navigate('/dashboard#results')} onSignOut={signOut} profileInitial={profileInitial} />}

      <div className="min-h-screen">
        <main>
          <Routes>
            <Route
              path="/"
              element={<LandingPage onEnter={() => (isAuthenticated ? navigate('/dashboard') : setShowAuthModal(true))} isAuthenticated={isAuthenticated} profileInitial={profileInitial} onSignOut={signOut} />}
            />
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <div className="min-h-screen flex items-center justify-center p-6"><AuthCard onAuthenticated={authRefresh} /></div>} />
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
            <AuthCard onAuthenticated={authRefresh} />
          </div>
        </div>
      )}
    </>
  )
}
