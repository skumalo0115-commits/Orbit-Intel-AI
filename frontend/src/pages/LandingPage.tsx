import { motion, useScroll, useTransform } from 'framer-motion'
import { BrainCircuit, ChevronDown, Rocket } from 'lucide-react'
import { useMemo } from 'react'

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const { scrollY } = useScroll()
  const scrollOpacity = useTransform(scrollY, [0, 90], [1, 0])
  const scrollYPos = useTransform(scrollY, [0, 90], [0, 20])

  const bgStyle = useMemo(
    () => ({
      backgroundImage:
        "linear-gradient(rgba(3,6,15,0.45), rgba(3,6,15,0.82)), url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1600&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }),
    []
  )

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0" style={bgStyle} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.16),transparent_45%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-5xl"
      >
        <motion.div
          className="mb-6 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-20 h-20 rounded-full border border-cyan-300/35 bg-cyan-300/10 flex items-center justify-center shadow-neon">
            <BrainCircuit className="text-cyan-300" size={46} />
          </div>
        </motion.div>

        <h1 className="font-['Space_Grotesk'] text-6xl md:text-8xl font-bold tracking-[-0.02em] leading-[1.03]">
          <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-400 bg-clip-text text-transparent">Your Future</span>
          <br />
          <span className="text-white">Starts Here</span>
        </h1>

        <p className="text-[#c5d0df] text-2xl max-w-4xl mx-auto mt-7 leading-relaxed">
          Discover your perfect career path with AI-powered insights. Transform your skills into opportunities.
        </p>

        <button
          onClick={onEnter}
          className="mt-12 inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_35px_rgba(124,58,237,0.65)] hover:scale-[1.03] transition font-semibold text-2xl"
        >
          Begin Your Journey <Rocket size={24} />
        </button>

        <motion.div
          style={{ opacity: scrollOpacity, y: scrollYPos }}
          className="mt-5 flex flex-col items-center text-[#a0aec0]"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <ChevronDown className="text-cyan-300" />
          <span className="text-xl">Scroll to explore</span>
        </motion.div>
      </motion.div>
    </section>
  )
}
