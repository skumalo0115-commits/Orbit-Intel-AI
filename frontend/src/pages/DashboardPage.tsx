import { DragEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, Upload } from 'lucide-react'
import DocumentCard from '../components/DocumentCard'
import AppFooter from '../components/AppFooter'
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

export default function DashboardPage({ onSelect }: { onSelect: (id: number) => void }) {
  const [docs, setDocs] = useState<DocumentItem[]>([])
  const [skills, setSkills] = useState('')
  const [interests, setInterests] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
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

  const onDropFile = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setCvFile(file)
      setError(null)
    }
  }

  const uploadCV = async () => {
    if (!cvFile) {
      setError('Please upload your CV before continuing.')
      return
    }

    setError(null)
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', cvFile)
      const response = await api.post<DocumentItem>('/upload', formData)
      setCvFile(null)
      await loadDocuments()
      onSelect(response.data.id)
    } finally {
      setIsUploading(false)
    }
  }

  const removeDocument = async (id: number) => {
    await api.delete(`/documents/${id}`)
    setDocs((prev) => prev.filter((doc) => doc.id !== id))
  }

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen pt-28 px-6 pb-10 overflow-hidden">
        <div className="absolute inset-0" style={bgStyle} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,217,255,0.16),transparent_48%)]" />

        <div className="relative z-10 max-w-[1280px] mx-auto">
          <div className="text-center mb-8">
            <motion.div className="mb-3 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
              <Brain className="text-cyan-300" size={46} />
            </motion.div>
            <h1 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold tracking-[-0.02em] bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent min-h-[60px] md:min-h-[78px]">
              {title}
            </h1>
            <p className="text-[#d2d9e7] text-lg md:text-xl mt-2">Next-generation career guidance powered by artificial intelligence</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.45 }} className="glass-card p-4 md:p-5 max-w-[760px] mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-violet-300" />
              <h2 className="text-3xl font-semibold">Enter Your Profile</h2>
            </div>

            <label className="block text-lg mb-2 text-white/90">Skills & Expertise</label>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full rounded-2xl border border-violet-400/45 bg-white/10 p-3 text-lg mb-3" placeholder="e.g., Python, JavaScript, React, Machine Learning..." />

            <label className="block text-lg mb-2 text-white/90">Interests & Passions</label>
            <textarea value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full h-28 rounded-2xl border border-violet-400/45 bg-white/10 p-3 text-lg mb-3" placeholder="e.g., Building innovative products, solving complex problems, working with data..." />

            <label className="block text-lg mb-2 text-white/90">Upload CV <span className="text-pink-300">(Required)</span></label>
            <label
              className={`w-full rounded-2xl border border-dashed p-4 text-center block cursor-pointer mb-3 transition ${isDragging ? 'border-cyan-300 bg-cyan-400/20' : 'border-violet-400/50 bg-cyan-500/10'}`}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDropFile}
            >
              <Upload className="inline mr-2" />
              {cvFile ? cvFile.name : 'Drop your CV here or click to browse'}
              <input type="file" className="hidden" onChange={(e) => { setCvFile(e.target.files?.[0] ?? null); setError(null) }} />
            </label>

            {error && <p className="text-pink-200 mb-3 text-base">{error}</p>}

            <motion.button
              onClick={uploadCV}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="w-full py-3 rounded-2xl text-lg font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-neon disabled:opacity-65 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading CV...' : 'Analyse Career Path'}
            </motion.button>
          </motion.div>

          <motion.div
            id="results"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.45 }}
            className={`mt-8 grid gap-4 ${docs.length === 1 ? 'grid-cols-1 max-w-[640px] mx-auto' : 'md:grid-cols-2'}`}
          >
            {docs.map((doc) => (
              <DocumentCard key={doc.id} filename={doc.filename} date={doc.upload_date} onAnalyse={() => onSelect(doc.id)} onDelete={() => removeDocument(doc.id)} />
            ))}
          </motion.div>
        </div>
      </section>

      <AppFooter />
    </div>
  )
}
