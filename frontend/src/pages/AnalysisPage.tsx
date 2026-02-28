import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, BookOpen, CircleDot, Target, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppFooter from '../components/AppFooter'
import api from '../services/api'

interface Analysis {
  summary: string
  classification: string
  entities: { text: string; type: string }[]
  insights?: Record<string, unknown>
}

type MatchCard = {
  title: string
  score: number
  salary: string
  description: string
}

function InteractiveCard({ card, delay }: { card: MatchCard; delay: number }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -6, scale: 1.01 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30
        setMouse({ x, y })
      }}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      className="relative overflow-hidden rounded-3xl border border-white/20 p-7 bg-white/5 backdrop-blur-xl"
      style={{
        backgroundImage: `radial-gradient(circle at ${50 + mouse.x}% ${50 + mouse.y}%, rgba(0,217,255,0.18), transparent 40%), linear-gradient(160deg, rgba(147,51,234,0.18), rgba(15,23,42,0.72))`,
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-4xl font-semibold">{card.title}</h3>
        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-2xl">{card.score}%</span>
      </div>
      <div className="h-3 rounded-full bg-white/15 mb-5">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${card.score}%` }} />
      </div>
      <p className="text-[#d6ddef] text-2xl leading-relaxed">{card.description}</p>
      <div className="mt-6 text-emerald-300 text-3xl font-semibold inline-flex items-center gap-2">
        <TrendingUp size={26} /> {card.salary}
      </div>
    </motion.article>
  )
}

export default function AnalysisPage({ documentId }: { documentId: number }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      await api.post(`/analyze/${documentId}`)
      const response = await api.get<Analysis>(`/analysis/${documentId}`)
      setAnalysis(response.data)
    }
    run()
  }, [documentId])

  const cards = useMemo<MatchCard[]>(() => {
    const topEntity = analysis?.entities?.[0]?.text || 'AI/ML Engineer'
    const secondEntity = analysis?.entities?.[1]?.text || 'Full Stack Developer'
    const thirdEntity = analysis?.entities?.[2]?.text || 'Data Scientist'

    return [
      {
        title: topEntity,
        score: 95,
        salary: '$120K - $180K',
        description: 'Design and build modern AI-powered systems aligned to your strongest technical capabilities.',
      },
      {
        title: secondEntity,
        score: 88,
        salary: '$90K - $140K',
        description: 'Create end-to-end apps, APIs, and user experiences with strong engineering impact.',
      },
      {
        title: thirdEntity,
        score: 82,
        salary: '$100K - $160K',
        description: 'Extract actionable insights from complex datasets and deliver measurable business value.',
      },
    ]
  }, [analysis])

  const skillItems = analysis?.entities?.slice(0, 4).map((e) => e.text) ?? ['Cloud Computing (AWS/Azure)', 'Docker & Kubernetes', 'System Design', 'DevOps Practices']
  const learningPath = [
    'Complete advanced ML certification',
    'Build portfolio projects',
    'Contribute to open source',
    'Network with industry professionals',
  ]

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.4),transparent_58%)]" />

        <div className="relative z-10 max-w-[1380px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.4 }} className="text-center mb-10">
            <motion.div className="mb-3 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
              <Brain className="text-cyan-300" size={64} />
            </motion.div>
            <h1 className="font-['Space_Grotesk'] text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent">AI Career Intelligence System</h1>
            <p className="text-[#d2d9e7] text-2xl mt-3">Next-generation career guidance powered by artificial intelligence</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="mb-6 flex items-center gap-3">
            <Target className="text-cyan-300" size={38} />
            <h2 className="text-5xl font-semibold">Top Career Matches</h2>
          </motion.div>

          <div className="grid xl:grid-cols-3 gap-5 mb-6">
            {cards.map((card, idx) => (
              <InteractiveCard key={card.title} card={card} delay={idx * 0.08} />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-3xl border border-white/20 p-7 bg-white/10 backdrop-blur-xl">
              <h3 className="text-5xl font-semibold mb-5 inline-flex items-center gap-3"><CircleDot className="text-violet-300" /> Skills to Develop</h3>
              <ul className="space-y-3 text-3xl text-[#d7deea]">
                {skillItems.map((item) => (
                  <li key={item} className="flex items-start gap-3"><span className="text-cyan-300 mt-2.5">●</span><span>{item}</span></li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} className="rounded-3xl border border-white/20 p-7 bg-white/10 backdrop-blur-xl">
              <h3 className="text-5xl font-semibold mb-5 inline-flex items-center gap-3"><BookOpen className="text-pink-300" /> Learning Path</h3>
              <ol className="space-y-3 text-3xl text-[#d7deea]">
                {learningPath.map((item, idx) => (
                  <li key={item} className="flex items-start gap-3"><span className="w-10 h-10 rounded-full bg-violet-500/35 text-center leading-10 text-2xl">{idx + 1}</span><span>{item}</span></li>
                ))}
              </ol>
            </motion.div>
          </div>

          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="px-12 py-5 rounded-2xl text-4xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_35px_rgba(124,58,237,0.55)]"
            >
              Start New Analysis
            </motion.button>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  )
}
