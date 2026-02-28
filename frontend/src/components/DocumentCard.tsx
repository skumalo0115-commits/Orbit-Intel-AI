import { motion } from 'framer-motion'

interface DocumentCardProps {
  filename: string
  date: string
  onAnalyze: () => void
}

export default function DocumentCard({ filename, date, onAnalyze }: DocumentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="glass-card glass-card-hover p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <p className="font-semibold text-white">{filename}</p>
        <p className="text-xs text-[#A0AEC0] mt-1">Uploaded {new Date(date).toLocaleString()}</p>
        <p className="text-xs text-cyan-300 mt-2">Classification: Pending analysis</p>
        <p className="text-xs text-white/70">Summary preview: Analyze this file to generate AI insights.</p>
      </div>
      <button className="px-4 py-2 rounded-lg border border-cyan-300/50 text-cyan-200 shadow-neon hover:bg-cyan-400/15" onClick={onAnalyze}>
        Analyze
      </button>
    </motion.div>
  )
}
