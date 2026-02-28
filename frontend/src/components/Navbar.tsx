import { motion } from 'framer-motion'
import NeonButton from './NeonButton'

export default function Navbar({ onLogout }: { onLogout: () => void }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6 }}
      className="glass-card h-[72px] px-6 flex justify-between items-center fixed top-4 left-4 right-4 z-50 border-b border-cyan-300/25"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-cyan-300/70 shadow-neon animate-pulseGlow" />
        <h1 className="font-['Space_Grotesk'] text-xl font-semibold tracking-tight">NebulaGlass AI</h1>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm text-white/75">
        <span>Dashboard</span>
        <span>Documents</span>
        <span>Analysis</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-white/30 bg-white/10" />
        <NeonButton onClick={onLogout}>Logout</NeonButton>
      </div>
    </motion.header>
  )
}
