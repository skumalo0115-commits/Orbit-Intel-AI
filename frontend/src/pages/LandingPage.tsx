import { motion, useScroll, useTransform } from 'framer-motion'
import { BrainCircuit, ChevronDown, Crosshair, Rocket, Sparkles, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

type MiniCardProps = {
  icon: 'analysis' | 'precision' | 'growth'
  title: string
  description: string
  delay: number
}

type CareerCardProps = {
  title: string
  description: string
  image: string
  tint: string
  delay: number
}

function MiniFeatureCard({ icon, title, description, delay }: MiniCardProps) {
  const Icon = icon === 'analysis' ? Sparkles : icon === 'precision' ? Crosshair : TrendingUp
  const color = icon === 'analysis' ? '#FACC15' : icon === 'precision' ? '#A855F7' : '#10B981'

  return (
    <motion.div
      initial={{ opacity: 0, y: 48, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.65, delay }}
      className="rounded-3xl border border-white/20 bg-white/[0.03] backdrop-blur-xl p-6 min-h-[210px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
    >
      <Icon size={34} style={{ color }} className="mb-5" />
      <h3 className="text-3xl font-semibold mb-3">{title}</h3>
      <p className="text-[#bfc7d6] text-xl leading-relaxed">{description}</p>
    </motion.div>
  )
}

function CareerPathCard({ title, description, image, tint, delay }: CareerCardProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  return (
    <motion.article
      initial={{ opacity: 0, y: 48, scale: 0.98, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12
        setMouse({ x, y })
      }}
      className="relative overflow-hidden rounded-3xl border border-white/15 min-h-[270px] md:min-h-[320px]"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        animate={{ scale: 1.12, x: mouse.x, y: mouse.y }}
        transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.6 }}
      />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0" style={{ background: tint }} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute bottom-7 left-7 z-10">
        <motion.h3
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.45, delay: delay + 0.08 }}
          className="text-5xl font-semibold"
        >
          {title}
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.45, delay: delay + 0.16 }}
          className="text-[#d7deea] text-2xl mt-2"
        >
          {description}
        </motion.p>
      </div>
    </motion.article>
  )
}

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const { scrollY } = useScroll()
  const scrollOpacity = useTransform(scrollY, [0, 90], [1, 0])
  const scrollYPos = useTransform(scrollY, [0, 90], [0, 20])
  const heroFadeToBlack = useTransform(scrollY, [0, 500], [0.35, 0.95])

  const bgStyle = useMemo(
    () => ({
      backgroundImage:
        "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1800&q=80')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }),
    []
  )

  return (
    <div className="bg-black">
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0" style={bgStyle} />
        <motion.div style={{ opacity: heroFadeToBlack }} className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.14),transparent_45%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-5xl"
        >
          <motion.div className="mb-6 flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
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

          <motion.div style={{ opacity: scrollOpacity, y: scrollYPos }} className="mt-5 flex flex-col items-center text-[#a0aec0]" animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
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
          <MiniFeatureCard
            icon="analysis"
            title="AI Analysis"
            description="Advanced algorithms analyze your skills and interests for precise guidance."
            delay={0.05}
          />
          <MiniFeatureCard
            icon="precision"
            title="Precision Matching"
            description="Get personalized career recommendations with confidence scoring."
            delay={0.15}
          />
          <MiniFeatureCard
            icon="growth"
            title="Growth Path"
            description="Receive a roadmap to bridge gaps and accelerate your direction."
            delay={0.25}
          />
        </div>
      </section>

      <section className="relative px-8 lg:px-12 pb-28 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="font-['Space_Grotesk'] text-6xl md:text-7xl font-bold tracking-[-0.02em] bg-gradient-to-r from-cyan-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
            Explore Career Paths
          </h2>
          <p className="text-[#C5CFDD] text-2xl mt-4">Discover opportunities across diverse industries</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-7">
          <CareerPathCard
            title="Tech & Engineering"
            description="Shape the future with cutting-edge technology"
            image="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(93,32,156,0.12), rgba(167,34,196,0.45))"
            delay={0.05}
          />
          <CareerPathCard
            title="Data & Analytics"
            description="Turn data into actionable insights"
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(18,69,138,0.12), rgba(28,126,175,0.45))"
            delay={0.13}
          />
          <CareerPathCard
            title="Business & Leadership"
            description="Lead teams and drive innovation"
            image="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(112,29,76,0.12), rgba(184,41,121,0.45))"
            delay={0.21}
          />
          <CareerPathCard
            title="Creative & Design"
            description="Bring visions to life through design"
            image="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80"
            tint="linear-gradient(180deg, rgba(81,26,121,0.12), rgba(123,52,183,0.45))"
            delay={0.29}
          />
        </div>
      </section>
    </div>
  )
}
