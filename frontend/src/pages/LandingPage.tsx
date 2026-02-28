import { motion, useScroll, useTransform } from 'framer-motion'
import { BrainCircuit, ChevronDown, Crosshair, Rocket, Sparkles, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

type CardProps = {
  icon: 'analysis' | 'precision' | 'growth'
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: CardProps) {
  const [mouse, setMouse] = useState({ x: 50, y: 50 })

  const Icon = icon === 'analysis' ? Sparkles : icon === 'precision' ? Crosshair : TrendingUp
  const color = icon === 'analysis' ? '#FACC15' : icon === 'precision' ? '#A855F7' : '#10B981'

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.96, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      whileHover={{ y: -10, scale: 1.03 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setMouse({ x, y })
      }}
      className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.03] backdrop-blur-xl p-8 min-h-[290px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
      style={{
        backgroundImage: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(0,217,255,0.2), transparent 35%), linear-gradient(135deg, rgba(124,58,237,0.12), rgba(0,0,0,0.35), rgba(0,217,255,0.1))`,
      }}
    >
      <Icon size={44} style={{ color }} className="mb-8" />
      <h3 className="text-5xl font-semibold mb-5">{title}</h3>
      <p className="text-[#bfc7d6] text-3xl leading-relaxed">{description}</p>
    </motion.div>
  )
}

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
    <div>
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

      <section className="relative px-8 lg:px-12 pb-24 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="font-['Space_Grotesk'] text-6xl md:text-7xl font-bold tracking-[-0.02em] bg-gradient-to-r from-violet-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent">
            Powered by Intelligence
          </h2>
          <p className="text-[#C5CFDD] text-2xl mt-4">Next-generation career guidance at your fingertips</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="analysis"
            title="AI Analysis"
            description="Advanced algorithms analyze your skills, interests, and market trends to find your perfect match."
            delay={0.05}
          />
          <FeatureCard
            icon="precision"
            title="Precision Matching"
            description="Get personalized career recommendations with accuracy scores based on your unique profile."
            delay={0.15}
          />
          <FeatureCard
            icon="growth"
            title="Growth Path"
            description="Receive a customized learning roadmap to bridge skill gaps and accelerate your career."
            delay={0.25}
          />
        </div>
      </section>
    </div>
  )
}
