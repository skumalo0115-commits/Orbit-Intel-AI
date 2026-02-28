import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Upload, Github, Linkedin, Facebook, Globe, MessageCircle, Mail } from 'lucide-react'
import DocumentCard from '../components/DocumentCard'
import api from '../services/api'

interface DocumentItem {
  id: number
  filename: string
  upload_date: string
}

function useTypingText(text: string, speed = 45) {
  const [value, setValue] = useState('')
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i += 1
      setValue(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])
  return value
}

function DashboardFooter() {
  const [email, setEmail] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    const subject = encodeURIComponent('Career insights newsletter subscription')
    const body = encodeURIComponent(`Please subscribe this email to career insights updates: ${email}`)
    window.location.href = `mailto:s.kumalo0115@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <footer className="border-t border-white/15 mt-10">
      <div className="max-w-[1280px] mx-auto px-8 lg:px-12 py-12">
        <div className="grid md:grid-cols-[1.3fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4"><Brain className="text-violet-400" /><h4 className="text-3xl font-semibold bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Orbit Intel-AI</h4></div>
            <p className="text-[#aab3c2] text-lg max-w-md">Empowering your future with intelligent career guidance powered by advanced AI technology.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a aria-label="GitHub" href="https://github.com/skumalo0115-commits" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Github /></a>
              <a aria-label="LinkedIn" href="https://www.linkedin.com/in/sbahle-kumalo-b4b498267" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Linkedin /></a>
              <a aria-label="Facebook" href="https://www.facebook.com/IssUrSlime" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Facebook /></a>
              <a aria-label="Portfolio" href="https://sbahle-kumalo-emerging-technologies.base44.app/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><Globe /></a>
              <a aria-label="WhatsApp" href="https://wa.me/27827744933" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-violet-600/25 border border-violet-400/40 flex items-center justify-center hover:scale-110 hover:shadow-neon transition"><MessageCircle /></a>
            </div>
          </div>
          <div>
            <h5 className="text-2xl font-semibold text-violet-300 mb-3">Company</h5>
            <ul className="text-[#aab3c2] space-y-2 text-lg"><li>About</li><li>Contact</li><li>Support</li></ul>
          </div>
          <div>
            <h5 className="text-2xl font-semibold text-violet-300 mb-3">Legal</h5>
            <ul className="text-[#aab3c2] space-y-2 text-lg"><li>Privacy</li><li>Terms</li><li>Security</li></ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#aab3c2] text-lg"><Mail size={18} /> Subscribe to our newsletter for career insights</div>
          <form onSubmit={submit} className="flex items-center gap-2 w-full md:w-auto">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Enter your email" className="bg-black/40 border border-violet-400/35 rounded-xl px-4 py-3 min-w-[260px] outline-none" />
            <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold shadow-neon">Subscribe</button>
          </form>
        </div>
      </div>
    </footer>
  )
}

export default function DashboardPage({ onSelect }: { onSelect: (id: number) => void }) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [skills, setSkills] = useState('')
  const [interests, setInterests] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const title = useTypingText('AI Career Intelligence System')

  const loadDocuments = async () => {
    const response = await api.get<DocumentItem[]>('/documents')
    setDocs(response.data)
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const bgStyle = useMemo(
    () => ({
      backgroundImage:
        "linear-gradient(rgba(5,8,18,0.62), rgba(5,8,18,0.72)), url('https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&w=2000&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }),
    []
  )

  const uploadCV = async () => {
    if (!cvFile) return
    const formData = new FormData()
    formData.append('file', cvFile)
    await api.post('/upload', formData)
    await loadDocuments()
  }

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen pt-28 px-6 pb-10 overflow-hidden">
        <div className="absolute inset-0" style={bgStyle} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,217,255,0.16),transparent_48%)]" />

        <div className="relative z-10 max-w-[1280px] mx-auto">
          <div className="text-center mb-8">
            <motion.div className="mb-3 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
              <Brain className="text-cyan-300" size={52} />
            </motion.div>
            <h1 className="font-['Space_Grotesk'] text-6xl md:text-8xl font-bold tracking-[-0.02em] bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent min-h-[90px] md:min-h-[120px]">
              {title}
            </h1>
            <p className="text-[#d2d9e7] text-2xl mt-2">Next-generation career guidance powered by artificial intelligence</p>
          </div>

          <div className="glass-card p-7 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-violet-300" />
              <h2 className="text-5xl font-semibold">Enter Your Profile</h2>
            </div>

            <label className="block text-2xl mb-2 text-white/90">Skills & Expertise</label>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full rounded-2xl border border-violet-400/45 bg-white/10 p-4 text-2xl mb-5" placeholder="e.g., Python, JavaScript, React, Machine Learning..." />

            <label className="block text-2xl mb-2 text-white/90">Interests & Passions</label>
            <textarea value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full h-40 rounded-2xl border border-violet-400/45 bg-white/10 p-4 text-2xl mb-5" placeholder="e.g., Building innovative products, solving complex problems, working with data..." />

            <label className="block text-2xl mb-2 text-white/90">Upload CV (Optional)</label>
            <label className="w-full rounded-2xl border border-dashed border-violet-400/50 bg-cyan-500/10 p-8 text-center block cursor-pointer mb-6">
              <Upload className="inline mr-2" /> Drop your CV here or click to browse
              <input type="file" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
            </label>

            <button onClick={uploadCV} className="w-full py-4 rounded-2xl text-2xl font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-neon">
              Analyze Career Path
            </button>
          </div>

          <div id="results" className="mt-8 grid md:grid-cols-2 gap-4">
            {docs.map((doc) => (
              <DocumentCard key={doc.id} filename={doc.filename} date={doc.upload_date} onAnalyze={() => onSelect(doc.id)} />
            ))}
          </div>
        </div>
      </section>

      <DashboardFooter />
    </div>
  )
}
