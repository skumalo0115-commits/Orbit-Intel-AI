import { motion } from 'framer-motion'
import { Brain, Home, BarChart3 } from 'lucide-react'

interface NavbarProps {
  onHome: () => void
  onResults: () => void
  profileInitial: string
}

export default function Navbar({ onHome, onResults, profileInitial }: NavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5 }}
      className="glass-card h-[72px] px-6 flex justify-between items-center fixed top-4 left-4 right-4 z-50 border-b border-cyan-300/25"
    >
      <div className="flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}>
          <Brain className="text-violet-300" />
        </motion.div>
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">Orbit Intel-AI</h1>
      </div>

      <div className="flex items-center gap-6 text-xl text-white/85">
        <button onClick={onHome} className="flex items-center gap-2 hover:text-cyan-300 transition">
          <Home size={20} /> Home
        </button>
        <button onClick={onResults} className="flex items-center gap-2 hover:text-cyan-300 transition">
          <BarChart3 size={20} /> Results
        </button>
        <div className="w-10 h-10 rounded-full border border-cyan-300/50 bg-cyan-300/20 backdrop-blur-md flex items-center justify-center text-sm font-semibold text-white shadow-neon">
          {profileInitial}
        </div>
      </div>
    </motion.header>
  )
}
