import { motion } from 'framer-motion'
import NeonButton from '../components/NeonButton'

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6 }}
        className="glass-card glass-card-hover p-10 max-w-4xl text-center"
      >
        <h1 className="font-['Space_Grotesk'] text-4xl md:text-6xl font-bold tracking-[-0.02em] mb-5 bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 text-transparent bg-clip-text">
          AI-Powered Document Intelligence
        </h1>
        <p className="text-lg md:text-xl text-[#A0AEC0] mb-8">Upload documents. Extract insights. Instantly.</p>
        <NeonButton onClick={onEnter} className="px-8 py-3 text-base">
          Upload Document
        </NeonButton>
      </motion.div>
    </section>
  )
}
