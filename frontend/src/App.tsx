import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import MouseGlow from './components/MouseGlow'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import SpaceBackground from './components/SpaceBackground'
import { useAuth } from './hooks/useAuth'
import AnalysisPage from './pages/AnalysisPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import api from './services/api'
import { useState } from 'react'
import axios from 'axios'

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (type: 'login' | 'register') => {
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.post(`/auth/${type}`, { email, password })
      localStorage.setItem('token', response.data.access_token)
      onAuthenticated()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Unable to reach API. Check that backend is running and VITE_API_URL is correct.')
      } else {
        setError('Unexpected error while authenticating. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Sign in or create an account</h2>
        <input className="w-full bg-white/10 rounded-lg p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full bg-white/10 rounded-lg p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-2">
          <button className="flex-1 glass-card p-2 disabled:opacity-50" disabled={loading} onClick={() => submit('login')}>
            {loading ? 'Working...' : 'Login'}
          </button>
          <button className="flex-1 glass-card p-2 disabled:opacity-50" disabled={loading} onClick={() => submit('register')}>
            {loading ? 'Working...' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, saveToken, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const authRefresh = () => {
    const token = localStorage.getItem('token')
    if (token) saveToken(token)
  }

  return (
    <>
      {location.pathname !== "/" && <SpaceBackground />}
      {location.pathname !== "/" && <MouseGlow />}
      {isAuthenticated && <Navbar onLogout={logout} />}
      <div className={isAuthenticated ? "lg:grid lg:grid-cols-[260px_1fr] min-h-screen" : "min-h-screen"}>
        {isAuthenticated && <div className="hidden lg:block p-6 pt-28"><Sidebar /></div>}
        <main>
          <Routes>
            <Route path="/" element={<LandingPage onEnter={() => navigate('/auth')} />} />
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthScreen onAuthenticated={authRefresh} />} />
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage onSelect={(id) => { setSelectedId(id); navigate('/analysis') }} /> : <Navigate to="/auth" />} />
            <Route path="/analysis" element={isAuthenticated && selectedId ? <AnalysisPage documentId={selectedId} /> : <Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
