import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface DocumentCardProps {
  filename: string
  date: string
  onAnalyse: () => void
  onDelete: () => void
}

export default function DocumentCard({ filename, date, onAnalyse, onDelete }: DocumentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative glass-card glass-card-hover p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <button
        aria-label={`Remove ${filename}`}
        onClick={onDelete}
        className="absolute top-3 right-3 w-8 h-8 rounded-full border border-pink-300/45 bg-pink-500/20 text-pink-200 flex items-center justify-center hover:bg-pink-500/35 hover:scale-110 transition"
      >
        <X size={16} />
      </button>

      <div>
        <p className="font-semibold text-white text-2xl pr-10">{filename}</p>
        <p className="text-lg text-[#A0AEC0] mt-1">Uploaded {new Date(date).toLocaleString()}</p>
        <p className="text-lg text-cyan-300 mt-2">Classification: Pending analysis</p>
        <p className="text-lg text-white/70">Summary preview: Analyse this file to generate AI insights.</p>
      </div>
      <button className="px-5 py-3 rounded-xl border border-cyan-300/50 text-cyan-200 shadow-neon hover:bg-cyan-400/15 text-2xl" onClick={onAnalyse}>
        Analyse
      </button>
    </motion.div>
  )
}
