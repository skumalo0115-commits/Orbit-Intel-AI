import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Target } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import axios from 'axios'
import api from '../services/api'

type ProfessionScore = {
  name: string
  score: number
  reason: string
}

interface Analysis {
  summary: string
  classification: string
  entities: { text: string; type: string; score?: number }[]
  insights?: {
    recommended_professions?: string[]
    profession_scores?: ProfessionScore[]
    [key: string]: unknown
  }
}

type ProfileContext = {
  interests?: string
  skills?: string
}

function useTypingText(text: string, speed = 24) {
  const [value, setValue] = useState('')

  useEffect(() => {
    let i = 0
    setValue('')
    const t = setInterval(() => {
      i += 1
      setValue(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)

    return () => clearInterval(t)
  }, [text, speed])

  return value
}

function AnalysisLoader() {
  return (
    <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
      <div className="relative w-32 h-32 mb-7">
        <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-300 border-r-violet-400" animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute inset-3 rounded-full border-4 border-transparent border-b-fuchsia-400 border-l-cyan-300" animate={{ rotate: -360 }} transition={{ duration: 0.82, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute inset-[24px] rounded-full border-2 border-cyan-300/60" animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <motion.p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent" animate={{ opacity: [0.55, 1, 0.55], y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
        Analysing your career path...
      </motion.p>
    </div>
  )
}

function MatchCard({ name, score, reason, delay }: { name: string; score: number; reason: string; delay: number }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setValue(score), 200 + delay * 140)
    return () => clearTimeout(t)
  }, [score, delay])

  return (
    <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} whileHover={{ y: -6, scale: 1.02, boxShadow: '0 18px 36px rgba(124,58,237,0.25)' }} transition={{ duration: 0.4, delay: delay * 0.08 }} className="rounded-2xl border border-white/20 p-3.5 bg-[linear-gradient(160deg,rgba(147,51,234,0.15),rgba(15,23,42,0.7)) ]">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-2xl font-semibold">{name}</h3>
        <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-lg">{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/15 mb-3 overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.6, ease: 'easeOut' }} />
      </div>
      <p className="text-[#d6ddef] text-base leading-relaxed">{reason}</p>
    </motion.article>
  )
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const params = useParams<{ documentId: string }>()
  const documentId = Number(params.documentId)

  useEffect(() => {
    if (!Number.isFinite(documentId) || documentId <= 0) return

    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let lastError: unknown = null
        let profileContext: ProfileContext = {}
        try {
          const raw = sessionStorage.getItem('dashboard_profile_context')
          profileContext = raw ? (JSON.parse(raw) as ProfileContext) : {}
        } catch {
          profileContext = {}
        }

        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const response = await api.post<Analysis>(`/analyze/${documentId}`, profileContext, { timeout: 300000 })
            setAnalysis(response.data)
            lastError = null
            break
          } catch (innerErr) {
            lastError = innerErr
            if (attempt < 1) {
              await new Promise((resolve) => setTimeout(resolve, 600))
            }
          }
        }

        if (lastError) throw lastError
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail
          setError(typeof detail === 'string' ? detail : 'Analysis failed. Please try another document or retry.')
        } else {
          setError('Analysis failed unexpectedly. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [documentId])

  if (!Number.isFinite(documentId) || documentId <= 0) return <Navigate to="/dashboard" />

  const professions = useMemo(() => {
    const scored = analysis?.insights?.profession_scores ?? []
    if (scored.length >= 3) return scored.slice(0, 3)

    const fallback = (analysis?.insights?.recommended_professions ?? []).slice(0, 3).map((name, idx) => ({
      name,
      score: [92, 86, 80][idx] ?? 75,
      reason: 'Profession match derived from your CV signals and profile context.',
    }))

    return fallback.length ? fallback : [{ name: 'General Professional Role', score: 70, reason: 'Limited profile signals found in the CV text.' }]
  }, [analysis])

  const heading = useTypingText('AI Career Intelligence System', 60)

  const typedSummary = useTypingText(analysis?.summary?.trim() || 'No summary was generated.', 22)

  const bgStyle = useMemo(
    () => ({
      backgroundImage: "url('https://wallstreetpit.com/wp-content/uploads/news/ai-cg/AI5-G.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }),
    []
  )

  return (
    <div className="min-h-screen">
      <section className="relative pt-28 pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0" style={bgStyle} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(5,8,18,0.75),rgba(5,8,18,0.82))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.35),transparent_58%)]" />

        <motion.div className="relative z-10 max-w-[1180px] mx-auto">
          {isLoading ? (
            <AnalysisLoader />
          ) : error ? (
            <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
              <p className="text-xl text-pink-200 mb-5 max-w-2xl">{error}</p>
              <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/dashboard')} className="px-7 py-2.5 rounded-2xl text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)]">
                Back to Dashboard
              </motion.button>
            </div>
          ) : !analysis ? (
            <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
              <p className="text-xl text-pink-200 mb-5 max-w-2xl">Analysis data is unavailable right now. Please return to dashboard and try again.</p>
              <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/dashboard')} className="px-7 py-2.5 rounded-2xl text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)]">
                Back to Dashboard
              </motion.button>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.4 }} className="text-center mb-7">
                <motion.div className="mb-3 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                  <Brain className="text-cyan-300" size={44} />
                </motion.div>
                <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent min-h-[62px]">{heading}</h1>
                <p className="text-[#d2d9e7] text-lg mt-2">Next-generation career guidance powered by artificial intelligence</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="mb-4 flex items-center gap-2">
                <Target className="text-cyan-300" size={30} />
                <h2 className="text-3xl md:text-4xl font-semibold">Top Career Matches</h2>
              </motion.div>

              <div className="grid xl:grid-cols-3 gap-4 mb-4">
                {professions.map((item, idx) => (
                  <MatchCard key={`${item.name}-${idx}`} name={item.name} score={item.score} reason={item.reason} delay={idx} />
                ))}
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-2xl border border-white/20 p-4 bg-[linear-gradient(160deg,rgba(147,51,234,0.16),rgba(15,23,42,0.7)) ]">
                <h3 className="text-2xl font-semibold mb-2">AI Career Suggestion Summary</h3>
                <p className="text-base text-[#d7deea] leading-relaxed min-h-[120px]">{typedSummary}</p>
                <p className="text-lg text-cyan-300 mt-3">Document Type: {analysis?.classification || 'Unknown'}</p>
              </motion.div>

              <div className="mt-7 flex justify-center">
                <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/dashboard')} className="px-7 py-2.5 rounded-2xl text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)]">
                  Start New Analyse
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </section>

      <AppFooter />
    </div>
  )
}
