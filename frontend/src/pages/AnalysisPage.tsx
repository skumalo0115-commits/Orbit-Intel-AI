import { ReactNode, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, CircleDot, BookOpen, Target } from 'lucide-react'
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
    detected_skills?: string[]
    recommended_professions?: string[]
    improvement_areas?: string[]
    strengths?: string[]
    profession_scores?: ProfessionScore[]
    [key: string]: unknown
  }
}

function AnalysisLoader() {
  return (
    <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
      <div className="relative w-32 h-32 mb-7">
        <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-300 border-r-violet-400" animate={{ rotate: 360 }} transition={{ duration: 0.82, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute inset-3 rounded-full border-4 border-transparent border-b-fuchsia-400 border-l-cyan-300" animate={{ rotate: -360 }} transition={{ duration: 0.72, repeat: Infinity, ease: 'linear' }} />
        <motion.div className="absolute inset-[24px] rounded-full border-2 border-cyan-300/60" animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.88, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <motion.p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent" animate={{ opacity: [0.5, 1, 0.5], y: [0, -2, 0] }} transition={{ duration: 0.72, repeat: Infinity, ease: 'easeInOut' }}>
        Analysing your career path...
      </motion.p>
    </div>
  )
}

function MatchCard({ name, score, reason, delay }: { name: string; score: number; reason: string; delay: number }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setValue(score), 120 + delay * 100)
    return () => clearTimeout(t)
  }, [score, delay])

  return (
    <motion.article initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} whileHover={{ y: -6, scale: 1.02, boxShadow: '0 18px 36px rgba(124,58,237,0.25)' }} transition={{ duration: 0.35, delay: delay * 0.07 }} className="rounded-2xl border border-white/20 p-3.5 bg-[linear-gradient(160deg,rgba(147,51,234,0.15),rgba(15,23,42,0.7))] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-2xl font-semibold">{name}</h3>
        <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-lg">{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/15 mb-3 overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      </div>
      <p className="text-[#d6ddef] text-base leading-relaxed">{reason}</p>
    </motion.article>
  )
}

function InsightPanel({ title, icon, items, dotColor }: { title: string; icon: ReactNode; items: string[]; dotColor: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-2xl border border-white/20 p-3.5 bg-white/10 backdrop-blur-xl">
      <h3 className="text-2xl font-semibold mb-3 inline-flex items-center gap-2">{icon}{title}</h3>
      <ul className="space-y-2 text-base text-[#d7deea]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2"><span className={dotColor}>●</span><span>{item}</span></li>
        ))}
      </ul>
    </motion.div>
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
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const response = await api.post<Analysis>(`/analyze/${documentId}`, undefined, { timeout: 300000 })
            setAnalysis(response.data)
            lastError = null
            break
          } catch (innerErr) {
            lastError = innerErr
            if (attempt < 2) {
              await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
            }
          }
        }

        if (lastError) {
          throw lastError
        }
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
    run()
  }, [documentId])

  if (!Number.isFinite(documentId) || documentId <= 0) return <Navigate to="/dashboard" />

  const professions = useMemo(() => {
    const scored = analysis?.insights?.profession_scores ?? []
    if (scored.length >= 3) return scored.slice(0, 3)

    const fallback = (analysis?.insights?.recommended_professions ?? []).slice(0, 3).map((name, idx) => ({
      name,
      score: [92, 86, 80][idx] ?? 75,
      reason: 'Profession match derived from your CV skills and experience.',
    }))

    return fallback.length ? fallback : [{ name: 'General Professional Role', score: 70, reason: 'Limited profile signals found in the CV text.' }]
  }, [analysis])

  const skills = useMemo(() => analysis?.insights?.detected_skills ?? ['No explicit technical/domain skills found in CV.'], [analysis])
  const improvements = useMemo(() => analysis?.insights?.improvement_areas ?? ['No major gaps detected from available CV text.'], [analysis])

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

        <div className="relative z-10 max-w-[1180px] mx-auto">
          {isLoading ? (
            <AnalysisLoader />
          ) : error ? (
            <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
              <p className="text-xl text-pink-200 mb-5 max-w-2xl">{error}</p>
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
                <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent">AI Career Intelligence System</h1>
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

              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <InsightPanel title="Skills to Develop" icon={<CircleDot className="text-violet-300" size={24} />} items={skills} dotColor="text-violet-300 mt-1" />
                <InsightPanel title="Learning Path" icon={<BookOpen className="text-pink-300" size={24} />} items={improvements} dotColor="text-pink-300 mt-1" />
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-2xl border border-white/20 p-3.5 bg-white/10 backdrop-blur-xl">
                <h3 className="text-2xl font-semibold mb-2">Document Summary</h3>
                <p className="text-base text-[#d7deea] leading-relaxed">{analysis?.summary || 'No summary was generated.'}</p>
                <p className="text-lg text-cyan-300 mt-3">Document Type: {analysis?.classification || 'Unknown'}</p>
              </motion.div>

              <div className="mt-7 flex justify-center">
                <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/dashboard')} className="px-7 py-2.5 rounded-2xl text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)]">
                  Start New Analyse
                </motion.button>
              </div>
            </>
          )}
        </div>
      </section>

      <AppFooter />
    </div>
  )
}
