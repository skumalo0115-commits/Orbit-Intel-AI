import { ReactNode, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, CircleCheckBig, CircleDot, LoaderCircle, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import api from '../services/api'

interface Analysis {
  summary: string
  classification: string
  entities: { text: string; type: string; score?: number }[]
  insights?: {
    detected_skills?: string[]
    recommended_professions?: string[]
    improvement_areas?: string[]
    strengths?: string[]
    [key: string]: unknown
  }
}

function AnalysisLoader() {
  return (
    <div className="min-h-[52vh] flex flex-col items-center justify-center text-center">
      <div className="relative w-32 h-32 mb-7">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-300 border-r-violet-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border-4 border-transparent border-b-fuchsia-400 border-l-cyan-300"
          animate={{ rotate: -360 }}
          transition={{ duration: 0.95, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[24px] rounded-full border-2 border-cyan-300/60"
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent"
        animate={{ opacity: [0.5, 1, 0.5], y: [0, -2, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      >
        Analysing your career path...
      </motion.p>
    </div>
  )
}

function InsightCard({ title, icon, items, dotClass }: { title: string; icon: ReactNode; items: string[]; dotClass: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/20 p-4 bg-white/10 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
    >
      <h3 className="text-xl md:text-2xl font-semibold mb-2 inline-flex items-center gap-2">{icon}{title}</h3>
      <ul className="space-y-1.5 text-base md:text-lg text-[#d7deea]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2"><span className={`${dotClass} mt-1.5`}>●</span><span>{item}</span></li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function AnalysisPage({ documentId }: { documentId: number }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      try {
        const response = await api.post<Analysis>(`/analyze/${documentId}`)
        setAnalysis(response.data)
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [documentId])

  const professions = useMemo(() => analysis?.insights?.recommended_professions ?? [], [analysis])
  const strengths = useMemo(() => analysis?.insights?.strengths ?? [], [analysis])
  const skills = useMemo(() => analysis?.insights?.detected_skills ?? [], [analysis])
  const improvements = useMemo(() => analysis?.insights?.improvement_areas ?? [], [analysis])

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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(5,8,18,0.75),rgba(5,8,18,0.8))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.35),transparent_58%)]" />

        <div className="relative z-10 max-w-[1080px] mx-auto">
          {isLoading ? (
            <AnalysisLoader />
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.4 }} className="text-center mb-7">
                <motion.div className="mb-3 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                  <Brain className="text-cyan-300" size={44} />
                </motion.div>
                <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent">AI Career Intelligence System</h1>
                <p className="text-[#d2d9e7] text-base md:text-lg mt-2">CV-based analysis generated from your uploaded document</p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-3 mb-3">
                <InsightCard title="Best Fit Professions" icon={<Target className="text-cyan-300" size={20} />} items={professions.length ? professions : ['No strong profession match detected yet.']} dotClass="text-cyan-300" />
                <InsightCard title="Current Strengths" icon={<CircleCheckBig className="text-emerald-300" size={20} />} items={strengths.length ? strengths : ['No explicit strengths detected from CV text.']} dotClass="text-emerald-300" />
              </div>

              <div className="grid lg:grid-cols-2 gap-3 mb-3">
                <InsightCard title="Detected Skills" icon={<CircleDot className="text-violet-300" size={20} />} items={skills.length ? skills : ['No explicit technical skills found in CV.']} dotClass="text-violet-300" />
                <InsightCard title="Areas to Improve" icon={<LoaderCircle className="text-pink-300" size={20} />} items={improvements.length ? improvements : ['No major gaps detected from available CV text.']} dotClass="text-pink-300" />
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-2xl border border-white/20 p-4 bg-white/10 backdrop-blur-xl">
                <h3 className="text-xl md:text-2xl font-semibold mb-2">Document Summary</h3>
                <p className="text-base md:text-lg text-[#d7deea] leading-relaxed">{analysis?.summary || 'No summary was generated.'}</p>
                <p className="text-sm text-cyan-300 mt-3">Document Type: {analysis?.classification || 'Unknown'}</p>
              </motion.div>

              <div className="mt-7 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3 rounded-2xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)]"
                >
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
