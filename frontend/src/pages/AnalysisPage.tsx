import { useEffect, useMemo, useState } from 'react'
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
    <div className="min-h-[58vh] flex flex-col items-center justify-center text-center">
      <div className="relative w-36 h-36 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-300 border-r-violet-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border-4 border-transparent border-b-fuchsia-400 border-l-cyan-300"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[26px] rounded-full border-2 border-cyan-300/60"
          animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent"
        animate={{ opacity: [0.5, 1, 0.5], y: [0, -2, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Analysing your career path...
      </motion.p>
    </div>
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
        await api.post(`/analyze/${documentId}`)
        const response = await api.get<Analysis>(`/analysis/${documentId}`)
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

        <div className="relative z-10 max-w-[1180px] mx-auto">
          {isLoading ? (
            <AnalysisLoader />
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.4 }} className="text-center mb-8">
                <motion.div className="mb-3 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                  <Brain className="text-cyan-300" size={48} />
                </motion.div>
                <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent">AI Career Intelligence System</h1>
                <p className="text-[#d2d9e7] text-lg md:text-xl mt-3">CV-based analysis and profession-fit insights generated from your uploaded document</p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-3xl border border-white/20 p-5 bg-white/10 backdrop-blur-xl">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 inline-flex items-center gap-2"><Target className="text-cyan-300" size={24} /> Best Fit Professions</h3>
                  <ul className="space-y-2 text-lg md:text-xl text-[#d7deea]">
                    {(professions.length ? professions : ['No strong profession match detected yet.']).map((item) => (
                      <li key={item} className="flex items-start gap-3"><span className="text-cyan-300 mt-1.5">●</span><span>{item}</span></li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-3xl border border-white/20 p-5 bg-white/10 backdrop-blur-xl">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 inline-flex items-center gap-2"><CircleCheckBig className="text-emerald-300" size={24} /> Current Strengths</h3>
                  <ul className="space-y-2 text-lg md:text-xl text-[#d7deea]">
                    {(strengths.length ? strengths : ['No explicit strengths detected from CV text.']).map((item) => (
                      <li key={item} className="flex items-start gap-3"><span className="text-emerald-300 mt-1.5">●</span><span>{item}</span></li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-3xl border border-white/20 p-5 bg-white/10 backdrop-blur-xl">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 inline-flex items-center gap-2"><CircleDot className="text-violet-300" size={24} /> Detected Skills</h3>
                  <ul className="space-y-2 text-lg md:text-xl text-[#d7deea]">
                    {(skills.length ? skills : ['No explicit technical skills found in CV.']).map((item) => (
                      <li key={item} className="flex items-start gap-3"><span className="text-violet-300 mt-1.5">●</span><span>{item}</span></li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-3xl border border-white/20 p-5 bg-white/10 backdrop-blur-xl">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 inline-flex items-center gap-2"><LoaderCircle className="text-pink-300" size={24} /> Areas to Improve</h3>
                  <ul className="space-y-2 text-lg md:text-xl text-[#d7deea]">
                    {(improvements.length ? improvements : ['No major gaps detected from available CV text.']).map((item) => (
                      <li key={item} className="flex items-start gap-3"><span className="text-pink-300 mt-1.5">●</span><span>{item}</span></li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-3xl border border-white/20 p-5 bg-white/10 backdrop-blur-xl">
                <h3 className="text-2xl md:text-3xl font-semibold mb-3">Document Summary</h3>
                <p className="text-lg md:text-xl text-[#d7deea] leading-relaxed">{analysis?.summary || 'No summary was generated.'}</p>
                <p className="text-base text-cyan-300 mt-4">Document Type: {analysis?.classification || 'Unknown'}</p>
              </motion.div>

              <div className="mt-8 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-4 rounded-2xl text-xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)]"
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
