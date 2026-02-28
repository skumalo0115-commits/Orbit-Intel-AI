import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
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

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (type: 'login' | 'register') => {
    const response = await api.post(`/auth/${type}`, { email, password })
    localStorage.setItem('token', response.data.access_token)
    onAuthenticated()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md space-y-4">
        <input className="w-full bg-white/10 rounded-lg p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full bg-white/10 rounded-lg p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="flex-1 glass-card p-2" onClick={() => submit('login')}>Login</button>
          <button className="flex-1 glass-card p-2" onClick={() => submit('register')}>Register</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, saveToken, logout } = useAuth()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const authRefresh = () => {
    const token = localStorage.getItem('token')
    if (token) saveToken(token)
  }

  return (
    <>
      <SpaceBackground />
      <MouseGlow />
      {isAuthenticated && <Navbar onLogout={logout} />}
      <div className="lg:grid lg:grid-cols-[260px_1fr] min-h-screen">
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
