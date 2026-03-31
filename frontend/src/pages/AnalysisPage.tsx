import { useEffect, useMemo, useState } from 'react'
import { Brain, Target } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import SummaryPanel from '../components/SummaryPanel'
import axios from 'axios'
import api from '../services/api'

type ProfessionScore = {
  name: string
  score: number
  reason: string
}

type AnalysisInsights = {
  recommended_professions?: string[]
  profession_scores?: ProfessionScore[]
  target_job_title?: string
  target_fit_percent?: number
  cv_improvement_priorities?: string[]
  exact_cv_additions?: string[]
  ats_keywords_to_add?: string[]
  project_suggestions?: string[]
  [key: string]: unknown
}

interface Analysis {
  summary: string
  classification: string
  entities: { text: string; type: string; score?: number }[]
  insights?: AnalysisInsights
}

type ProfileContext = {
  interests?: string
  skills?: string
  profession?: string
  target_job_title?: string
  target_job_description?: string
}

function AnalysisLoader() {
  return (
    <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
      <div className="relative w-32 h-32 mb-7">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-300 border-r-violet-400 animate-spin" />
        <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-fuchsia-400 border-l-cyan-300 animate-spin [animation-direction:reverse] [animation-duration:1.2s]" />
        <div className="absolute inset-[24px] rounded-full border-2 border-cyan-300/60 animate-pulse" />
      </div>
      <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent animate-pulse">
        Analysing your career path...
      </p>
    </div>
  )
}

function MatchCard({ name, score, reason }: { name: string; score: number; reason: string }) {
  return (
    <article className="rounded-2xl border border-white/20 p-3.5 bg-[linear-gradient(160deg,rgba(147,51,234,0.15),rgba(15,23,42,0.7))] transition hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-2xl font-semibold">{name}</h3>
        <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-lg">{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/15 mb-3 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-[width] duration-300" style={{ width: `${score}%` }} />
      </div>
      <p className="text-[#d6ddef] text-base leading-relaxed">{reason}</p>
    </article>
  )
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assistantQuestion, setAssistantQuestion] = useState('')
  const [assistantAnswer, setAssistantAnswer] = useState<string | null>(null)
  const [assistantError, setAssistantError] = useState<string | null>(null)
  const [assistantLoading, setAssistantLoading] = useState(false)
  const navigate = useNavigate()
  const params = useParams<{ documentId: string }>()
  const documentId = Number(params.documentId)

  useEffect(() => {
    if (!Number.isFinite(documentId) || documentId <= 0) return

    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let profileContext: ProfileContext = {}
        try {
          const raw = sessionStorage.getItem('dashboard_profile_context')
          profileContext = raw ? (JSON.parse(raw) as ProfileContext) : {}
        } catch {
          profileContext = {}
        }

        // Single attempt with faster timeout for better mobile performance
        const response = await api.post<Analysis>(`/analyze/${documentId}`, profileContext, { timeout: 180000 })
        setAnalysis(response.data)
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

  const askAssistant = async () => {
    const question = assistantQuestion.trim()
    if (!question) {
      setAssistantError('Type a question for the assistant first.')
      return
    }

    setAssistantError(null)
    setAssistantLoading(true)
    try {
      const response = await api.post<{ question: string; answer: string }>(`/ask-question/${documentId}`, { question })
      setAssistantAnswer(response.data.answer)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail
        setAssistantError(typeof detail === 'string' ? detail : 'Assistant could not answer right now. Please retry.')
      } else {
        setAssistantError('Assistant could not answer right now. Please retry.')
      }
    } finally {
      setAssistantLoading(false)
    }
  }

  const bgStyle = useMemo(
    () => ({
      backgroundImage: "url('https://wallstreetpit.com/wp-content/uploads/news/ai-cg/AI5-G.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }),
    []
  )

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-20" style={bgStyle} />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(5,8,18,0.75),rgba(5,8,18,0.82))]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.35),transparent_58%)]" />

      <section className="relative z-10 pt-28 pb-12 px-6">
        <div className="max-w-[1180px] mx-auto">
          {isLoading ? (
            <AnalysisLoader />
          ) : error ? (
            <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
              <p className="text-xl text-pink-200 mb-5 max-w-2xl">{error}</p>
              <button onClick={() => navigate('/dashboard')} className="px-7 py-2.5 rounded-2xl text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5">
                Back to Dashboard
              </button>
            </div>
          ) : !analysis ? (
            <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
              <p className="text-xl text-pink-200 mb-5 max-w-2xl">Analysis data is unavailable right now. Please return to dashboard and try again.</p>
              <button onClick={() => navigate('/dashboard')} className="px-7 py-2.5 rounded-2xl text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5">
                Back to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <div className="mb-3 flex items-center justify-center">
                  <Brain className="text-cyan-300" size={44} />
                </div>
                <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent min-h-[62px]">AI Career Intelligence System</h1>
                <p className="text-[#d2d9e7] text-lg mt-2">Next-generation career guidance powered by artificial intelligence</p>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <Target className="text-cyan-300" size={30} />
                <h2 className="text-3xl md:text-4xl font-semibold">Top Career Matches</h2>
              </div>

              <div className="grid xl:grid-cols-3 gap-4 mb-4">
                {professions.map((item, idx) => (
                  <MatchCard key={`${item.name}-${idx}`} name={item.name} score={item.score} reason={item.reason} />
                ))}
              </div>

              {/* AI Career Suggestion Summary - Combined with Target Role Analysis */}
              <div className="rounded-2xl border border-white/20 p-4 bg-[linear-gradient(160deg,rgba(147,51,234,0.16),rgba(15,23,42,0.7))]">
                <SummaryPanel 
                  summary={analysis?.summary} 
                  insights={analysis?.insights as any}
                  targetJobTitle={(analysis?.insights as any)?.target_job_title}
                  classification={analysis?.classification}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-300/30 p-4 bg-[linear-gradient(160deg,rgba(6,182,212,0.14),rgba(15,23,42,0.65))]">
                <h3 className="text-2xl font-semibold mb-2">Career Assistant</h3>
                <p className="text-sm text-[#cfd8ea] mb-3">Ask targeted questions about your fit, missing skills, exact CV bullet improvements, ATS keywords, and how to improve your chances for the target role.</p>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    value={assistantQuestion}
                    onChange={(e) => setAssistantQuestion(e.target.value)}
                    placeholder="Example: Give me 4 exact bullet points to add for a Software Engineer CV."
                    className="flex-1 rounded-xl border border-white/25 bg-white/10 p-3 text-sm"
                  />
                  <button
                    onClick={askAssistant}
                    disabled={assistantLoading}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 font-semibold disabled:opacity-60"
                  >
                    {assistantLoading ? 'Thinking...' : 'Ask Assistant'}
                  </button>
                </div>
                {assistantError && <p className="mt-2 text-sm text-pink-200">{assistantError}</p>}
                {assistantAnswer && <p className="mt-3 text-sm text-[#d7deea] whitespace-pre-line">{assistantAnswer}</p>}
              </div>

              <div className="mt-7 flex justify-center">
                <button onClick={() => navigate('/dashboard')} className="px-7 py-2.5 rounded-2xl text-lg md:text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5">
                  Start New Analyse
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="relative z-10">
        <AppFooter />
      </div>
    </div>
  )
}
