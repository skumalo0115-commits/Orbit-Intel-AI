import { motion } from 'framer-motion'
import NeonButton from '../components/NeonButton'

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card p-10 max-w-3xl text-center">
        <motion.h1
          className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-violet-300 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          NebulaGlass AI
        </motion.h1>
        <p className="text-white/70 mb-8">Futuristic AI document intelligence with glassmorphism UX.</p>
        <NeonButton onClick={onEnter}>Launch Dashboard</NeonButton>
      </div>
    </div>
  )
}
